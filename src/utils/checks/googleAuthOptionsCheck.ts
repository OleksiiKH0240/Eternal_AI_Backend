const googleAuthOptionsCheck = () => {
    // const { CLIENT_ID, CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI } = process.env;
    const { GOOGLE_CLIENT_SECRET } = process.env;
    if (
        GOOGLE_CLIENT_SECRET === undefined
        // CLIENT_ID === undefined ||
        // CLIENT_SECRET === undefined ||
        // GOOGLE_OAUTH_REDIRECT_URI === undefined
    ) {
        // throw new Error("Some of the fields: CLIENT_ID, CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI are unspecified in .env file.");
        throw new Error("Some of the fields: GOOGLE_CLIENT_SECRET are unspecified in .env file.");
    }
}

export default googleAuthOptionsCheck;
