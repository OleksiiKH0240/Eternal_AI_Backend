const chatGptOptionsCheck = () => {
    const { OPENAI_API_KEY } = process.env;
    if (OPENAI_API_KEY === undefined) {
        throw new Error("Field OPENAI_API_KEY is unspecified in .env file.");
    }
}

export default chatGptOptionsCheck;
