const authOptionsCheck = () => {
    const { SALT_ROUNDS, JWT_TTL, JWT_SECRET } = process.env;
    if (
        SALT_ROUNDS === undefined ||
        JWT_TTL === undefined ||
        JWT_SECRET === undefined
    ) {
        throw new Error("Some of the fields: SALT_ROUNDS, JWT_TTL, JWT_SECRET are unspecified in .env file.");
    }
}

export default authOptionsCheck;
