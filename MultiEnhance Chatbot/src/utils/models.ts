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
    'command-r-plus-04-2024', // Modèle optimisé pour les tâches complexes de RAG et l'utilisation d'outils
    'command-r-08-2024', // Modèle optimisé pour les tâches de RAG
    'command', // Modèle de base pour diverses tâches
    'command-light', // Version allégée pour des performances plus rapides
    'command-nightly' // Version mise à jour quotidiennement avec les dernières améliorations
  ]
};