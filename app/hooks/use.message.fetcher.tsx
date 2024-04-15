import { useFetcher } from "@remix-run/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { MarkDownBotResponse } from "../components/chatbot.ui";
import {
  formatChatResp,
  formatUserResp,
  getLatestMessage,
  waitForRunCompletion,
} from "~/helpers/message.fetcher.helpers";

export interface ChatMessage {
  user?: string;
  assistant?: ReactNode;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    formatChatResp(
      <MarkDownBotResponse chatResp={"hello i am your assistant"} />
    ),
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
