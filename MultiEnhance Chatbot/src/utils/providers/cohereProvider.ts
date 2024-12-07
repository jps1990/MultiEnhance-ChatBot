import axios from 'axios';

export const makeCohereRequest = async (
  model: string,
  prompt: string,
  temperature: number,
  apiKey: string
) => {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const requestData = {
    prompt,
    model,
    max_tokens: 1000,
    temperature,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    stream: true,
    timeout: 30000
  };

  console.log('🚀 Cohere Request:', JSON.stringify(requestData, null, 2));

  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      requestData,
      { 
        headers,
        timeout: 30000,
        responseType: 'stream'
      }
    );

    let fullContent = '';
    for await (const chunk of response.data) {
      const content = chunk.toString();
      fullContent += content;
      console.log('📝 Cohere Chunk received:', content);
    }

    const formattedResponse = {
      data: {
        generations: [{
          text: fullContent
        }]
      }
    };

    console.log('✅ Cohere Full Response:', JSON.stringify(formattedResponse, null, 2));
    return formattedResponse;
  } catch (error) {
    console.error('❌ Cohere API Error:', error);
    throw error;
  }
};