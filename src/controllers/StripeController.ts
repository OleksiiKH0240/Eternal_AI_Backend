import { Request, Response, NextFunction } from "express";
import stripeSevice from "services/StripeSevice";
import Stripe from "stripe";


class StripeController {
    stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const event = JSON.parse(req.body);
            let stripeCustomerId;

            switch (event.type) {
                // case 'checkout.session.completed':
                //     const stripeCustomerId = (event as Stripe.CheckoutSessionCompletedEvent).data.object.customer as string;
                //     await stripeSevice.activateSubscription(stripeCustomerId);

                //     break;
                case "invoice.paid":
                    console.log("invoice was paid.");
                    stripeCustomerId = (event as Stripe.InvoicePaidEvent).data.object.customer as string;
                    const stripeSubscriptionId = (event as Stripe.InvoicePaidEvent).data.object.subscription as string;

                    await stripeSevice.activateSubscription(stripeCustomerId, stripeSubscriptionId);
                    break;

                case "customer.subscription.deleted":
                    console.log("customer subscription was deleted.");
                    stripeCustomerId = (event as Stripe.CustomerSubscriptionDeletedEvent).data.object.customer as string;
                    await stripeSevice.cancelSubscriptionByStripe(stripeCustomerId);
                    break;

                case "setup_intent.succeeded":
                    console.log("customer payment method was changed.");
                    stripeCustomerId = (event as Stripe.SetupIntentSucceededEvent).data.object.customer as string;
                    const paymentMethodId = (event as Stripe.SetupIntentSucceededEvent).data.object.payment_method as string;
                    await stripeSevice.changeCustomerPaymentMethod(stripeCustomerId, paymentMethodId);
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
