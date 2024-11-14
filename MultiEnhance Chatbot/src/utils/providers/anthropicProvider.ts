import axios from 'axios';
import axiosRetry from 'axios-retry';

const axiosInstance = axios.create();
axiosRetry(axiosInstance, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ERR_NETWORK';
  }
});

export const makeAnthropicRequest = async (
  model: string,
  prompt: string,
  apiKey: string
) => {
  try {
    await axiosInstance.get('http://localhost:3001/health');
    
    const response = await axiosInstance({
      method: 'post',
      url: 'http://localhost:3001/anthropic',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey
      },
      data: {
        model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 1024
      },
      timeout: 30000
    });

    if (!response.data?.content?.[0]?.text) {
      throw new Error('Format de réponse invalide de l\'API Anthropic');
    }

    return {
      data: {
        choices: [{
          message: {
            content: response.data.content[0].text
          }
        }]
      }
    };
  } catch (error) {
    console.error('Anthropic API Error:', error);
    if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
      throw new Error('Le serveur proxy n\'est pas accessible. Veuillez vérifier qu\'il est bien démarré.');
    }
    throw error;
  }
};