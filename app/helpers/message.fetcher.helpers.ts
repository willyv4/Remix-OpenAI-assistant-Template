import { marked } from "marked";
import type { ReactNode } from "react";

// you'd have to define this function in your Assistant
const testFunction = (msg: {testFunction: string}) => {
	console.log("BOT RAN TEST FUNCTION: ", msg.testFunction);
	return msg.testFunction
};

async function processActions(requiredAction: any, urlEnpoint: string) {
  const toolsToCall = requiredAction?.["submit_tool_outputs"]?.["tool_calls"];
  const tool_outputs: { tool_call_id: any; output: string }[] = [];

  // where functions should be handled
  const actionHandlers = {
    testFunction: (msg: {testFunction: string}) => testFunction(msg),
  };

  for (const toCall of toolsToCall) {
    const { id, type } = toCall;
    const toCallFunction = toCall?.function;
    if (!toCallFunction) continue;
	const { name, arguments: argument } = toCallFunction;
	  
    if (type !== "function") continue;

    const args = JSON.parse(argument);
    const output = actionHandlers[name as keyof typeof actionHandlers](args);
    tool_outputs.push({
      tool_call_id: id,
      output: JSON.stringify(output),
    });
  }

  await fetch(urlEnpoint, {
    method: "POST",
    body: JSON.stringify({
     tool_outputs: tool_outputs,
    }),
  });
}

// check the run status every second
// if completed resolve promise
export function waitForRunCompletion(
  threadId: string,
  runId: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const urlEnpoint = `/api/chats/${threadId}/runs/${runId}`;
        const response = await fetch(urlEnpoint);
        const { status, requiredAction } = await response.json();

        if (status === "requires_action") {
          await processActions(requiredAction, urlEnpoint);
        }

        if (status === "completed") {
          clearInterval(interval);
          resolve(status === "completed");
        }
      } catch (error) {
        console.warn({ error });
        clearInterval(interval);
        reject(error);
      }
    }, 1000);
  });
}

export const formatChatResp = (resp: ReactNode) => ({ assistant: resp });
export const formatUserResp = (resp: string) => ({ user: String(resp) });

export async function getLatestMessage(threadId: string) {
  const data = await fetch(`/api/chats/${threadId}/messages`);
  const { message } = await data.json();
  return await marked(message);
}
