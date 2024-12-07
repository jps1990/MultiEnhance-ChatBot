export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'image' | 'error';
  imageUrl?: string;
  timestamp: number;
  botImage?: string;
}

export interface ChatContext {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setTitle: (title: string) => void;
  currentModel: string;
  provider: 'openai' | 'xai' | 'anthropic' | 'cohere';
  handleNewMessage?: (message: string) => Promise<void>;
}

export interface ApiResponse {
  content: string;
  type: 'text' | 'image' | 'error';
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}