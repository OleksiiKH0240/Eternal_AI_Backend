import userRep from "database/repositories/UserRep";
import Stripe from "stripe";
import jwtDataGetters from "utils/jwtDataGetters";
import userService from "./UserService";


const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET } = process.env;
const stripe = new Stripe(STRIPE_SECRET_KEY!);

class StripeSevice {
    verifyStripeWebhook = (body: string, signature: string | string[]) => {
        const event = stripe.webhooks.constructEvent(body, signature, STRIPE_ENDPOINT_SECRET!);
        return event;
    }

    createCheckoutSession = async (token: string) => {
        const userId = jwtDataGetters.getUserId(token);
        let { stripeCustomerId, email, name, phone } = await userRep.getUserByUserId(userId);
        if (stripeCustomerId !== null) {
            await stripe.customers.update(stripeCustomerId,
                {
                    email,
                    // name: name === null ? undefined : name,
                    phone: phone === null ? undefined : phone
                });
        }
        else {
            const customer = await stripe.customers.create({
                email,
                name: name === null ? undefined : name,
                phone: phone === null ? undefined : phone,
                metadata: { userId }
            });

            stripeCustomerId = customer.id;
            await userRep.changeStripeCustomerIdByUserId(userId, stripeCustomerId);
        }

        const { PRODUCT_API_ID, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL } = process.env;
        const session = await stripe.checkout.sessions.create({
            success_url: STRIPE_SUCCESS_URL,
            cancel_url: STRIPE_CANCEL_URL,
            line_items: [
                {
                    price: PRODUCT_API_ID,
                    quantity: 1
                }
            ],
            customer: stripeCustomerId,
            customer_update: { name: "auto", address: "auto" },
            metadata: { userId },
            mode: "payment"
        });

        // console.log(session);
        return { sessionUrl: session.url };
    }

    activateSubscription = async (stripeCustomerId: string) => {
        const { userId } = (
            (await stripe.customers.retrieve(stripeCustomerId)) as Stripe.Customer
        ).metadata as unknown as { userId: number };

        await userService.changeSubscription(1, undefined, userId);
    }
}

export default new StripeSevice();
