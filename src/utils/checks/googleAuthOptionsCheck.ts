const googleAuthOptionsCheck = () => {
    const { CLIENT_ID, CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI } = process.env;
    if (
        CLIENT_ID === undefined ||
        CLIENT_SECRET === undefined ||
        GOOGLE_OAUTH_REDIRECT_URI === undefined
    ) {
        throw new Error("Some of the fields: CLIENT_ID, CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI are unspecified in .env file.");
    }
}

export default googleAuthOptionsCheck;
