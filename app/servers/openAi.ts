import OpenAi from "openai";

const openAiKey = process.env.OPEN_AI_API_KEY;
const openai = new OpenAi({ apiKey: openAiKey });

export default openai