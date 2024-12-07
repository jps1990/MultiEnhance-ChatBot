import { useState } from 'react';
import { ChatContext, Message } from '../types';
import MessageComponent from './MessageComponent';
import MessageInput from './MessageInput';
import { ModelSelector } from './ModelSelector';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>('Nouvelle conversation');
  const [provider, setProvider] = useState<'openai' | 'xai'>('openai');
  
  const chatContext: ChatContext = {
    messages,
    setMessages,
    setTitle,
    currentModel: 'gpt-3.5-turbo',
    provider
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="text-center py-2 border-b">
        <h1>{title}</h1>
      </div>
      <div className="chat-messages overflow-y-auto h-[calc(100vh-200px)] flex-1">
        {messages.map((message) => (
          <MessageComponent key={message.id} message={message} />
        ))}
      </div>
      <MessageInput context={chatContext} />
    </div>
  );
} 