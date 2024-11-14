import axios, { AxiosError } from 'axios';
import { ApiResponse } from '../types';
import { makeOpenAIRequest } from './providers/openaiProvider';
import { makeAnthropicRequest } from './providers/anthropicProvider';
import { makeCohereRequest } from './providers/cohereProvider';
import { processApiResponse } from './messageHandlers';
import { generateImage } from './imageHelpers';

export const handleApiCall = async (
  provider: string,
  model: string,
  apiKeys: { [key: string]: string },
  prompt: string,
  temperature: number,
  file: File | null,
  imageSettings: {
    size: string;
    quality: 'standard' | 'hd';
    style: 'natural' | 'vivid';
  }
): Promise<ApiResponse> => {
  console.log(`Making API call to ${provider} with model ${model}`);

  if (!apiKeys[provider]) {
    return {
      content: `Please provide a valid ${provider.toUpperCase()} API key in the configuration panel.`,
      type: 'error'
    };
  }

  if (model.includes('dall-e')) {
    try {
      const imageUrl = await generateImage(apiKeys.openai, {
        model,
        prompt,
        n: 1,
        size: imageSettings.size,
        quality: imageSettings.quality,
        style: imageSettings.style
      });
      return {
        content: prompt,
        type: 'image',
        imageUrl
      };
    } catch (error) {
      return {
        content: error instanceof Error ? error.message : 'Failed to generate image',
        type: 'error'
      };
    }
  }

  try {
    let response;
    switch (provider) {
      case 'openai':
        response = await makeOpenAIRequest(model, prompt, temperature, apiKeys[provider], file);
        break;
      case 'anthropic':
        try {
          response = await makeAnthropicRequest(model, prompt, apiKeys[provider]);
        } catch (anthropicError) {
          console.error('Anthropic API Error:', anthropicError);
          let errorMessage = 'Error connecting to Anthropic API. Please check your API key and try again.';
          if (anthropicError instanceof Error) {
            errorMessage = anthropicError.message || errorMessage;
          }
          return {
            content: errorMessage,
            type: 'error'
          };
        }
        break;
      case 'cohere':
        response = await makeCohereRequest(model, prompt, temperature, apiKeys[provider]);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log(`${provider.toUpperCase()} API Response:`, response);
    return processApiResponse(provider, response);
  } catch (error) {
    console.error(`${provider.toUpperCase()} API call error:`, error);
    let errorMessage = `Error with ${provider.toUpperCase()} (${model}): `;
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const responseData = axiosError.response.data as { message?: string };
        errorMessage += responseData.message || axiosError.message;
      } else if (axiosError.request) {
        errorMessage += 'Network error - Unable to reach the API server.';
      } else {
        errorMessage += axiosError.message;
      }
    } else {
      errorMessage += error instanceof Error ? error.message : 'Unknown error occurred';
    }

    return {
      content: errorMessage,
      type: 'error'
    };
  }
};

export const generateConversationTitle = async (
  provider: string,
  model: string,
  apiKeys: { [key: string]: string },
  message: string,
  temperature: number = 0.7
): Promise<string> => {
  const titlePrompt = `Based on this first message, generate a short, concise and relevant title (max 4-5 words) for the conversation. Just return the title, nothing else.

Message: "${message}"`;

  try {
    const response = await handleApiCall(provider, model, apiKeys, titlePrompt, temperature, null, {
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    });
    return response.content.trim();
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Chat';
  }
};