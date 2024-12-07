import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const makeXAIRequest = async (
  model: string,
  prompt: string,
  temperature: number,
  apiKey: string
) => {
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.x.ai/v1',
    dangerouslyAllowBrowser: true,
    timeout: 30000,
    maxRetries: 2
  });

  try {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const requestData = {
      model,
      messages,
      temperature,
      stream: true as const,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      timeout: 30
    };
    
    console.log('🚀 xAI Request:', JSON.stringify(requestData, null, 2));

    const stream = await client.chat.completions.create(requestData);
    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      console.log('📝 Chunk received:', content);
    }

    const response = {
      choices: [{
        message: {
          content: fullContent,
          role: 'assistant'
        }
      }]
    };

    console.log('✅ xAI Full Response:', JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error('❌ xAI API Error:', error);
    throw error;
  }
}; 