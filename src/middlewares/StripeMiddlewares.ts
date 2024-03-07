import { Request, Response, NextFunction } from "express";
import stripeSevice from "services/StripeSevice";


class StripeMiddleware {
    verifyStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
        const bodyStr = req.body;
        const signature = req.headers["stripe-signature"];
        if (signature === undefined) {
            return res.status(401).json({ message: "no stripe-signature was specified." });
        }

        try {
            const event = stripeSevice.verifyStripeWebhook(bodyStr, signature!);
        } catch (error) {
            console.log(error);
            return res.status(401).json({ message: "webhook verification failed." });
        }

        next();
    }
}

export default new StripeMiddleware();
