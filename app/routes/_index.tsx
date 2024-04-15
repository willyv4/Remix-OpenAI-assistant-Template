import type { MetaFunction } from "@vercel/remix";
import { ChatBot } from "~/components/chatbot";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix OpenAI Assistant Chatbot Template" },
    {
      name: "This is a starter template built in Remix.run to easily get started with personlized OpenAI Assistants",
    },
  ];
};

export default function Index() {
  return <ChatBot />;
}
