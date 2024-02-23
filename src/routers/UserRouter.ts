import { Router } from "express";
import userController from "../controllers/UserController";
import authenticate from "../middlewares/Authentication"


const userRouter = Router();

userRouter.post("/sign-up",
    userController.signUp
);

userRouter.post("/log-in",
    userController.logIn
);

userRouter.get("/oauth/google/url",
    userController.oauthGoogleUrl
);

userRouter.get("/oauth/google",
    userController.oauthGoogle
);

userRouter.get("/user",
    authenticate,
    userController.getUser
);

userRouter.put("/name",
    authenticate,
    userController.changeName
);

userRouter.put("/phone",
    authenticate,
    userController.changePhone
);

userRouter.put("/email",
    authenticate,
    userController.changeEmail
);

userRouter.put("/password",
    authenticate,
    userController.changePassword
);

userRouter.put("/subscription",
    authenticate,
    userController.changeSubscription
);

userRouter.put("/add-questions",
    authenticate,
    userController.addQuestions
);

userRouter.get("/messages-by-famous-person",
    authenticate,
    userController.getMessagesByFamousPerson
);

userRouter.post("/message",
    userController.answerMessage
);

export default userRouter;
