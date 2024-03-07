import { Router, raw } from "express";
import stripeController from "controllers/StripeController";
import stripeMiddlewares from "middlewares/StripeMiddlewares";


const stripeRouter = Router();

stripeRouter.post("/stripe-webhook",
    raw({ type: 'application/json' }),
    stripeMiddlewares.verifyStripeWebhook,
    stripeController.stripeWebhook
);

export default stripeRouter;
