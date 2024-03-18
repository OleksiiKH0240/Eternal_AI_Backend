import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken";
import jwtDataGetters from "utils/jwtDataGetters";


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;
    if (token === undefined) {
        res.status(401).json({
            message: "no access token was provided."
        })
    }
    else {
        token = token.includes("Bearer ") ? token.split(" ")[1] : token;
        const { JWT_SECRET } = process.env;
        try {
            const decodedToken = jwt.verify(token, JWT_SECRET!);
            next();
        }
        catch (error) {
            res.status(401).json({ message: "Invalid token." });
        }
    }

}

export const authenticateFrontendUser = async (req: Request, res: Response, next: NextFunction) => {
    let { frontendUserToken } = req.body;
    if (frontendUserToken === undefined) {
        res.status(401).json({
            message: "no frontend user access token was provided."
        })
    }
    else {
        frontendUserToken = frontendUserToken.includes("Bearer ") ? frontendUserToken.split(" ")[1] : frontendUserToken;
        const { JWT_SECRET } = process.env;
        try {
            const decodedToken = jwt.verify(frontendUserToken, JWT_SECRET!);
            const subscriptionId = jwtDataGetters.getSubscriptionId(frontendUserToken);
            if (subscriptionId !== -1) {
                throw new Error("Invalid token.");
            }
            next();
        }
        catch (error) {
            res.status(401).json({ message: "Invalid token." });
        }
    }
}

export const validateGoogleAuth = async (req: Request, res: Response, next: NextFunction) => {
    const { user: googleUserToken } = req.body;

    if (googleUserToken === undefined) {
        res.status(401).json({
            message: "no google user token was provided."
        });
    }
    else {
        const { GOOGLE_CLIENT_SECRET } = process.env;

        try {
            jwt.verify(googleUserToken, GOOGLE_CLIENT_SECRET!);
            next();
        }
        catch (error) {
            res.status(401).json({ message: "Invalid token." });
        }
    }
}
