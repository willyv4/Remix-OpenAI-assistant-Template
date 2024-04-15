import type { FetcherWithComponents } from "@remix-run/react";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

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
      className="flex w-full flex-row pl-2 py-2 bg-zinc-300"
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
        className="h-full w-full pt-1 resize-none overflow-hidden overflow-y-auto rounded-lg bg-zinc-200  pl-3  text-[16px] text-black outline-none placeholder:text-dominant-400"
      />
      <button
        ref={buttonRef}
        disabled={isLoading}
        type="submit"
        className="ml-4 mr-4 mt-2.5 size-9 border-none outline-none"
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
