import { useState } from 'react';
import { ChatContext } from '../types';
import { Send } from 'lucide-react';

interface MessageInputProps {
  context: ChatContext;
}

export default function MessageInput({ context }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await context.handleNewMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!message.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
} 