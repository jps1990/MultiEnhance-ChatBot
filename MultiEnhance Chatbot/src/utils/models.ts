export const models = {
  openai: [
    'gpt-4o', // Modèle multimodal avancé avec capacités de vision et audio
    'gpt-4-turbo', // Version optimisée de GPT-4 pour des performances accrues
    'gpt-4', // Modèle de base GPT-4
    'gpt-3.5-turbo', // Version optimisée de GPT-3.5
    'dall-e-3', // Modèle de génération d'images haute qualité
    'dall-e-2'  // Modèle de génération d'images rapide
  ],
  anthropic: [
    'claude-3.5-sonnet-20241022', // Modèle le plus avancé de la famille Claude 3.5
    'claude-3.5-haiku-20241022', // Modèle rapide et performant de Claude 3.5
    'claude-3-opus-20240229', // Modèle performant de la famille Claude 3
    'claude-3-sonnet-20240229', // Modèle intermédiaire de Claude 3
    'claude-3-haiku-20240307' // Modèle léger et rapide de Claude 3
  ],
  cohere: [
    'command-r-plus-04-2024',
    'command-r-08-2024',
    'command',
    'command-light',
    'command-nightly'
  ],
  xai: [
    'grok-beta',
    'grok-vision-beta'
  ]
 };

// Prix par MILLION de tokens (sauf pour DALL-E qui reste en prix par image)
export const getModelPrice = (model: string): number => {
  const prices: { [key: string]: number } = {
    // Prix par million de tokens (×1000 par rapport aux prix par 1k tokens)
    'gpt-4o': 30,              // $0.03 * 1000 = $30/M tokens
    'gpt-4-turbo': 20,         // $0.02 * 1000 = $20/M tokens
    'gpt-4': 15,               // $0.015 * 1000 = $15/M tokens
    'gpt-3.5-turbo': 2,        // $0.002 * 1000 = $2/M tokens
    
    // Prix par image (inchangés)
    'dall-e-3': 0.04,          // $0.04/image
    'dall-e-2': 0.02,          // $0.02/image
    
    // Prix par million de tokens (×1000 par rapport aux prix par 1k tokens)
    'claude-3.5-sonnet-20241022': 15,    // $0.015 * 1000 = $15/M tokens
    'claude-3.5-haiku-20241022': 10,     // $0.01 * 1000 = $10/M tokens
    'claude-3-opus-20240229': 25,        // $0.025 * 1000 = $25/M tokens
    'claude-3-sonnet-20240229': 15,      // $0.015 * 1000 = $15/M tokens
    'claude-3-haiku-20240307': 8,        // $0.008 * 1000 = $8/M tokens
    'command-r-plus-04-2024': 15,        // $0.015 * 1000 = $15/M tokens
    'command-r-08-2024': 10,             // $0.01 * 1000 = $10/M tokens
    'command': 8,                        // $0.008 * 1000 = $8/M tokens
    'command-light': 5,                  // $0.005 * 1000 = $5/M tokens
    'command-nightly': 12,               // $0.012 * 1000 = $12/M tokens
    'grok-beta': 5,                      // $0.005 * 1000 = $5/M tokens
    'grok-vision-beta': 15               // $0.015 * 1000 = $15/M tokens
  };
  return prices[model] || 0;
};