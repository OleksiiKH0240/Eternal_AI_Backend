import userRep from "../database/repositories/UserRep";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwtDataGetters from "../utils/jwtDataGetters";
import chatGptService from "./ChatGptService";
import googleOAuthService from "./GoogleOAuthService";


class UserService {
    signUp = async (email: string, password: string, name?: string) => {
        const user = await userRep.getUserByEmail(email);
        if (user === undefined) {
            const saltRounds = Number(process.env.SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await userRep.addUser(email, hashedPassword, name);

            return {
                UserExists: false
            }
        }
        else {
            return {
                UserExists: true
            }
        }
    }

    logIn = async (email: string, password: string) => {
        const user = await userRep.getUserByEmail(email);
        if (user !== undefined) {
            let isPasswordValid: boolean;
            if (user.password.match(/^\d+/) !== null) {
                // test users case
                isPasswordValid = user.password === password ? true : false;
            }
            else {
                isPasswordValid = await bcrypt.compare(password, user.password);
            }

            if (isPasswordValid) {
                const ttl = Number(process.env.JWT_TTL);
                const JWT_SECRET = String(process.env.JWT_SECRET);
                const token = jwt.sign(
                    {
                        userId: user.userId
                    },
                    JWT_SECRET, { expiresIn: ttl });
                return {
                    userExists: true,
                    isPasswordValid: true,
                    token
                }
            }
            else {
                return {
                    userExists: true,
                    isPasswordValid: false,
                    token: undefined
                }
            }
        }
        else {
            return {
                userExists: false,
                isPasswordValid: undefined,
                token: undefined
            }
        }
    }

    oauthGoogle = async (code: string) => {
        let id_token;
        try {
            ({ id_token } = await googleOAuthService.getGoogleOAuthTokens(code));
        }
        catch (error) {
            console.log(error);
            return { id_token: undefined };
        }
        const { email, name, password } = googleOAuthService.getUserFromIdToken(id_token);

        const user = await userRep.getUserByEmail(email);
        let userId: number;
        if (user === undefined) {
            ({ userId } = await userRep.addUser(email, password, name));
        }
        else {
            userId = user.userId;
        }

        const ttl = Number(process.env.JWT_TTL);
        const JWT_SECRET = String(process.env.JWT_SECRET);
        const token = jwt.sign(
            {
                userId
            },
            JWT_SECRET, { expiresIn: ttl });

        return {
            token
        };
    }

    getUser = async (token: string) => {
        const userId = jwtDataGetters.getUserId(token);
        const { password, ...user } = await userRep.getUserByUserId(userId);
        return user;
    }

    changeName = async (token: string, name: string) => {
        const userId = jwtDataGetters.getUserId(token);
        await userRep.changeNameByUserId(userId, name);
    }

    changePhone = async (token: string, phone: string) => {
        const userId = jwtDataGetters.getUserId(token);
        await userRep.changePhoneByUserId(userId, phone);
    }

    changeEmail = async (token: string, email: string) => {
        const userId = jwtDataGetters.getUserId(token);
        const user = await userRep.getUserByEmail(email);
        if (user === undefined) {
            await userRep.changeEmailByUserId(userId, email);
            return { isEmailOccupied: false };
        }
        else {
            return { isEmailOccupied: true };
        }

    }

    changePassword = async (token: string, password: string) => {
        const userId = jwtDataGetters.getUserId(token);

        const saltRounds = Number(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await userRep.changePasswordByUserId(userId, hashedPassword);
    }

    changeSubscription = async (token: string, subscriptionId: number) => {
        const userId = jwtDataGetters.getUserId(token);

        await userRep.changeSubscriptionByUserId(userId, subscriptionId);
        if (subscriptionId === 1) {
            const now = new Date();
            const nowPlus1Mon = new Date(now.setMonth(now.getMonth() + 1));
            // const nowPlus1Mon = new Date(now.setMinutes(now.getMinutes() + 1));
            await userRep.changeSubscriptionExpireDateByUserId(userId, nowPlus1Mon);
        }
    }

    addQuestions = async (token: string, quantity: number) => {
        const userId = jwtDataGetters.getUserId(token);
        const { questionsCount } = await userRep.getUserByUserId(userId);
        await userRep.changeQuestionsCountByUserId(userId, questionsCount - quantity);
    }

    getMessagesByFamousPerson = async (famousPersonName: string, token: string) => {
        const userId = jwtDataGetters.getUserId(token);
        const messages = await userRep.getMessagesByFamousPerson(famousPersonName.toUpperCase(), userId);
        return messages;
    }

    answerMessage = async (token: string | undefined, message: string, famousPersonName: string) => {
        const noRegMsgs = [
            "What did you want to be when you grew up?",
            "What is the meaning of life?",
            "What is your greatest accomplishment?"
        ];
        const regMaxQuestionsCount = 5;

        const {
            description: famousPersonDescription,
            famousPersonId
        } = await userRep.getFamousPersonByName(famousPersonName.toUpperCase());

        if (token === undefined) {
            if (!noRegMsgs.includes(message)) {
                return { isQuestionAllowed: false }
            }
            const answer = await chatGptService.answerMessages([
                { fromUser: true, content: message },
            ], famousPersonName, famousPersonDescription);

            return { isQuestionAllowed: true, answer };
        }
        else {
            const userId = jwtDataGetters.getUserId(token);
            const user = await userRep.getUserByUserId(userId);

            if (user.subscriptionId === 1 && user.subscriptionExpireDate < new Date()) {
                user.subscriptionId = 0;
                await userRep.changeSubscriptionByUserId(userId, 0);
            }

            if (user.subscriptionId === 0) {
                if (user.questionsCount >= regMaxQuestionsCount) {
                    return { isLimitReached: true };
                }

                await userRep.changeQuestionsCountByUserId(userId, user.questionsCount + 1);
            }

            // if user.subscriptionId === 1 or if limit was not reached

            const messages = (await userRep.getMessagesByFamousPerson(famousPersonName, userId)).
                map(({ fromUser, content }) => ({ fromUser, content }));
            messages.push({ fromUser: true, content: message });

            const answer = await chatGptService.answerMessages(messages, famousPersonName, famousPersonDescription);

            if (answer === null) {
                return { isQuestionAllowed: true, isLimitReached: false, answer };
            }

            await userRep.addMessageByFamousPersonId(famousPersonId, userId, true, message);
            await userRep.addMessageByFamousPersonId(famousPersonId, userId, false, answer);

            return { isQuestionAllowed: true, isLimitReached: false, answer };
        }
    }
}

export default new UserService();
