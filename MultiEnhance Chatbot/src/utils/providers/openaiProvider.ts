import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const makeOpenAIRequest = async (
  model: string,
  prompt: string,
  temperature: number,
  apiKey: string,
  uploadedFile: File | null
) => {
  const client = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
    timeout: 30000,
    maxRetries: 2
  });

  try {
    let messages: ChatCompletionMessageParam[] = [];

    if (model === 'gpt-4-vision-preview' && uploadedFile) {
      const base64Image = await fileToBase64(uploadedFile);
      messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }
      ];
    } else {
      messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];
    }

    const requestData = {
      model,
      messages,
      temperature,
      stream: true as const,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };

    console.log('🚀 OpenAI Request:', JSON.stringify(requestData, null, 2));

    const stream = await client.chat.completions.create(requestData);
    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      console.log('📝 Chunk received:', content);
    }

    const response = {
      data: {
        choices: [{
          message: {
            content: fullContent,
            role: 'assistant'
          }
        }]
      }
    };

    console.log('✅ OpenAI Full Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};