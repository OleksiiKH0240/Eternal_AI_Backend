const stripeOptionsCheck = () => {
    const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET, PRODUCT_API_ID, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL } = process.env;
    if (
        STRIPE_SECRET_KEY === undefined ||
        STRIPE_ENDPOINT_SECRET === undefined ||
        PRODUCT_API_ID === undefined ||
        STRIPE_SUCCESS_URL === undefined ||
        STRIPE_CANCEL_URL === undefined
    ) {
        throw new Error("Some of the fields: STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET, PRODUCT_API_ID, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL are unspecified in .env file.");
    }
}

export default stripeOptionsCheck;
