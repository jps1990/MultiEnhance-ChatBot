import { useState } from 'react';
import { Message } from '../types';
import { Upload, Bot } from 'lucide-react';

interface MessageProps {
  message: Message;
  onImageUpload?: (file: File) => void;
}

export default function MessageComponent({ message, onImageUpload }: MessageProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload?.(file);
    }
  };

  return (
    <div className={`flex w-full ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className="w-[90%] flex gap-3 items-start">
        {message.role === 'assistant' && (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            {message.botImage ? (
              <img
                src={message.botImage}
                alt="Bot avatar"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
        )}
        
        <div className="flex-1">
          <div className={`message-content transition-all duration-100 p-3 rounded-lg ${
            message.role === 'assistant' 
              ? 'bg-gray-100 dark:bg-gray-800' 
              : 'bg-blue-500 text-white'
          }`}>
            {message.content}
          </div>
          
          {message.imageUrl && (
            <div className="mt-2">
              <img
                src={message.imageUrl}
                alt="Message image"
                className="max-w-[300px] rounded-lg"
              />
            </div>
          )}
          
          {message.role === 'user' && !message.imageUrl && (
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-gray-500 hover:text-gray-700">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Ajouter une image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
} 