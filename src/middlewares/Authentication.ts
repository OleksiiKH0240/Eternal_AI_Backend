import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken";


const authenticate = async (req: Request, res: Response, next: NextFunction) => {
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
            res.status(401).json({ message: "Invalid token." })
        }
    }

}

export default authenticate;
