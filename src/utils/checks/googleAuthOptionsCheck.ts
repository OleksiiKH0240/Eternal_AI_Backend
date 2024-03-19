const googleAuthOptionsCheck = () => {
    const { CLIENT_SECRET } = process.env;
    if (
        CLIENT_SECRET === undefined
    ) {
        throw new Error("Some of the fields: CLIENT_SECRET are unspecified in .env file.");
    }
}

export default googleAuthOptionsCheck;
