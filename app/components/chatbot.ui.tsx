import type { FC } from "react";
import { BoltIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../hooks/use.message.fetcher";
import { cn } from "~/utils/classnames";

type RenderChatResponseProps = {
  isLoading: boolean;
  chatThread: ChatMessage[];
  propClassNames?: string;
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
              "size-2 fill-zinc-500 transition duration-700 ease-in-out",
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
              ? "-mr-5 -mt-0.5 self-end bg-zinc-100"
              : "-ml-2 mt-3 self-start bg-zinc-200",
            isLoading && "animate-pulse",
            "relative my-3 w-fit py-0.5 rounded-lg px-2 text-sm text-dominant-300 shadow-inner shadow-dominant/10 max-w-xs"
          )}
        >
          {assistant && (
            <div className="absolute -left-6 -top-5 flex w-fit flex-row rounded rounded-bl-none rounded-tl-2xl px-2">
              <div className="-mb-2 mr-1 flex justify-center rounded">
                <BoltIcon className="w-4 fill-zinc-500 shadow-2xl" />
              </div>
              <small className="-mb-1 font-semibold text-zinc-500">Bot</small>
            </div>
          )}
          {assistant}
          {user && <p> {user} </p>}
        </div>
      ))}
    </div>
  );
};

export const MarkDownBotResponse: FC<{ chatResp: string }> = ({ chatResp }) => {
  return (
    <div
      className="prose text-sm text-dominant-300"
      dangerouslySetInnerHTML={{
        __html: chatResp,
      }}
    />
  );
};
