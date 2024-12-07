import { Message, ApiResponse, ChatContext } from '../types';
import OpenAI from 'openai';

// Configuration OpenAI pour X.AI
const xaiClient = new OpenAI({
  apiKey: import.meta.env.VITE_XAI_API_KEY || '',
  baseURL: "https://api.x.ai/v1",
  dangerouslyAllowBrowser: true
});

// Configuration OpenAI standard
const openaiClient = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

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
    console.log(`🔍 Processing ${provider.toUpperCase()} response:`, JSON.stringify(response, null, 2));
    
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
      case 'xai':
        content = response.choices[0].message.content;
        break;
      default:
        throw new Error('Unsupported provider');
    }

    console.log(` Extracted content from ${provider.toUpperCase()}:`, content);

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
          console.error('❌ Error parsing image request:', error);
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
    console.error(`❌ Error processing ${provider.toUpperCase()} response:`, error);
    console.error('Raw response:', response);
    return {
      content: error instanceof Error ? error.message : 'Unknown error occurred',
      type: 'error'
    };
  }
};

async function generateConversationTitle(message: string): Promise<string> {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Génère un titre court (maximum 3 mots) qui résume le sujet principal du message. Réponds uniquement avec le titre, sans ponctuation ni explications.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 10,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 'Nouvelle conversation';
  } catch (error) {
    console.error('Erreur lors de la génération du titre:', error);
    return 'Nouvelle conversation';
  }
}

// Fonction utilitaire pour le défilement automatique
function scrollToBottom() {
  requestAnimationFrame(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      const shouldScroll = 
        chatContainer.scrollTop + chatContainer.clientHeight >= 
        chatContainer.scrollHeight - 100; // 100px de marge

      if (shouldScroll) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  });
}

// Fonction pour convertir une image en base64
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | { type: string; text?: string; image_url?: string }[];
  attachments?: { type: string; data: string }[];
}

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
} | {
  role: 'user';
  content: Array<{ type: string; text?: string; image_url?: string }>;
} | {
  role: 'user';
  content: string;
  attachments?: Array<{ type: string; data: string }>;
};

async function streamResponse(message: string, context: ChatContext, imageFile?: File) {
  try {
    let messages: ChatCompletionMessage[] = [];
    const systemMessage: ChatCompletionMessage = {
      role: 'system',
      content: context.provider === 'xai' 
        ? 'You are Grok, a chatbot inspired by the Hitchhiker\'s Guide to the Galaxy.'
        : 'You are a helpful AI assistant.'
    };

    // Préparer les messages avec le message système
    if (context.provider === 'xai') {
      messages = [systemMessage];
    }

    // Ajouter le message utilisateur
    if (imageFile) {
      const base64Image = await imageToBase64(imageFile);
      
      switch (context.provider) {
        case 'openai':
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: message },
              { type: 'image_url', image_url: base64Image }
            ]
          });
          break;
          
        case 'xai':
          messages.push({
            role: 'user',
            content: message,
            attachments: [{
              type: 'image',
              data: base64Image
            }]
          });
          break;
          
        default:
          messages.push({ 
            role: 'user', 
            content: `${message}\n[Image attached]` 
          });
      }
    } else {
      messages.push({ 
        role: 'user', 
        content: message 
      });
    }

    let stream;
    
    // Créer le message assistant vide avant de commencer le stream
    const assistantMessage = createMessage('assistant', '', 'text');
    context.setMessages(prevMessages => [...prevMessages, assistantMessage]);

    switch (context.provider) {
      case 'openai':
        stream = await openaiClient.chat.completions.create({
          model: context.currentModel,
          messages: messages as any,
          stream: true,
          temperature: 0.7,
        });
        break;
        
      case 'xai':
        stream = await xaiClient.chat.completions.create({
          model: imageFile ? 'grok-vision-beta' : 'grok-beta',
          messages: messages as any,
          stream: true,
          temperature: 0.7,
        });
        break;
    }

    let accumulatedContent = '';

    try {
      for await (const chunk of stream as any) {
        // Vérifier si le chunk a le bon format
        if (chunk.choices && chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          accumulatedContent += content;
          
          // Mettre à jour le message en temps réel
          context.setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });
          
          // Scroller après chaque mise à jour
          scrollToBottom();
        }
      }
    } catch (streamError) {
      console.error('Erreur pendant le streaming:', streamError);
      throw streamError;
    }

  } catch (error) {
    console.error('Erreur de streaming:', error);
    const errorMessage = createMessage('assistant', 'Une erreur est survenue', 'error');
    context.setMessages(prev => [...prev, errorMessage]);
    scrollToBottom();
  }
}

export async function handleNewMessage(message: string, context: ChatContext) {
  try {
    console.log(`Sending message with provider: ${context.provider}`);
    
    // Si c'est le premier message de la conversation
    if (context.messages.length === 0) {
      const title = await generateConversationTitle(message);
      context.setTitle(title);
    }
    
    // Ajouter le message utilisateur
    const userMessage = createMessage('user', message);
    context.setMessages(prev => [...prev, userMessage]);
    scrollToBottom();
    
    // Streamer la réponse
    await streamResponse(message, context);
    
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    const errorMessage = createMessage('assistant', 'Une erreur est survenue', 'error');
    context.setMessages(prev => [...prev, errorMessage]);
    scrollToBottom();
  }
}