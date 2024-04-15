import { json, type ActionFunction } from "@remix-run/server-runtime";
import { assistantFunctions, file_ids, instructions, model } from "~/helpers/bot.context";
import { openAiAssistant, openai } from "~/servers/openAi";


export const action: ActionFunction = async ({request}) => {

	const assistant = openAiAssistant || ""
	
	if (!assistant) {
		console.log("NO ASSISTANT FOUND")
		return json({error: "No Assistant found!!!", status: 404})
	}

	if (request.method === "PUT") {
		try {
					const myUpdatedAssistant = await openai.beta.assistants.update(assistant, {
			instructions,
			name: "General help bot",
			tools: assistantFunctions(),
			model,
			file_ids,
		});

		console.log({myUpdatedAssistant});
		return json({error: null, status: 200, message: "bot update success!"})

		} catch (error) {
			return json({error, status: 400, message: "bda requests"})
		}

	} 

	return json({error: `No action to handle with method: ${request.method}`, status: 400})
}