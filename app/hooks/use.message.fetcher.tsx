import { useFetcher } from "@remix-run/react";
import { marked } from "marked";
import { type ReactNode, useEffect, useState } from "react";
import { MarkDownBotResponse } from "~/components/chat.ui";

// async function processActions(
//   requiredAction: any,
//   urlEnpoint: string,
// ) {
//   const toolsToCall = requiredAction?.["submit_tool_outputs"]?.["tool_calls"];

//   const tool_outputs: { tool_call_id: any; output: string }[] = [];

//   const actionHandlers = {
//     // where functions should be handled
//   };

//   for (const toCall of toolsToCall) {
//     const { id, type } = toCall;
//     const toCallFunction = toCall?.function;
//     if (!toCallFunction) return;
//     const { name, arguments: argument } = toCallFunction;
//     if (type !== "function") continue;

//     const args = JSON.parse(argument);
//     const output = actionHandlers[name as keyof typeof actionHandlers](args);
//     tool_outputs.push({
//       tool_call_id: id,
//       output: JSON.stringify(output),
//     });
//   }

//   await fetch(urlEnpoint, {
//     method: "POST",
//     body: JSON.stringify({
//       tool_outputs: tool_outputs,
//     }),
//   });
// }

function waitForRunCompletion(
  threadId: string,
  runId: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const urlEnpoint = `/api/chats/${threadId}/runs/${runId}`;
        const response = await fetch(urlEnpoint);
        const { status } = await response.json();

        // if (status === "requires_action") {
        //   await processActions(
        //     requiredAction,
        //     urlEnpoint,
        //   );
        // }

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

const formatChatResp = (resp: string | ReactNode) => ({ assistant: resp });
const formatUserResp = (resp: string) => ({ user: String(resp) });

async function getLatestMessage(threadId: string) {
  const data = await fetch(`/api/chats/${threadId}/messages`);
  const { message } = await data.json();
  return await marked(message);
}

export interface ChatMessage {
  user?: string;
  assistant?: string | ReactNode;
}

export const useMessageFetcher = () => {
  const threadIdFetcher = useFetcher<{
    threadId: string;
    status: number;
    error?: string;
  }>();

  const threadId = threadIdFetcher?.data?.threadId ?? "";
  useEffect(() => {
    threadIdFetcher.submit(
      {},
      {
        action: "/api/chats",
        method: "POST",
      }
    );
  }, []);

  const [chatResp, setChatResp] = useState("");

  const submitMessageFetcher = useFetcher<{
    runId: string;
    status: number;
    error?: string;
    code?: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const runId = submitMessageFetcher?.data?.runId ?? "";
  const [chatThread, setChatThread] = useState<ChatMessage[]>([
    formatChatResp("i will answer all your questions."),
  ]);

  useEffect(() => {
    const message = submitMessageFetcher?.formData?.get("message") as string;
    if (message) {
      setIsLoading(true);
      if (message)
        setChatThread((prevData) => [...prevData, formatUserResp(message)]);
    }
  }, [submitMessageFetcher.formData]);

  useEffect(() => {
    async function getResponse() {
      const runStatus = await waitForRunCompletion(threadId, runId);

      if (runStatus) {
        const html = await getLatestMessage(threadId);
        setChatResp(html);
        setIsLoading(false);
      }
    }
    if (threadId && runId) {
      getResponse();
    }
  }, [threadId, runId]);

  useEffect(() => {
    if (chatResp) {
      setChatThread((prevChatThread) => [
        ...prevChatThread,
        formatChatResp(<MarkDownBotResponse chatResp={chatResp} />),
      ]);
      setChatResp("");
    }
  }, [chatResp]);

  return {
    isLoading,
    chatThread,
    setChatThread,
    submitMessageFetcher,
    threadId,
  };
};
