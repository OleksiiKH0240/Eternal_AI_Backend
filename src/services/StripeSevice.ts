import userRep from "database/repositories/UserRep";
import Stripe from "stripe";
import jwtDataGetters from "utils/jwtDataGetters";
import userService from "./UserService";
import jwt from "jsonwebtoken";


const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET } = process.env;
const stripe = new Stripe(STRIPE_SECRET_KEY!);

class StripeSevice {
    verifyStripeWebhook = (body: string, signature: string | string[]) => {
        const event = stripe.webhooks.constructEvent(body, signature, STRIPE_ENDPOINT_SECRET!);
        return event;
    }

    createSubscription = async (token: string) => {
        const userId = jwtDataGetters.getUserId(token);
        let { stripeCustomerId, email, name, phone } = await userRep.getUserByUserId(userId);
        if (stripeCustomerId !== null) {
            await stripe.customers.update(stripeCustomerId,
                {
                    email,
                    name: name === null ? undefined : name,
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

        const subscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{
                price: productPrice,
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription', payment_method_types: ["card"] },
            expand: ['latest_invoice.payment_intent'],
        });

        return {
            subscriptionId: subscription.id,
            clientSecret: ((subscription.latest_invoice as Stripe.Invoice)
                .payment_intent as Stripe.PaymentIntent).client_secret
        };

    }

    // createCheckoutSession = async (token: string) => {

    //     const cardToken = await stripe.tokens.create({
    //         card: {
    //             number: "4242424242424242",
    //             exp_month: "8",
    //             exp_year: "2026",
    //             cvc: '314'
    //         }
    //     });

    //     // const paymentMethod = await stripe.paymentMethods.create({
    //     //     type: "card",

    //     // });


    //     const userId = jwtDataGetters.getUserId(token);
    //     let { stripeCustomerId, email, name, phone } = await userRep.getUserByUserId(userId);
    //     if (stripeCustomerId !== null) {
    //         await stripe.customers.update(stripeCustomerId,
    //             {
    //                 email,
    //                 // name: name === null ? undefined : name,
    //                 phone: phone === null ? undefined : phone
    //             });

    //     }
    //     else {
    //         const customer = await stripe.customers.create({
    //             email,
    //             name: name === null ? undefined : name,
    //             phone: phone === null ? undefined : phone,
    //             metadata: { userId }
    //         });

    //         stripeCustomerId = customer.id;
    //         await userRep.changeStripeCustomerIdByUserId(userId, stripeCustomerId);
    //     }

    //     const { PRODUCT_API_ID } = process.env;
    //     const product = await stripe.products.retrieve(PRODUCT_API_ID!);
    //     const productPrice = product.default_price as string;
    //     // console.log("product", product);




    //     // const updateCustomerDefaultPaymentMethod = await stripe.customers.update(
    //     //     customer.id, { // <-- your customer id from the request body

    //     //       invoice_settings: {
    //     //         default_payment_method: paymentMethod.id, // <-- your payment method ID collected via Stripe.js
    //     //       },
    //     //   });

    //     // await stripe.paymentMethods.attach(paymentMethod.id, { customer: stripeCustomerId });

    //     // await stripe.subscriptions.create({
    //     //     customer: stripeCustomerId,
    //     //     items: [
    //     //         {
    //     //             price: productPrice
    //     //         }
    //     //     ]

    //     // });
    //     // console.log(session);
    //     return { paymentMethod: "" };
    // }

    activateSubscription = async (stripeCustomerId: string, stripeSubscriptionId: string) => {
        const { userId } = (
            (await stripe.customers.retrieve(stripeCustomerId)) as Stripe.Customer
        ).metadata as unknown as { userId: number };

        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const subscriptionExpireDate = new Date(subscription.current_period_end * 1000);

        await userService.changeSubscription(userId, 1, subscriptionExpireDate);
    }

    cancelSubscriptionByStripe = async (stripeCustomerId: string) => {
        const { userId } = (
            (await stripe.customers.retrieve(stripeCustomerId)) as Stripe.Customer
        ).metadata as unknown as { userId: number };

        await userService.changeSubscription(userId, 0);
    }

    cancelSubscriptionByUser = async (token: string) => {
        const userId = jwtDataGetters.getUserId(token);
        let { stripeCustomerId } = await userRep.getUserByUserId(userId);

        const { PRODUCT_API_ID } = process.env;
        const product = await stripe.products.retrieve(PRODUCT_API_ID!);
        const productPrice = product.default_price as string;

        if (stripeCustomerId !== null) {
            const subscriptions = (await stripe.subscriptions.list({
                limit: 10,
                status: "active",
                price: productPrice,
                customer: stripeCustomerId
            })).data.filter((val) => val.cancel_at_period_end === false);

            if (subscriptions.length === 0) {
                return {
                    Exists: false,
                    isCanceled: false
                };
            }

            for (const subscription of subscriptions) {
                await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
            }

            await userService.changeSubscription(userId, undefined, undefined, true);
            let { hasShareBonus, password, questionsCount, "stripeCustomerId": _, ...user } = await userRep.getUserByUserId(userId);

            return {
                user,
                Exists: true,
                isCanceled: true
            };
        }
        return {
            Exists: false,
            isCanceled: false
        };
    }

    getSetupIntentSecret = async (token: string) => {
        const userId = jwtDataGetters.getUserId(token);
        let { stripeCustomerId } = await userRep.getUserByUserId(userId);


        if (stripeCustomerId !== null) {
            const intent = await stripe.setupIntents.create({
                customer: stripeCustomerId,
                automatic_payment_methods: {
                    enabled: true
                }
            });
            return { customerExists: true, clientSecret: intent.client_secret };
        }
        else {
            return { customerExists: false };
        }
    }

    changeCustomerPaymentMethod = async (token: string, paymentMethodId: string) => {
        const userId = jwtDataGetters.getUserId(token);
        let { stripeCustomerId } = await userRep.getUserByUserId(userId);

        if (stripeCustomerId !== null) {
            // const paymentMethods = await stripe.paymentMethods.list({
            //     customer: stripeCustomerId
            // });
            // console.log(paymentMethods.data[0].card);

            const customer = await stripe.customers.update(stripeCustomerId, {
                // source: paymentMethodId
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            });

            // TODO: maybe I should delete previous default payment method after setting new one
            // console.log(customer);

            if (customer.invoice_settings.default_payment_method === paymentMethodId) {
                return { customerExists: true, isSuccessfull: true };
            }
            else {
                return { customerExists: true, isSuccessfull: false };
            }

        }
        else {
            return { customerExists: false };
        }
    }
}

export default new StripeSevice();
