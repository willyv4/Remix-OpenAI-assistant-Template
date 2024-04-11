import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import openai from "../servers/openAi";

export const loader: LoaderFunction = async ({ params }) => {
  const threadId = params.threadid;

  if (!threadId) {
    return json({
      message: `No thread with id: ${threadId}`,
      status: 404,
      code: "Not Found",
    });
  }

  const messages = await openai.beta.threads.messages.list(threadId);

  if (messages?.data[0].content[0].type !== "text") {
    return json({
      message: "Unable to respond to question",
      status: 400,
      code: "Not Found",
    });
  }

  return json({
    message: messages.data[0].content[0]?.text.value,
    status: 200,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const assistant = ""
  const threadId = params.threadid as string;
  
  return await askAssistant(message, threadId, assistant);
};

const askAssistant = async (
  message: string,
  threadId: string,
  assistant: string,
) => {
  try {
    await openai?.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    const run = await openai?.beta.threads.runs.create(threadId, {
      assistant_id: assistant,
    });

    if (!run?.id) return json({ runId: "", status: 400 });
    return json({ runId: run.id, status: 200 });
  } catch (error) {
    console.log({ error });
    return json({ runId: "", status: 400, error });
  }
};

