import { Request, Response, NextFunction } from "express";
import userService from "../services/UserService";
import googleOAuthService from "services/GoogleOAuthService";


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
            const { userExists, isPasswordValid, token } = await userService.logIn(email, password);
            if (userExists === false) {
                res.status(401).json({ message: "user with this email does not exist." });
            }

            if (isPasswordValid === false) {
                res.status(401).json({ message: "password is invalid." });
            }

            if (userExists && isPasswordValid && token !== undefined) {
                res.setHeader("authorization", token).status(200).json({ message: "user was successfully logged in.", token });
            }
        }
        catch (error) {
            next(error);
        }
    }

    oauthGoogleUrl = async ({ res, next }: { res: Response, next: NextFunction }) => {
        try {
            res.status(200).json({ url: googleOAuthService.getGoogleOAuthUrl() });
        }
        catch (error) {
            next(error);
        }
    }

    oauthGoogle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const code = req.query.code as string;

            const { token } = await userService.oauthGoogle(code);

            const redirectUrl = process.env.FRONTEND_ORIGIN;

            if (token === undefined) {
                if (redirectUrl === undefined) {
                    return res.status(400).json({ message: "something went wrong during google oauth." });
                }
                return res.redirect(redirectUrl as string);
            }

            if (redirectUrl === undefined) {
                return res.status(200).json({ token, message: "user was successfully authorized." });
            }
            res.cookie("authorization", token).redirect(`${redirectUrl}`);
        }
        catch (error) {
            next(error);
        }
    }

    getUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const user = await userService.getUser(token!);
            res.status(200).json(user);
        }
        catch (error) {
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

            await userService.changePassword(token!, password);

            res.status(200).json({ message: "user password was successfully changed." });
        }
        catch (error) {
            next(error);
        }
    }

    changeSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.headers);
            console.log(req.header("Origin"));
            const subscriptionId = Number(req.body.subscriptionId);
            const token = req.headers.authorization;

            await userService.changeSubscription(token!, subscriptionId);
            res.status(200).json({ message: "subscription was successfully changed." })
        }
        catch (error) {
            next(error);
        }
    }

    addQuestions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quantity = req.body.quantity;
            const token = req.headers.authorization;
            await userService.addQuestions(token!, quantity);
            res.status(200).json({ message: "questions were added successfully." });
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

            const messages = await userService.getMessagesByFamousPerson(famousPersonName, token!);
            res.status(200).json(messages);
        }
        catch (error) {
            next(error);
        }
    }

    answerMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const message = req.body.message;
            const famousPersonName = req.body.famousPersonName;

            const { isQuestionAllowed, isLimitReached, answer } = await userService.answerMessage(token, message, famousPersonName);
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
