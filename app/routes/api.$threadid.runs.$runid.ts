import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import openai from "~/servers/openAi";


export const loader: LoaderFunction = async ({ params }) => {
  const threadId = params.threadid as string;
  const runId = params.runid as string;
  const runStatus = await openai?.beta.threads.runs.retrieve(threadId, runId);
  const completedAt = runStatus?.completed_at;
  const status = runStatus?.status;
  const requiredAction = runStatus?.required_action;
  return json({ status, completedAt, requiredAction });
};

export const action: ActionFunction = async ({ params, request }) => {
  const threadId = params.threadid as string;
  const runId = params.runid as string;
  const data = await request.json();

  if (!data.tool_outputs) {
    return json(
      { message: "failed", error: "tool_outputs is required" },
      { status: 400 },
    );
  }

  await openai?.beta.threads.runs.submitToolOutputs(threadId, runId, {
    tool_outputs: data.tool_outputs,
  });

  return json({ message: "submitted", error: "" }, { status: 201 });
};