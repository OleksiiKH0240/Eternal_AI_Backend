const googleAuthOptionsCheck = () => {
    const { GOOGLE_CLIENT_SECRET } = process.env;
    if (
        GOOGLE_CLIENT_SECRET === undefined
    ) {
        throw new Error("GOOGLE_CLIENT_SECRET is unspecified in .env file.");
    }
}

export default googleAuthOptionsCheck;
