import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { openai } from "~/servers/openAi";

export const action: ActionFunction = async () => {
  if (!openai || !openai.beta.threads.create) {
    return json({
      threadId: "",
      status: 400,
      error: "Could not create thread",
    });
  }
  
  const thread = await openai.beta.threads.create();
  if (!thread.id) {
    return json({
      threadId: "",
      status: 400,
      error: "Could not created thread",
    });
  }

  return json({ threadId: thread.id, status: 200 });
};
