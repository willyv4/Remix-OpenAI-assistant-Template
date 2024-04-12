import type { MetaFunction } from "@vercel/remix";
import { ChatBot } from "~/components/chat.ui";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return <ChatBot />;
}
