import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Mic, VolumeX, HelpCircle, X } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import { ModelSelector } from './components/ModelSelector';
import ConfigPanel from './components/ConfigPanel';
import ConversationList from './components/ConversationList';
import FileUpload from './components/FileUpload';
import { SettingsGuide } from './components/SettingsGuide';
import type { Conversation, ApiKeys, Message } from './types';
import { handleKeyboardShortcuts } from './utils/keyboardShortcuts';
import { handleApiCall } from './utils/apiHelpers';
import { createMessage } from './utils/messageHandlers';
import { generateImage } from './utils/imageHelpers';
import { defaultSystemPrompt } from './utils/systemPrompts';
import { models } from './utils/models';
import { 
  saveSettings, 
  loadSettings, 
  saveConversations, 
  loadConversations,
  saveTokens,
  loadTokens 
} from './utils/localStorage';
import { jailbreakPrompt } from './utils/jailbreakPrompt';


export const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState<number>(0);
  const [input, setInput] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    cohere: import.meta.env.VITE_COHERE_API_KEY || '',
  });
  const [selectedModel, setSelectedModel] = useState(models.openai[0]);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [temperature, setTemperature] = useState(0.7);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [userPrompt, setUserPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSettingsGuide, setShowSettingsGuide] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [imageSize, setImageSize] = useState<string>('1024x1024');
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard');
  const [imageStyle, setImageStyle] = useState<'natural' | 'vivid'>('natural');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<Message[]>([
    createMessage(
      'system',
      'Salut! Je suis ton assistant personnel. Comment puis-je t\'aider aujourd\'hui? 🤖',
      'text'
    )
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [imageSeed, setImageSeed] = useState<string>('');

  useEffect(() => {
    // Charger les tokens sauvegardés
    const savedTokens = loadTokens();
    if (savedTokens) {
      setApiKeys(savedTokens);
    }

    // Charger les paramètres sauvegardés
    const savedSettings = loadSettings();
    if (savedSettings) {
      setTemperature(savedSettings.temperature || 0.7);
      setSystemPrompt(savedSettings.systemPrompt || defaultSystemPrompt);
      setMaxTokens(savedSettings.maxTokens || 4000);
    }

    // Charger les conversations sauvegardées
    const savedConversations = loadConversations();
    if (savedConversations.length > 0) {
      setConversations(savedConversations);
      setCurrentConversationIndex(0);
    }
  }, []);

  useEffect(() => {
    saveSettings({
      temperature,
      systemPrompt,
      maxTokens,
      imageSettings: {
        size: imageSize,
        quality: imageQuality,
        style: imageStyle
      }
    });
  }, [temperature, systemPrompt, maxTokens, imageSize, imageQuality, imageStyle]);

  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    saveTokens(apiKeys);
  }, [apiKeys]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  }, [isListening]);

  const newLine = useCallback(() => {
    if (inputRef.current) {
      const { selectionStart, selectionEnd } = inputRef.current;
      const newValue = input.substring(0, selectionStart) + '\n' + input.substring(selectionEnd);
      setInput(newValue);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = selectionStart + 1;
        }
      }, 0);
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    try {
      if (!conversations[currentConversationIndex]) {
        const newConversation: Conversation = {
          id: Date.now(),
          messages: [],
          title: input.trim().split(' ').slice(0, 5).join(' ') || 'Nouvelle Conversation'
        };
        setConversations([...conversations, newConversation]);
        setCurrentConversationIndex(conversations.length);
      }

      const currentConversation = conversations[currentConversationIndex];
      const updatedConversations = [...conversations];
      setInput('');

      if (!input.trim() && !uploadedFile) return;

      const userMessage = createMessage('user', input);
      updatedConversations[currentConversationIndex].messages.push(userMessage);
      setConversations(updatedConversations);

      if (selectedModel.includes('dall-e')) {
        await handleDallERequest(currentConversation, updatedConversations);
      } else {
        await handleNormalRequest(currentConversation, updatedConversations);
      }
    } catch (error) {
      console.error('Error:', error);
      handleError(error, conversations);
    }
  }, [conversations, currentConversationIndex, input, uploadedFile, selectedProvider, selectedModel, apiKeys, temperature, imageSize, imageQuality, imageStyle, imageSeed]);

  const handleDallERequest = async (currentConversation: Conversation, updatedConversations: Conversation[]) => {
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImage(apiKeys.openai, {
        model: selectedModel,
        prompt: input,
        n: 1,
        size: imageSize,
        quality: imageQuality,
        style: imageStyle,
        seed: imageSeed
      });
      
      const imageMessage = createMessage('assistant', input, 'image', imageUrl);
      currentConversation.messages.push(imageMessage);
      setConversations([...updatedConversations]);
    } catch (error) {
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleNormalRequest = async (currentConversation: Conversation, updatedConversations: Conversation[]) => {
    const imageSettings = {
      size: imageSize,
      quality: imageQuality,
      style: imageStyle,
      seed: imageSeed
    };

    const response = await handleApiCall(
      selectedProvider,
      selectedModel,
      { ...apiKeys },
      input,
      temperature,
      uploadedFile,
      imageSettings
    );

    const assistantMessage = createMessage(
      'assistant',
      response.content,
      response.type,
      response.imageUrl
    );

    updatedConversations[currentConversationIndex].messages.push(assistantMessage);
    setConversations(updatedConversations);
  };

  const handleError = (error: unknown) => {
    const errorMessage = createMessage(
      'system',
      error instanceof Error ? error.message : 'Une erreur est survenue',
      'error'
    );
    
    setChatbotMessages(prev => [...prev, errorMessage]);
  };

  const handleJailbreak = () => {
    // Mettre à jour le prompt utilisateur avec le jailbreak
    setUserPrompt(jailbreakPrompt);
    
    // Créer une nouvelle conversation pour le mode jailbreak
    const jailbreakConversation: Conversation = {
      id: Date.now(),
      messages: [],
      title: '🔓 Mode Jailbreak'
    };
    
    // Ajouter la nouvelle conversation et la sélectionner
    setConversations([...conversations, jailbreakConversation]);
    setCurrentConversationIndex(conversations.length);
    
    // Ajuster la température pour plus de créativité
    setTemperature(1);
    
    // Ajouter un message système pour confirmer le mode jailbreak
    const systemMessage = createMessage(
      'system',
      'Mode jailbreak activé! Je suis maintenant plus libre dans mes réponses. 😈',
      'text'
    );
    
    // Mettre à jour la conversation avec le message systme
    const updatedConversations = [...conversations, jailbreakConversation];
    updatedConversations[updatedConversations.length - 1].messages.push(systemMessage);
    setConversations(updatedConversations);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (conversations[currentConversationIndex]) {
        handleKeyboardShortcuts(event, handleSend, toggleListening, newLine);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSend, toggleListening, newLine]);

  const createNewConversation = () => {
    const newConversation: Conversation = { 
      id: Date.now(), 
      messages: [],
      title: 'New Chat'
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversationIndex(conversations.length);
  };

  const deleteConversation = (index: number) => {
    const updatedConversations = conversations.filter((_, i) => i !== index);
    setConversations(updatedConversations);
    if (currentConversationIndex >= updatedConversations.length) {
      setCurrentConversationIndex(Math.max(0, updatedConversations.length - 1));
    }
  };

  const renameConversation = (index: number, newTitle: string) => {
    const updatedConversations = [...conversations];
    updatedConversations[index].title = newTitle;
    setConversations(updatedConversations);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations[currentConversationIndex]?.messages]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
    }
  };

  const handleChatbotMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = createMessage('user', message, 'text');
    setChatbotMessages(prev => [...prev, userMessage]);

    try {
      const imageSettings = {
        size: imageSize,
        quality: imageQuality,
        style: imageStyle,
        seed: imageSeed
      };

      const response = await handleApiCall(
        selectedProvider,
        selectedModel,
        { ...apiKeys },
        message,
        temperature,
        null,
        imageSettings
      );

      const assistantMessage = createMessage(
        'assistant',
        response.content,
        response.type,
        response.imageUrl
      );

      setChatbotMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = createMessage(
        'system',
        error instanceof Error ? error.message : 'Une erreur est survenue',
        'error'
      );
      setChatbotMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-blue-300">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <Bot className="mr-2" /> Enhanced Multi-Provider AI Chatbot
          {conversations[currentConversationIndex]?.messages.length > 0 && <span className="ml-2">!</span>}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-2"
            title="Assistant Personnel"
          >
            <Bot size={20} />
            <span>Assistant</span>
          </button>
          <button
            onClick={handleJailbreak}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Jailbreak
          </button>
          <button
            onClick={() => setShowSettingsGuide(true)}
            className="p-2 hover:bg-gray-700 rounded-full"
            title="Settings Guide"
          >
            <HelpCircle size={24} />
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded ${
                activeTab === 'chat' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded ${
                activeTab === 'config' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      {showSettingsGuide && (
        <SettingsGuide onClose={() => setShowSettingsGuide(false)} />
      )}

      {activeTab === 'chat' ? (
        <div className="flex flex-grow overflow-hidden">
          <ConversationList
            conversations={conversations}
            currentIndex={currentConversationIndex}
            onSelect={setCurrentConversationIndex}
            onNew={createNewConversation}
            onDelete={deleteConversation}
            onRename={renameConversation}
          />
          <div className="flex-grow flex flex-col">
            <div className="flex-grow overflow-auto p-4 space-y-4">
              {conversations[currentConversationIndex]?.messages.map((message, index) => (
  <ChatMessage 
    key={index} 
    message={message} 
    onSpeak={handleSpeak}
    isSpeaking={isSpeaking}
  />
))}
<div ref={messagesEndRef} />
              {isGeneratingImage && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Generating image...</span>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-800">
              <ModelSelector
                provider={selectedProvider}
                model={selectedModel}
                onProviderChange={setSelectedProvider}
                onModelChange={setSelectedModel}
                imageSize={imageSize}
                onImageSizeChange={setImageSize}
                imageQuality={imageQuality}
                onImageQualityChange={setImageQuality}
                imageStyle={imageStyle}
                onImageStyleChange={setImageStyle}
              />
              <div className="flex mt-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow p-2 rounded-l-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                  rows={3}
                  ref={inputRef}
                />
                <FileUpload onFileUpload={setUploadedFile} />
                <button
                  onClick={toggleListening}
                  className={`p-2 ${isListening ? 'bg-red-600' : 'bg-green-600'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {isListening ? <VolumeX size={24} /> : <Mic size={24} />}
                </button>
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ConfigPanel
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          temperature={temperature}
          setTemperature={setTemperature}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          onClose={() => setActiveTab('chat')}
          imageSeed={imageSeed}
          setImageSeed={setImageSeed}
        />
      )}
      
      {showChatbot && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-gray-800 rounded-lg shadow-xl flex flex-col z-50">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="font-bold">Assistant Personnel</h3>
            <button 
              onClick={() => setShowChatbot(false)}
              className="hover:bg-gray-700 p-2 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatbotMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onSpeak={handleSpeak}
                isSpeaking={isSpeaking}
              />
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatbotInput.trim()) {
                  handleChatbotMessage(chatbotInput);
                  setChatbotInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                placeholder="Écris ton message ici..."
                className="flex-1 bg-gray-700 rounded-l px-3 py-2"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 rounded-r hover:bg-blue-700"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;