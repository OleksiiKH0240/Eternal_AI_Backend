import { Request, Response, NextFunction } from "express";
import userRep from "database/repositories/UserRep";


class UserMiddlewares {
    validateAuth = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "some of these fields: email or password have invalid type. " })
        }
        next();
    }

    validateChangeSubscription = async (req: Request, res: Response, next: NextFunction) => {
        const { subscriptionId } = req.body;
        if (typeof subscriptionId !== "number" || !Number.isInteger(subscriptionId)) {
            return res.status(400).json({ message: "field subscriptionId has invalid type. " })
        }
        next();
    }

    validateAddQuestions = async (req: Request, res: Response, next: NextFunction) => {
        const { quantity } = req.body;
        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({ message: "field quantity has invalid type or is less than zero. " })
        }
        next();
    }

    validateChangeName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body;
        if (typeof name !== "string") {
            return res.status(400).json({ message: "field name has invalid type. " })
        }
        next();
    }

    validateChangePhone = async (req: Request, res: Response, next: NextFunction) => {
        const { phone } = req.body;
        if (typeof phone !== "string") {
            return res.status(400).json({ message: "field phone has invalid type. " })
        }
        next();
    }

    validateChangeEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        if (typeof email !== "string") {
            return res.status(400).json({ message: "field email has invalid type. " })
        }
        next();
    }

    validateChangePassword = async (req: Request, res: Response, next: NextFunction) => {
        const { password } = req.body;
        if (typeof password !== "string") {
            return res.status(400).json({ message: "field password has invalid type. " })
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

        next();
    }
}

export default new UserMiddlewares();
