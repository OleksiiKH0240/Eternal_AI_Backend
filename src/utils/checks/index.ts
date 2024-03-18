import authOptionsCheck from "./authOptionsCheck";
import chatGptOptionsCheck from "./chatGptOptionsCheck";
import databaseOptionsCheck from "./databaseOptionsCheck";
import googleAuthOptionsCheck from "./googleAuthOptionsCheck";
import stripeOptionsCheck from "./stripeOptionsCheck";


const envVarsCheck = async () => {
    // const { PORT, FRONTEND_ORIGIN, FRONTEND_USER_PASSWORD } = process.env;
    const { PORT, FRONTEND_ORIGIN } = process.env;

    if (PORT === undefined ||
        // FRONTEND_ORIGIN === undefined || FRONTEND_USER_PASSWORD === undefined
        FRONTEND_ORIGIN === undefined
    ) {
        throw new Error(`
        Some the fields: PORT, 
        FRONTEND_ORIGIN are unspecified in .env file. `);
    }
    authOptionsCheck();
    databaseOptionsCheck();
    googleAuthOptionsCheck();
    chatGptOptionsCheck();
    await stripeOptionsCheck();
}

export default envVarsCheck();
