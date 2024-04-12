import OpenAi from "openai";

const openAiKey = process.env.OPENAI_API_KEY;
export const openAiAssistant = process.env.OPENAI_ASSISTANT;
export const openai = new OpenAi({ apiKey: openAiKey });
