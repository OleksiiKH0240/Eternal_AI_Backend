import { Request, Response, NextFunction } from "express";
import userRep from "database/repositories/UserRep";


class UserMiddlewares {
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
