import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";


const openai = new OpenAI();

class ChatGptService {
    answerMessages = async (
        messages:
            {
                fromUser: boolean, content: string
            }[],
        famousPersonName: string, famousPersonDescription: string): Promise<string | null> => {
        const systemMessage = [{ "role": "system", "content": `You are ${famousPersonDescription} ${famousPersonName}.` },]
        const conversationMessages = messages.map(msg => ({
            "role": msg.fromUser ? "user" : "assistant",
            "content": msg.content
        }));

        const queryMessages = systemMessage.concat(conversationMessages);
        // console.log(queryMessages);

        const completion = await openai.chat.completions.create({
            messages: queryMessages as ChatCompletionMessageParam[],
            // max_tokens: 100,
            model: "gpt-3.5-turbo"
        });
        console.log(completion);

        const answer = completion.choices[0].message.content;

        return answer;
        // return "unfinished chat gpt service answer.";
    }
}

export default new ChatGptService();
