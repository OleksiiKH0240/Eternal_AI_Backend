import { Router, raw } from "express";
import userController from "../controllers/UserController";
import { authenticate, authenticateFrontendUser, validateGoogleAuth } from "../middlewares/Authentication"
import userMiddlewares from "middlewares/UserMiddlewares";


const userRouter = Router();

userRouter.post("/sign-up",
    userMiddlewares.validateAuth,
    userController.signUp
);

userRouter.post("/log-in",
    userMiddlewares.validateAuth,
    userController.logIn
);

userRouter.post("/oauth/google",
    validateGoogleAuth,
    userController.oauthGoogle
);

userRouter.get("/user",
    authenticate,
    userController.getUser
);

userRouter.put("/user",
    authenticate,
    userMiddlewares.validateChangeUser,
    userController.changeUser
);

userRouter.put("/name",
    authenticate,
    userMiddlewares.validateChangeName,
    userController.changeName
);

userRouter.put("/phone",
    authenticate,
    userMiddlewares.validateChangePhone,
    userController.changePhone
);

userRouter.put("/email",
    authenticate,
    userMiddlewares.validateChangeEmail,
    userController.changeEmail
);

userRouter.put("/password",
    authenticate,
    userMiddlewares.validateChangePassword,
    userController.changePassword
);

userRouter.get("/stripe-session-url",
    authenticate,
    userController.getStripeSessionUrl
);

userRouter.put("/subscription",
    authenticateFrontendUser,
    authenticate,
    userMiddlewares.validateChangeSubscription,
    userController.changeSubscription
);

userRouter.put("/share-bonus",
    authenticate,
    userMiddlewares.validateShareBonus,
    userController.shareBonus
);

userRouter.get("/messages-by-famous-person",
    authenticate,
    userMiddlewares.validateGetMessages,
    userController.getMessagesByFamousPerson
);

userRouter.post("/message",
    userMiddlewares.validateAnswerMessage,
    userController.answerMessage
);

export default userRouter;
