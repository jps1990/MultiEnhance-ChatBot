import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface BotSettingsProps {
  onBotImageChange: (imageUrl: string | null) => void;
  currentBotImage: string | null;
}

export default function BotSettings({ onBotImageChange, currentBotImage }: BotSettingsProps) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onBotImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 border-b">
      <h3 className="font-medium mb-2">Personnalisation du bot</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center relative">
          {currentBotImage ? (
            <>
              <img
                src={currentBotImage}
                alt="Bot avatar"
                width={48}
                height={48}
                className="rounded-full"
              />
              <button
                onClick={() => onBotImageChange(null)}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </>
          ) : (
            <label className="cursor-pointer w-full h-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Cliquez pour changer l'avatar du bot
        </div>
      </div>
    </div>
  );
} 