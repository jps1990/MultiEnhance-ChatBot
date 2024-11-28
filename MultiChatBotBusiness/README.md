# Enhanced-Multi-Provider-Chatbot-Business-Edition
 Chatbot Business Edition
README.md - MultiChatBot Business 🤖
Tabarnak! Ok, on y va simple pis direct!
C'est quoi c't'affaire-là? 🤔
Un chatbot multi-modèles avec encryption locale des API keys. Y peut:
Gérer OpenAI, Anthropic pis Cohere
Générer des images avec DALL-E
Jaser en vocal
Sauvegarder les conversations localement
Encrypter les API keys dans le storage du browser
Installation 🛠️
Clone le repo
npm install (pis attends que ça finisse)
Crée un fichier .env avec:
Développement 🚀
npm run dev - Lance le serveur de dev
npm run build - Build pour la prod
npm run preview - Preview la build
Features 🌟
Modèles Supportés
OpenAI: GPT-4o, GPT-4-turbo, GPT-4, GPT-3.5-turbo, DALL-E 3/2
Anthropic: Toute la famille Claude 3 (Opus, Sonnet, Haiku)
Cohere: Command, Command-Light, Command-R
Paramètres Intelligents
1. Chat Bavard 🗣️
Temperature: 0.7-0.9
Pénalités ajustées pour une conversation naturelle
Chat Code 💻
Temperature: 0.1-0.3
Pénalités minimales pour du code précis
Chat Prof 📚
Temperature: 0.4-0.6
Balance entre précision et créativité
Mode Jailbreak 😈
Mode spécial avec température à 1
Réponses plus libres et créatives
Activation par bouton dédié
Sécurité 🔒
Encryption locale des API keys avec CryptoJS
Stockage sécurisé dans le localStorage
Protection contre les fuites de clés
JAMAIS de clés en dur dans le code
Structure du Projet 📁
Contribution 🤝
Fork le repo
Crée une branche
Push tes changes
Ouvre une PR
Règles d'or:
Touche pas à l'encryption
Teste AVANT de pusher
Pas de console.log qui traîne
Pas d'API keys en dur JAMAIS
License 📄
MIT (Fais-en c'que tu veux, mais assume!)
---
NOTES IMPORTANTES:
La clé d'encryption est OBLIGATOIRE
Les API keys sont entrées par les users dans l'app
Tout est encrypté localement
Les conversations sont sauvegardées dans le localStorage
RAPPELS:
Backup tes données régulièrement
Garde ta clé d'encryption secrète
Si tu casses l'encryption, c'est TON problème!