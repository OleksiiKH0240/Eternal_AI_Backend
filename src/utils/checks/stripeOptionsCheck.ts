import Stripe from "stripe";

const stripeOptionsCheck = async () => {
    const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET, PRODUCT_API_ID } = process.env;
    if (
        STRIPE_SECRET_KEY === undefined ||
        STRIPE_ENDPOINT_SECRET === undefined ||
        PRODUCT_API_ID === undefined
    ) {
        throw new Error("Some of the fields: STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET, PRODUCT_API_ID are unspecified in .env file.");
    }
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const product = await stripe.products.retrieve(PRODUCT_API_ID!);
    const productPrice = product.default_price;
    if (productPrice === null || productPrice === undefined) {
        throw new Error(`default price for product ${product.id} is not set.`);
    }
}

export default stripeOptionsCheck;
