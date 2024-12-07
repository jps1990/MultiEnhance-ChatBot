import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources';
import { Provider } from '@/types/Provider';

export class XAIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.x.ai/v1"
    });
  }

  async generateChat(
    messages: any[],
    model: string,
    temperature: number,
    stream: boolean
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>> {
    return await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      stream
    });
  }
} 