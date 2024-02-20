class ChatGptService {
    answerMessages = async (messages: {
        fromUser: boolean, content: string
    }[], famousPersonName: string, famousPersonDescription: string): Promise<string> => {
        const query = [{ "role": "system", "content": `You are ${famousPersonDescription} ${famousPersonName}.` },]
        messages
        return "unfinished chat gpt service answer.";
    }
}

export default new ChatGptService();
