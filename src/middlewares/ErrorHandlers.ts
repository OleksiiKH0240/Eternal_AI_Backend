import { Request, Response, NextFunction } from "express";

class ErrorHandlers {
    errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.log(err);
        next(err);
    }

    errorResponder = (err: Error, req: Request, res: Response, next: NextFunction) => {
        res.status(500).send("something went wrong on the server side.");
    }
}

export default new ErrorHandlers();
