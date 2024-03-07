import { Request, Response, NextFunction } from "express";
import stripeSevice from "services/StripeSevice";
import Stripe from "stripe";


class StripeController {
    stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const event = JSON.parse(req.body);

            switch (event.type) {
                case 'checkout.session.completed':
                    const stripeCustomerId = (event as Stripe.CheckoutSessionCompletedEvent).data.object.customer as string;
                    await stripeSevice.activateSubscription(stripeCustomerId);

                    break;

                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            res.json({ received: true });

        } catch (error) {
            next(error);
        }
    }
}

export default new StripeController();
