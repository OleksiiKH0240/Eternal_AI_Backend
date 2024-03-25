import authOptionsCheck from "./authOptionsCheck";
import chatGptOptionsCheck from "./chatGptOptionsCheck";
import databaseOptionsCheck from "./databaseOptionsCheck";
import googleAuthOptionsCheck from "./googleAuthOptionsCheck";
import stripeOptionsCheck from "./stripeOptionsCheck";


const envVarsCheck = async () => {
    const { PORT, FRONTEND_ORIGIN, CLIENT_SECRET } = process.env;

    if (PORT === undefined ||
        FRONTEND_ORIGIN === undefined ||
        CLIENT_SECRET === undefined
    ) {
        throw new Error(`
        Some the fields: PORT, 
        FRONTEND_ORIGIN, CLIENT_SECRET are unspecified in .env file. `);
    }
    authOptionsCheck();
    databaseOptionsCheck();
    googleAuthOptionsCheck();
    chatGptOptionsCheck();
    await stripeOptionsCheck();
}

export default envVarsCheck();
