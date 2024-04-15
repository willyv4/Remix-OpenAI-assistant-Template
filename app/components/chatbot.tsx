import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";
import { useMessageFetcher } from "../hooks/use.message.fetcher";
import { ChatLoadingIndicator, RenderChatResponse } from "./chatbot.ui";
import { ChatForm } from "./chatbot.form";

export const ChatBot = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { isLoading, chatThread, submitMessageFetcher, threadId } =
    useMessageFetcher();

  return (
    <div className="max-w-xl mx-auto border overflow-hidden border-zinc-200">
      <div className="h-full max-w-7xl overflow-hidden rounded-none shadow-none backdrop-blur-3xl">
        <div className="h-full grid-cols-1 overflow-y-auto">
          <div className="align-items shadow-sm absolute z-10 flex w-full flex-col items-center justify-center gap-2 bg-zinc-300 py-4">
            <span className="inline-flex items-center gap-x-1.5 rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-medium text-dominant-600">
              <ChatBubbleLeftRightIcon className="m-auto h-3 w-3 fill-action" />
              <p className="text-sm font-semibold">Chat</p>
            </span>
            <div>
              <h4 className="text-xs font-semibold">
                Questions? Chat with us!
              </h4>
            </div>
          </div>
          <RenderChatResponse
            isLoading={isLoading}
            chatThread={chatThread}
            propClassNames="relative mx-auto bg-zinc-50 shadow-inner flex h-dvh w-full flex-col overflow-y-auto px-9 py-28"
          />
        </div>

        {isLoading && (
          <ChatLoadingIndicator
            isLoading={isLoading}
            classNames="absolute bottom-20 z-30 mb-2 ml-4 flex w-fit flex-row items-center gap-x-1.5 rounded-md px-3 py-2"
          />
        )}

        <div className="fixed bottom-0 z-20 w-full rounded-b-xl bg-dominant-900/75 backdrop-blur-3xl">
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-dominant-800/70" />
            </div>
          </div>
          <ChatForm
            isLoading={isLoading}
            submitMessageFetcher={submitMessageFetcher}
            threadId={threadId}
            formRef={formRef}
          />
        </div>
      </div>
    </div>
  );
};
