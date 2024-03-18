const googleAuthOptionsCheck = () => {
    const { GOOGLE_CLIENT_SECRET } = process.env;
    if (
        GOOGLE_CLIENT_SECRET === undefined
    ) {
        throw new Error("Some of the fields: GOOGLE_CLIENT_SECRET are unspecified in .env file.");
    }
}

export default googleAuthOptionsCheck;
