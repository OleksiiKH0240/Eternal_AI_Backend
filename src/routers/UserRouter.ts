import { Router, raw } from "express";
import userController from "../controllers/UserController";
import { authenticate, validateGoogleAuth } from "../middlewares/Authentication"
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

userRouter.post("/send-otp",
    userMiddlewares.validateSendOtp,
    userController.sendOtp
);

userRouter.post("/check-otp",
    userMiddlewares.validateCheckOtp,
    userController.checkOtp
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

userRouter.post("/create-subscription",
    authenticate,
    userController.createSubscription
);

userRouter.post("/cancel-subscription",
    authenticate,
    userController.cancelSubscription
);

userRouter.post("/get-setup-intent-secret",
    authenticate,
    userController.getSetupIntentSecret
);

// userRouter.post("/change-payment-method",
//     authenticate,
//     userMiddlewares.validateChangePaymentMethod,
//     userController.changePaymentMethod
// );

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
    userMiddlewares.validateUnauthorizedUserMessage,
    userMiddlewares.validateAnswerMessage,
    userController.answerMessage
);

export default userRouter;
