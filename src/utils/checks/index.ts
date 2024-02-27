import authOptionsCheck from "./authOptionsCheck";
import chatGptOptionsCheck from "./chatGptOptionsCheck";
import databaseOptionsCheck from "./databaseOptionsCheck";
import googleAuthOptionsCheck from "./googleAuthOptionsCheck";


const envVarsCheck = () => {
    const { PORT, FRONTEND_ORIGIN } = process.env;

    if (PORT === undefined || FRONTEND_ORIGIN === undefined) {
        throw new Error("Some the fields: PORT, FRONTEND_ORIGIN are unspecified in .env file. ");
    }
    authOptionsCheck();
    databaseOptionsCheck();
    googleAuthOptionsCheck();
    chatGptOptionsCheck();
}

export default envVarsCheck();
