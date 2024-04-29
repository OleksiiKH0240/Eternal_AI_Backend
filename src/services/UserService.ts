import userRep from "../database/repositories/UserRep";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwtDataGetters from "../utils/jwtDataGetters";
import chatGptService from "./ChatGptService";
import crypto from "crypto";
// import pupputeer from "puppeteer";
import jsdom from "jsdom";
import unauthUserRep from "database/repositories/UnauthUserRep";
import nodemailer from "nodemailer";


const { GMAIL_MAILER_HOST, GMAIL_MAILER_PORT, GMAIL_MAILER_USERNAME, GMAIL_MAILER_PASSWORD } = process.env;
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: GMAIL_MAILER_HOST,
    port: Number(GMAIL_MAILER_PORT),
    secure: false,
    auth: {
        user: GMAIL_MAILER_USERNAME,
        pass: GMAIL_MAILER_PASSWORD
    }
});

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

    sendOtp = async (email: string) => {
        const user = await userRep.getUserByEmail(email);

        if (user === undefined) {
            return { userExists: false };
        }
        else {
            const { otp, otpExpiredTimestamp } = this.generateOtp();
            await userRep.changeOtp(user.userId, otp, otpExpiredTimestamp);

            const info = await transporter.sendMail({
                from: { name: "Eternal Ai", address: `${GMAIL_MAILER_USERNAME}` },
                to: email,
                subject: "Eternal Ai OTP for password recover",
                text: `your OTP: ${otp}`,
            });

            return { userExists: true };
            // console.log(info);
            // console.log("otp email was sent, ", info.messageId);
        }


    }

    generateOtp = () => {
        const otp = String(Math.min(Math.floor(100000 + Math.random() * 900000), 999999));

        const OTP_TTL = Number(process.env.OTP_TTL);
        const otpExpiredTimestamp = new Date(Date.now() + (OTP_TTL * 1000))

        return { otp, otpExpiredTimestamp, OTP_TTL }
    }

    checkOtp = async (email: string, submittedOtp: string) => {
        const user = await userRep.getUserByEmail(email);
        if (user === undefined) {
            return { userExists: false };
        }
        else {
            const { userId, otp, otpExpiredTimestamp } = user;

            if (otp !== null && otpExpiredTimestamp !== null) {
                const now = new Date();
                if (now <= otpExpiredTimestamp) {
                    if (submittedOtp === otp) {
                        await userRep.changeOtp(userId, null, null);
                        
                        const ttl = Number(process.env.JWT_TTL);
                        const JWT_SECRET = String(process.env.JWT_SECRET);
                        const options = (user.subscriptionId === -1) ? {} : { expiresIn: ttl };

                        const token = jwt.sign(
                            {
                                userId: user.userId,
                            },
                            JWT_SECRET, options);

                        return { isOtpSent: true, isExpired: false, isValid: true, token };
                    }
                    else {
                        return { isOtpSent: true, isExpired: false, isValid: false };
                    }
                }
                else {
                    return { isOtpSent: true, isExpired: true };
                }
            }
            else {
                return { isOtpSent: false };
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

    changePassword = async (token: string | undefined, userId: number | undefined, password: string) => {
        if (userId === undefined) {
            userId = jwtDataGetters.getUserId(token!);
        }

        const saltRounds = Number(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await userRep.changePasswordByUserId(userId, hashedPassword);
    }

    changeSubscription = async (
        userId: number,
        subscriptionId?: number,
        subscriptionExpireDate?: Date,
        cancelSubscriptionAtPeriodEnd?: boolean) => {
        if (userId !== undefined) {
            if (subscriptionId === 1) {
                await userRep.changeSubscriptionByUserId({
                    userId,
                    subscriptionId,
                    cancelSubscriptionAtPeriodEnd: false,
                    subscriptionExpireDate
                });

                // const now = new Date();
                // const nowPlus1Mon = new Date(now.setMonth(now.getMonth() + 1));
                // const nowPlus1Mon = new Date(now.setMinutes(now.getMinutes() + 1));
                // await userRep.changeSubscriptionExpireDateByUserId(userId!, subscriptionExpireDate!);
            }

            if (subscriptionId === 0) {
                await userRep.changeSubscriptionByUserId({
                    userId,
                    subscriptionId,
                    subscriptionExpireDate: null,
                    cancelSubscriptionAtPeriodEnd: null
                });
                // await userRep.changeSubscriptionExpireDateByUserId(userId!, null);
            }

            if (subscriptionId === undefined && cancelSubscriptionAtPeriodEnd === true) {
                await userRep.changeSubscriptionByUserId({ userId, cancelSubscriptionAtPeriodEnd });
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
        let browser;
        try {
            // browser = await pupputeer.launch({ args: ["--no-sandbox"] });
            // const page = await browser.newPage();

            // const res = await page.goto(shareUrl, { waitUntil: "domcontentloaded" });
            // await page.waitForNetworkIdle();

            const res = await fetch(shareUrl);
            // if (res === null) {
            //     return { isUrlValid: false };
            // }
            const { JSDOM } = jsdom;
            const dom = new JSDOM(await res.arrayBuffer());
            // dom.window.document.body.


            const urlText = await res?.text();
            // console.log(urlText);

            const { FRONTEND_ORIGIN } = process.env;
            const encodedFrontendOrigin = encodeURIComponent(FRONTEND_ORIGIN!);

            const regexp = new RegExp(`${encodedFrontendOrigin}|${FRONTEND_ORIGIN?.replace("https://", "https:\/\/")}`);
            console.log(regexp);

            const index = String(urlText).search(regexp);
            if (index === -1) {
                return { isUrlValid: false };
            }

            // await browser.close();
            return { isUrlValid: true };
        }
        catch (error) {
            // await browser?.close();
            console.log(error);
            return { isUrlValid: false };
        }
    }

    getMessagesByFamousPerson = async (famousPersonName: string, token: string, page: number, limit: number) => {
        const userId = jwtDataGetters.getUserId(token);
        const offset = (page - 1) * limit;
        const messages = await userRep.getMessagesByFamousPerson(famousPersonName.toUpperCase(), userId, offset, limit);
        return messages;
    }

    answerMessage = async (token: string | undefined, message: string, famousPersonName: string, ipV4UserAgentToken?: string) => {
        // const noRegMsgs = [
        //     "What did you want to be when you grew up?",
        //     "What is the meaning of life?",
        //     "What is your greatest accomplishment?"
        // ];
        const regMaxQuestionsCount = 5;
        const unauthMaxQuestionsCount = 3;

        const {
            description: famousPersonDescription,
            famousPersonId
        } = await userRep.getFamousPersonByName(famousPersonName.toUpperCase());

        if (token === undefined) {
            // if (!noRegMsgs.includes(message)) {
            //     return { isQuestionAllowed: false }
            // }
            const { ipV4, userAgent } = jwtDataGetters.getIpV4UserAgent(ipV4UserAgentToken!);

            let unauthUser = await unauthUserRep.getUser(ipV4, userAgent);
            if (unauthUser === undefined) {
                unauthUser = await unauthUserRep.addUser(ipV4, userAgent);
            }
            else {
                if (unauthUser.questionsCount >= unauthMaxQuestionsCount) {
                    return { isLimitReached: true };
                }
            }

            const answer = await chatGptService.answerMessages([
                { fromUser: true, content: message },
            ], famousPersonName, famousPersonDescription);

            await unauthUserRep.changeQuestionsCount(ipV4, userAgent, unauthUser.questionsCount + 1);

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
