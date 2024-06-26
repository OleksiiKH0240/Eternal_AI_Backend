import { Request, Response, NextFunction } from "express";
import userService from "../services/UserService";
import googleOAuthService from "services/GoogleOAuthService";
import stripeSevice from "services/StripeSevice";
import jwtDataGetters from "utils/jwtDataGetters";


class ClientController {
    signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const { UserExists } = await userService.signUp(email, password);
            if (UserExists) {
                res.status(400).json({ message: "user with this email already exists." })
            }
            else {
                res.status(200).json({ message: "user was signed up successfully." })
            }
        }
        catch (error) {
            next(error);
        }
    }

    logIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const { userExists, isPasswordValid, token, userInfo } = await userService.logIn(email, password);
            if (userExists === false) {
                res.status(401).json({ message: "user with this email does not exist." });
            }

            if (isPasswordValid === false) {
                res.status(401).json({ message: "password is invalid." });
            }

            if (userExists && isPasswordValid && token !== undefined) {
                res.setHeader("authorization", token).status(200).json({ message: "user was successfully logged in.", token, userInfo });
            }
        }
        catch (error) {
            next(error);
        }
    }

    sendOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email;

            const { userExists } = await userService.sendOtp(email);
            if (userExists === false) {
                return res.status(400).json({ message: "user with this email does not exist." });
            }

            res.status(200).json({ message: "otp was sent." });
        }
        catch (error) {
            next(error);
        }
    }

    checkOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email;
            const submittedOtp = req.body.submittedOtp;

            const { userExists, isOtpSent, isExpired, isValid, token } = await userService.checkOtp(email, submittedOtp);
            if (userExists === false) {
                return res.status(400).json({ message: "user with this email does not exist." });
            }

            if (isOtpSent) {
                if (isExpired) {
                    res.status(400).json({ message: "otp was expired." });
                }
                else {
                    if (isValid) {
                        res.status(200).json({ message: "otp is valid.", token });
                    }
                    else {
                        res.status(400).json({ message: "otp is invalid." });
                    }
                }
            }
            else {
                res.status(400).json({ message: "otp was not sent." });
            }
        }
        catch (error) {
            next(error);
        }
    }


    // oauthGoogleUrl = async ({ res, next }: { res: Response, next: NextFunction }) => {
    //     try {
    //         res.status(200).json({ url: googleOAuthService.getGoogleOAuthUrl() });
    //     }
    //     catch (error) {
    //         next(error);
    //     }
    // }

    oauthGoogle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const googleUserToken = req.body.user;

            const { token, userInfo } = await userService.oauthGoogle(googleUserToken!);

            return res.status(200).json({ message: "user was successfully authorized.", token, userInfo });
        }
        catch (error) {
            next(error);
        }
    }

    getUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // console.log("body", req.body);
            // console.log("ip", req.socket.remoteAddress);
            // console.log("headers", req.headers);
            const token = req.headers.authorization;
            const user = await userService.getUser(token!);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }

    changeUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const { name, phone, email, password } = req.body;

            const {
                isEmailOccupied,
                name: modName,
                phone: modPhone,
                email: modEmail
            } = await userService.changeUser(token!, name, phone, email, password);

            if (isEmailOccupied === true) {
                return res.status(200).json({
                    message: "email is occupied by another user, other user data was successfully changed.",
                    isEmailOccupied,
                    name: modName, phone: modPhone, email: modEmail
                });
            }

            res.status(200).json({
                message: "user data was successfully changed.",
                name: modName, phone: modPhone, email: modEmail
            });
        } catch (error) {
            next(error);
        }
    }

    changeName = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const name = req.body.name;

            await userService.changeName(token!, name);
            res.status(200).json({ message: "user name was successfully changed." });

        }
        catch (error) {
            next(error);
        }
    }

    changePhone = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const phone = req.body.phone;

            await userService.changePhone(token!, phone);
            res.status(200).json({ message: "user phone was successfully changed." });

        }
        catch (error) {
            next(error);
        }
    }

    changeEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const email = req.body.email;

            const { isEmailOccupied } = (await userService.changeEmail(token!, email));
            if (isEmailOccupied === true) {
                res.status(400).json({ message: "this email is occupied by another user." });
            }
            else {
                res.status(200).json({ message: "email was successfully changed." });
            }
        }
        catch (error) {
            next(error);
        }
    }

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const password = req.body.password;

            await userService.changePassword(token!, undefined, password);

            res.status(200).json({ message: "user password was successfully changed." });
        }
        catch (error) {
            next(error);
        }
    }

    // changeSubscription = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         console.log(req.headers);
    //         console.log(req.header("Origin"));
    //         const subscriptionId = Number(req.body.subscriptionId);
    //         const token = req.headers.authorization;

    //         await userService.changeSubscription(subscriptionId, token!);
    //         res.status(200).json({ message: "subscription was successfully changed." })
    //     }
    //     catch (error) {
    //         next(error);
    //     }
    // }

    // getStripeSessionUrl = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const token = req.headers.authorization;
    //         const { paymentMethod } = await stripeSevice.createCheckoutSession(token!);
    //         res.status(200).json(paymentMethod);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    createSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const subscription = await stripeSevice.createSubscription(token!);
            res.json(subscription);
        }
        catch (error) {
            next(error);
        }
    }

    cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const { isCanceled, Exists, user } = await stripeSevice.cancelSubscriptionByUser(token!);
            if (Exists === true && isCanceled === true) {
                res.status(200).json({ user, message: "subscription was canceled successfully." });
            }
            else {
                res.status(400).json({ message: "you have no subscription to cancel." });
            }
        }
        catch (error) {
            next(error);
        }
    }

    getSetupIntentSecret = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const { customerExists, clientSecret } = await stripeSevice.getSetupIntentSecret(token!);

            if (customerExists === false) {
                res.status(400).json({ message: "customerId is not specified for your user." });
            }
            if (customerExists === true && clientSecret !== undefined) {
                res.status(200).json({ clientSecret });
            }
        }
        catch (error) {
            next(error);
        }
    }

    // changePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const token = req.headers.authorization;
    //         const paymentMethodId = req.body.paymentMethodId;

    //         const { customerExists, isSuccessfull } = await stripeSevice.changeCustomerPaymentMethod(token!, paymentMethodId);

    //         if (customerExists === false) {
    //             res.status(400).json({ message: "customerId is not specified for your user." });
    //         }

    //         if (customerExists === true && isSuccessfull === true) {
    //             res.status(200).json({ message: "customer default payment method was successfully changed." });
    //         }
    //         else if (isSuccessfull === false) {
    //             res.status(400).json({ message: "customer default payment method was not changed." });
    //         }
    //     }
    //     catch (error) {
    //         next(error);
    //     }
    // }

    shareBonus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quantity = 3;
            const shareUrl = req.body.shareUrl;
            const token = req.headers.authorization;

            const { hasShareBonus, isUrlValid, isShareBonusGranted } = await userService.shareBonus(token!, quantity, shareUrl);

            if (hasShareBonus === false) {
                return res.status(400).json({ message: "share bonus has already been granted once." });
            }

            if (isUrlValid === false) {
                return res.status(400).json({ message: "shareUrl is invalid." });
            }

            if (isShareBonusGranted === true) {
                res.status(200).json({ message: "questions were added successfully." });
            }

        }
        catch (error) {
            next(error);
        }
    }

    getMessagesByFamousPerson = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            // console.log(req.query);
            const famousPersonName = String(req.query["famous-person-name"]).toUpperCase();
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const messages = await userService.getMessagesByFamousPerson(famousPersonName, token!, page, limit);
            res.status(200).json(messages);
        }
        catch (error) {
            next(error);
        }
    }

    answerMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const { message, famousPersonName } = req.body;

            // const { ipV4, userAgent } = req.body;
            const { ipV4UserAgentToken } = req.body;
            console.log("1");

            const { isQuestionAllowed, isLimitReached, answer } = await userService.answerMessage(token, message, famousPersonName, ipV4UserAgentToken);

            console.log(isQuestionAllowed, isLimitReached, answer);
            if (isQuestionAllowed === false) {
                return res.status(400).json({ message: "your message is not allowed." });
            }

            if (isLimitReached === true) {
                return res.status(400).json({ message: "you reached your free account messages limit." });
            }

            if (answer === null) {
                return res.status(200).json({ answer: null, message: "chat gpt couldn't answer the question." });
            }

            if (answer !== undefined) {
                res.status(200).json({ answer });
            }

        }
        catch (error) {
            next(error);
        }
    }
}

export default new ClientController();
