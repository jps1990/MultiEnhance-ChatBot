import React from 'react';
import { models, getModelPrice } from '../utils/models';

interface ModelSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  imageSize: string;
  onImageSizeChange: (size: string) => void;
  imageQuality: 'standard' | 'hd';
  onImageQualityChange: (quality: 'standard' | 'hd') => void;
  imageStyle: 'natural' | 'vivid';
  onImageStyleChange: (style: 'natural' | 'vivid') => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  provider,
  model,
  onProviderChange,
  onModelChange,
  imageSize,
  onImageSizeChange,
  imageQuality,
  onImageQualityChange,
  imageStyle,
  onImageStyleChange
}) => {
  const isDalleModel = model.includes('dall-e');
  const currentPrice = getModelPrice(model);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          value={provider}
          onChange={(e) => {
            const newProvider = e.target.value;
            onProviderChange(newProvider);
            const firstModel = models[newProvider as keyof typeof models][0];
            onModelChange(firstModel);
          }}
          className="p-2 rounded bg-gray-700 text-white"
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="cohere">Cohere</option>
          <option value="xai">xAI</option>
        </select>

        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        >
          {models[provider as keyof typeof models].map((m) => (
            <option key={m} value={m}>
              {m} ({m.includes('dall-e') 
                ? `$${getModelPrice(m).toFixed(2)}/image`
                : `$${getModelPrice(m)}`}/M tokens)
            </option>
          ))}
        </select>
      </div>

      {isDalleModel && (
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block mb-2">Taille de l'image</label>
              <select
                value={imageSize}
                onChange={(e) => onImageSizeChange(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white"
              >
                <option value="1024x1024">1024x1024</option>
                <option value="1024x1792">1024x1792</option>
                <option value="1792x1024">1792x1024</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Qualité</label>
              <select
                value={imageQuality}
                onChange={(e) => onImageQualityChange(e.target.value as 'standard' | 'hd')}
                className="p-2 rounded bg-gray-700 text-white"
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Style</label>
              <select
                value={imageStyle}
                onChange={(e) => onImageStyleChange(e.target.value as 'natural' | 'vivid')}
                className="p-2 rounded bg-gray-700 text-white"
              >
                <option value="natural">Natural</option>
                <option value="vivid">Vivid</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300">
              Prix estimé: ${currentPrice.toFixed(3)} / image
            </p>
          </div>
        </div>
      )}
    </div>
  );
};