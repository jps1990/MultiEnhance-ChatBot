import { Message, ApiResponse } from '../types';

export const createMessage = (
  role: 'user' | 'assistant' | 'system',
  content: string,
  type: 'text' | 'image' | 'error' = 'text',
  imageUrl?: string
): Message => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role,
  content,
  type,
  imageUrl,
  timestamp: Date.now()
});

export const processApiResponse = (
  provider: string,
  response: any
): ApiResponse => {
  try {
    let content: string;

    switch (provider) {
      case 'openai':
        content = response.data.choices[0].message.content;
        break;
      case 'anthropic':
        content = response.data.choices[0].message.content;
        break;
      case 'cohere':
        content = response.data.generations[0].text;
        break;
      default:
        throw new Error('Unsupported provider');
    }

    // Vérifier si le contenu contient une requête d'image
    if (content.includes('<<IMAGE_REQUEST>>') && content.includes('<<END_IMAGE_REQUEST>>')) {
      const imageMatch = content.match(/<<IMAGE_REQUEST>>([\s\S]*?)<<END_IMAGE_REQUEST>>/);
      if (imageMatch) {
        try {
          const imageRequest = JSON.parse(imageMatch[1].trim());
          return {
            content: JSON.stringify(imageRequest),
            type: 'image'
          };
        } catch (error) {
          return {
            content: 'Invalid image generation request format',
            type: 'error'
          };
        }
      }
    }

    // Réponse texte standard
    return { 
      content,
      type: 'text'
    };
  } catch (error) {
    console.error(`Error processing ${provider} response:`, error);
    return {
      content: error instanceof Error ? error.message : 'Unknown error occurred',
      type: 'error'
    };
  }
};