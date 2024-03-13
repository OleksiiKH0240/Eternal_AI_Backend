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

        const cardToken = await stripe.tokens.create({
            card: {
                number: "4242424242424242",
                exp_month: "8",
                exp_year: "2026",
                cvc: '314'
            }
        });

        // const paymentMethod = await stripe.paymentMethods.create({
        //     type: "card",

        // });


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

        const { PRODUCT_API_ID } = process.env;
        const product = await stripe.products.retrieve(PRODUCT_API_ID!);
        const productPrice = product.default_price as string;
        // console.log("product", product);




        // const updateCustomerDefaultPaymentMethod = await stripe.customers.update(
        //     customer.id, { // <-- your customer id from the request body

        //       invoice_settings: {
        //         default_payment_method: paymentMethod.id, // <-- your payment method ID collected via Stripe.js
        //       },
        //   });

        // await stripe.paymentMethods.attach(paymentMethod.id, { customer: stripeCustomerId });

        // await stripe.subscriptions.create({
        //     customer: stripeCustomerId,
        //     items: [
        //         {
        //             price: productPrice
        //         }
        //     ]

        // });
        // console.log(session);
        return { paymentMethod: "" };
    }

    activateSubscription = async (stripeCustomerId: string) => {
        const { userId } = (
            (await stripe.customers.retrieve(stripeCustomerId)) as Stripe.Customer
        ).metadata as unknown as { userId: number };

        await userService.changeSubscription(1, undefined, userId);
    }
}

export default new StripeSevice();
