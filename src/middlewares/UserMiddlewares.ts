import { Request, Response, NextFunction } from "express";
import userRep from "database/repositories/UserRep";
import jwt from "jsonwebtoken";
import jwtDataGetters from "utils/jwtDataGetters";


class UserMiddlewares {
    validateAuth = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "some of these fields: email or password have invalid type. " })
        }
        next();
    }

    validateCheckOtp = async (req: Request, res: Response, next: NextFunction) => {
        const { email, submittedOtp } = req.body;
        if (typeof email !== "string" || typeof submittedOtp !== "string") {
            return res.status(400).json({ message: "some of these fields: email, submittedOtp have invalid type. " });
        }
        next();
    }

    validateSendOtp = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        if (typeof email !== "string") {
            return res.status(400).json({ message: "field email has invalid type. " });
        }
        next();
    }

    validateChangeSubscription = async (req: Request, res: Response, next: NextFunction) => {
        const { subscriptionId } = req.body;
        if (typeof subscriptionId !== "number" || !Number.isInteger(subscriptionId) || subscriptionId < 0) {
            return res.status(400).json({ message: "field subscriptionId has invalid type or is less than zero. " })
        }
        next();
    }

    // validateChangePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    //     const { paymentMethodId } = req.body;

    //     if (paymentMethodId === undefined) {
    //         return res.status(400).json({ message: "field paymentMethodId is not specified in request body." });
    //     }

    //     next();
    // }

    validateShareBonus = async (req: Request, res: Response, next: NextFunction) => {
        const { shareUrl } = req.body;
        if (typeof shareUrl !== "string") {
            return res.status(400).json({ message: "field shareUrl has invalid type. " })
        }
        next();
    }

    validateChangeUser = async (req: Request, res: Response, next: NextFunction) => {
        const { name, phone, email, password } = req.body;
        if (name === undefined && phone === undefined && email === undefined && password === undefined) {
            return res.status(200).json({ message: "no data was specified. " });
        }

        if (
            !["string", "undefined"].includes(typeof name) ||
            !["string", "undefined"].includes(typeof phone) ||
            !["string", "undefined"].includes(typeof email) ||
            !["string", "undefined"].includes(typeof password)
        ) {
            return res.status(400).json({ message: "some of these fields: name, phone, email, password have invalid type. " })
        }

        next();
    }

    validateGetMessages = async (req: Request, res: Response, next: NextFunction) => {
        const { "famous-person-name": famousPersonName } = req.query;
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);

        if (famousPersonName === undefined) {
            return res.status(400).json({ message: "field famous-person-name is unspecified. " });
        }

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({ message: "field page has invalid type, is unspecified or is less than one. " });
        }

        if (!Number.isInteger(limit) || limit < 1) {
            return res.status(400).json({ message: "field limit has invalid type, is unspecified or is less than one. " });
        }

        next();
    }

    validateChangeName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body;
        if (typeof name !== "string") {
            return res.status(400).json({ message: "field name has invalid type. " });
        }
        next();
    }

    validateChangePhone = async (req: Request, res: Response, next: NextFunction) => {
        const { phone } = req.body;
        if (typeof phone !== "string") {
            return res.status(400).json({ message: "field phone has invalid type. " });
        }
        next();
    }

    validateChangeEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        if (typeof email !== "string") {
            return res.status(400).json({ message: "field email has invalid type. " });
        }
        next();
    }

    validateChangePassword = async (req: Request, res: Response, next: NextFunction) => {
        const { password } = req.body;
        if (typeof password !== "string") {
            console.log("password type", typeof password);
            return res.status(400).json({ message: "field password has invalid type. " });
        }
        next();
    }

    validateAnswerMessage = async (req: Request, res: Response, next: NextFunction) => {
        const famousPersonName = req.body.famousPersonName;
        if (famousPersonName === undefined) {
            return res.status(400).json({ message: "famousPersonName was not specified." });
        }

        const famousPerson = await userRep.getFamousPersonByName(famousPersonName.toUpperCase());
        if (famousPerson === undefined) {
            return res.status(400).json({ message: "famous person with this name does not exist." });
        }

        // const token = req.headers.authorization;
        // const { ipV4, userAgent } = req.body;
        // if (token === undefined && (ipV4 === undefined || userAgent === undefined)) {
        //     return res.status(400).json({ message: "for unauthorized user you must specify ipV4 and userAgent." });
        // }

        next();
    }

    validateUnauthorizedUserMessage = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;
        const { ipV4UserAgentToken } = req.body;
        console.log("validate unauth message");

        if (token === undefined) {
            if (ipV4UserAgentToken === undefined) {
                return res.status(400).json({ message: "no ipV4UserAgentToken was provided." });
            } else {
                const { CLIENT_SECRET } = process.env;

                try {
                    jwt.verify(ipV4UserAgentToken, CLIENT_SECRET!);

                    const { ipV4, userAgent } = jwtDataGetters.getIpV4UserAgent(ipV4UserAgentToken!);
                    if (ipV4 === undefined || userAgent === undefined) {
                        return res.status(400).json({ message: "ipV4UserAgentToken does not containt required fields." });
                    }
                }
                catch (error) {
                    return res.status(401).json({ message: "Invalid ipV4UserAgentToken." });
                }
            }
        }

        next();
    }
}

export default new UserMiddlewares();
