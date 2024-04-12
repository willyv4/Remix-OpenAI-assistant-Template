import type { FC, RefObject } from "react";
import { ChatBubbleLeftRightIcon, BoltIcon } from "@heroicons/react/24/solid";
import type { FetcherWithComponents } from "@remix-run/react";
import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../hooks/use.message.fetcher";
import { useMessageFetcher } from "../hooks/use.message.fetcher";
import { cn } from "~/utils/classnames";

type RenderChatResponseProps = {
  isLoading: boolean;
  chatThread: ChatMessage[];
  propClassNames?: string;
};

type ChatFormProps = {
  isLoading: boolean;
  submitMessageFetcher: FetcherWithComponents<{
    runId: string;
    status: number;
    error?: string | undefined;
  }>;
  threadId: string;
  formRef: RefObject<HTMLFormElement>;
};

export const ChatBot = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { isLoading, chatThread, submitMessageFetcher, threadId } =
    useMessageFetcher();

  return (
    <div className="h-full">
      <div className="h-full max-w-7xl overflow-hidden rounded-none shadow-none backdrop-blur-3xl">
        <div className="h-full grid-cols-1 overflow-y-auto">
          <div className="align-items absolute z-10 flex w-full flex-col items-center justify-center gap-2 bg-zinc-200 py-4">
            <span className="inline-flex items-center gap-x-1.5 rounded-lg bg-dominant-900 px-3 py-1.5 text-xs font-medium text-dominant-600">
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
            propClassNames="relative mx-auto flex h-full w-full flex-col overflow-y-auto px-9 py-28"
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

export const ChatLoadingIndicator = ({
  isLoading,
  classNames,
}: {
  isLoading: boolean;
  classNames: string;
}) => {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setCount((prevCount) => (prevCount === 2 ? 0 : prevCount + 1));
      }, 300);

      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  return (
    <span className={classNames}>
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <svg
            key={index + "loading-dots"}
            className={cn(
              "size-2 fill-white/50 transition duration-700 ease-in-out",
              index === count && "translate-y-1 opacity-10"
            )}
            viewBox="0 0 6 6"
            aria-hidden="true"
          >
            <circle cx={3} cy={3} r={3} />
          </svg>
        ))}
    </span>
  );
};

export const RenderChatResponse: React.FC<RenderChatResponseProps> = ({
  isLoading,
  chatThread,
  propClassNames,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const chatContainerElement = chatContainerRef.current;
      const lastMessage = chatContainerElement.lastElementChild;

      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatThread]);

  return (
    <div ref={chatContainerRef} className={propClassNames}>
      {chatThread?.map(({ assistant, user }, i) => (
        <div
          key={`${i}-chat-response`}
          className={cn(
            user
              ? "-mr-5 -mt-0.5 self-end bg-dominant-600"
              : "-ml-2 mt-3 self-start bg-dominant-800",
            isLoading && "animate-pulse",
            "relative my-3 w-fit rounded-lg px-2 text-sm text-dominant-300 shadow-inner shadow-dominant/10"
          )}
        >
          {assistant && (
            <div className="absolute -left-6 -top-5 flex w-fit flex-row rounded rounded-bl-none rounded-tl-2xl px-2">
              <div className="-mb-2 mr-1 flex justify-center rounded">
                <BoltIcon className="w-4 fill-dominant-500 shadow-2xl" />
              </div>
              <small className="-mb-1 font-semibold text-dominant-500">
                Bot
              </small>
            </div>
          )}
          {assistant}
          {user && (
            <div className="py-1 text-sm text-dominant-300"> {user} </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const ChatForm: React.FC<ChatFormProps> = ({
  isLoading,
  submitMessageFetcher,
  threadId,
  formRef,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const placeHolderText =
    submitMessageFetcher.state !== "idle"
      ? "Submitting..."
      : isLoading
      ? "SoundSculpt Is Thinking..."
      : "Compose your question...";

  useEffect(() => {
    if (submitMessageFetcher.state === "submitting") {
      formRef.current?.reset();
    }
  }, [formRef, submitMessageFetcher.state]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      buttonRef.current &&
      !isLoading
    ) {
      event.preventDefault();
      buttonRef.current.click();
    }
  };

  return (
    <submitMessageFetcher.Form
      method="POST"
      action={`/api/chats/${threadId}/messages`}
      ref={formRef}
      className="flex w-full flex-row py-2 pl-2"
    >
      <label htmlFor="message" className="sr-only">
        Enter your question:
      </label>
      <textarea
        required
        name="message"
        onKeyDown={handleKeyDown}
        placeholder={placeHolderText}
        aria-label="Compose your question..."
        className="h-14 w-full resize-none overflow-hidden overflow-y-auto border-none bg-dominant-900 p-4 pl-3 pt-5 text-[16px] text-white outline-none placeholder:text-dominant-400"
      />
      <button
        ref={buttonRef}
        disabled={isLoading}
        type="submit"
        className="ml-4 mr-4 mt-3 size-9 border-none outline-none"
      >
        <svg
          className="w-full fill-action hover:fill-action/70"
          version="1.1"
          x="0px"
          y="0px"
          viewBox="0 0 100 125"
          enableBackground="new 0 0 100 100"
          stroke="5px"
        >
          <path d="M82,50c0,2.2-1.3,4.1-3.3,5L25.4,77.2c-0.7,0.3-1.4,0.4-2.1,0.4c-1.5,0-2.9-0.6-3.9-1.7c-1.6-1.7-1.9-4-0.9-6.1L27,52.5  c0.4-0.8,1.3-1.1,2.1-0.7c0.8,0.4,1.1,1.3,0.7,2.1l-8.5,17.3c-0.6,1.3,0.1,2.2,0.4,2.5c0.2,0.3,1.1,1.1,2.4,0.5L77.5,52  c1.3-0.5,1.3-1.7,1.3-2c0-0.3-0.1-1.5-1.3-2L24.2,25.8c-1.3-0.5-2.2,0.3-2.4,0.5c-0.2,0.3-1,1.2-0.4,2.5l8.1,16.5l29.2,2.4  c0.9,0.1,1.5,0.8,1.5,1.7c-0.1,0.9-0.8,1.5-1.7,1.5l-30.1-2.5c-0.6,0-1.1-0.4-1.3-0.9l-8.5-17.3c-1-2-0.6-4.4,0.9-6.1  c1.6-1.7,3.9-2.2,6-1.3L78.7,45C80.8,45.9,82,47.8,82,50z" />
        </svg>
      </button>
    </submitMessageFetcher.Form>
  );
};

export const MarkDownBotResponse: FC<{ chatResp: string }> = ({ chatResp }) => {
  return (
    <div
      className="all-white-markdown prose py-1 text-sm text-dominant-300"
      dangerouslySetInnerHTML={{
        __html: chatResp,
      }}
    />
  );
};
