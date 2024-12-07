export const MODELS = {
  // ...existing models
  "grok-beta": {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "xai",
    streaming: true,
    inputCostPer1000: 0.0002,
    outputCostPer1000: 0.002,
    maxTokens: 4096,
    description: "Modèle conversationnel inspiré par le Guide du Voyageur Galactique"
  }
} as const; 