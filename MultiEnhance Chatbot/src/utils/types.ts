import { Message } from "../types";

interface ChatContext {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setTitle: (title: string) => void;
  currentModel: string;
  provider: 'openai' | 'xai' | 'anthropic' | 'cohere';
} 