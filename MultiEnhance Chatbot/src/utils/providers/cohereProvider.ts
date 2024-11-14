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

  return axios.post(
    'https://api.cohere.ai/v1/generate',
    {
      prompt,
      model,
      max_tokens: 300,
      temperature,
    },
    { headers }
  );
};