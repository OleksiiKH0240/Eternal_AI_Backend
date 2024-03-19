import userRep from "../database/repositories/UserRep";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwtDataGetters from "../utils/jwtDataGetters";
import chatGptService from "./ChatGptService";
import crypto from "crypto";
import axios from "axios";


class UserService {
    signUp = async (email: string, password: string, name?: string) => {
        const user = await userRep.getUserByEmail(email);
        if (user === undefined) {
            const saltRounds = Number(process.env.SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const { userId } = await userRep.addUser(email, hashedPassword, name);

            return {
                UserExists: false,
                userId
            }
        }
        else {
            return {
                UserExists: true,
                userId: user.userId
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
                const options = (user.subscriptionId === -1) ? {} : { expiresIn: ttl };

                const token = jwt.sign(
                    {
                        userId: user.userId,
                        // subscriptionId: user.subscriptionId
                    },
                    JWT_SECRET, options);

                const {
                    password, hasShareBonus, questionsCount, stripeCustomerId, ...userInfo
                } = user;

                return {
                    userExists: true,
                    isPasswordValid: true,
                    token,
                    userInfo
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

    oauthGoogle = async (googleUserToken: string) => {
        const googleUser = jwtDataGetters.getGoogleUser(googleUserToken);

        let user = await userRep.getUserByEmail(googleUser.email);
        let userId: number;
        if (user === undefined) {
            const tempPassword = crypto.randomBytes(12).toString("hex");
            user = await userRep.addUser(googleUser.email, tempPassword, googleUser.name);
            userId = user.userId;
        }
        else {
            userId = user.userId;
        }

        const {
            password, hasShareBonus, questionsCount, stripeCustomerId, ...userInfo
        } = user;

        const ttl = Number(process.env.JWT_TTL);
        const JWT_SECRET = String(process.env.JWT_SECRET);
        const token = jwt.sign(
            {
                userId
            },
            JWT_SECRET, { expiresIn: ttl });

        return {
            token, userInfo
        };
    }

    getUser = async (token: string) => {
        const userId = jwtDataGetters.getUserId(token);
        const { hasShareBonus, password, questionsCount, stripeCustomerId, ...user } = await userRep.getUserByUserId(userId);
        return user;
    }

    changeUser = async (token: string, name?: string, phone?: string, email?: string, password?: string) => {
        const userId = jwtDataGetters.getUserId(token);
        let isEmailOccupied = false;
        if (email !== undefined) {
            const user = await userRep.getUserByEmail(email);
            if (user !== undefined) {
                isEmailOccupied = true;
            }
        }

        let hashedPassword: string | undefined;
        if (password !== undefined) {
            const saltRounds = Number(process.env.SALT_ROUNDS);
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        const modUserInfo = await userRep.changeUserById(
            userId,
            name,
            phone,
            (isEmailOccupied === true ? undefined : email),
            hashedPassword
        );

        return {
            "name": name === undefined ? name : modUserInfo.name,
            "phone": phone === undefined ? phone : modUserInfo.phone,
            "email": email === undefined && isEmailOccupied === false ? email : modUserInfo.email,
            isEmailOccupied
        };
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

    changeSubscription = async (subscriptionId: number, userId?: number) => {
        if (userId !== undefined) {
            await userRep.changeSubscriptionByUserId(userId!, subscriptionId);
            if (subscriptionId === 1) {
                const now = new Date();
                const nowPlus1Mon = new Date(now.setMonth(now.getMonth() + 1));
                // const nowPlus1Mon = new Date(now.setMinutes(now.getMinutes() + 1));
                await userRep.changeSubscriptionExpireDateByUserId(userId!, nowPlus1Mon);
            }

            if (subscriptionId === 0) {
                await userRep.changeSubscriptionByUserId(userId!, subscriptionId);
                await userRep.changeSubscriptionExpireDateByUserId(userId!, null);
            }
        }
    }

    shareBonus = async (token: string, quantity: number, shareUrl: string) => {
        const userId = jwtDataGetters.getUserId(token);
        const { hasShareBonus, questionsCount } = await userRep.getUserByUserId(userId);

        if (hasShareBonus === false) {
            return { hasShareBonus };
        }

        const { isUrlValid } = await this.checkShareUrl(shareUrl);

        if (isUrlValid) {
            await userRep.changeQuestionsCountByUserId(userId, questionsCount - quantity);
            await userRep.changeHasShareBonusByUserId(userId, false);
            return { isShareBonusGranted: true }
        }
        else {
            return { isUrlValid }
        }
    }

    checkShareUrl = async (shareUrl: string) => {
        return { isUrlValid: true };
        try {
            const res = await axios.get(shareUrl);
            const { FRONTEND_ORIGIN } = process.env;
            const index = String(res.data).search(FRONTEND_ORIGIN!);
            if (index === -1) {
                return { isUrlValid: false };
            }
            return { isUrlValid: true };
        }
        catch (error) {
            return { isUrlValid: false };
        }
    }

    getMessagesByFamousPerson = async (famousPersonName: string, token: string, page: number, limit: number) => {
        const userId = jwtDataGetters.getUserId(token);
        const offset = (page - 1) * limit;
        const messages = await userRep.getMessagesByFamousPerson(famousPersonName.toUpperCase(), userId, offset, limit);
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

            if (user.subscriptionId === 1 && user.subscriptionExpireDate! < new Date()) {
                // TODO: I already have had stripe webhook to cancel subscription whether it was not paid, so maybe this part is irrelevant. 
                user.subscriptionId = 0;
                await this.changeSubscription(0, userId);
                // await userRep.changeSubscriptionByUserId(userId, 0);
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
