import { Conversation, Settings, ApiKeys } from '../types';
import CryptoJS from 'crypto-js';

const SETTINGS_KEY = 'chatbot_settings';
const CONVERSATIONS_KEY = 'chatbot_conversations';
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-default-secure-key-here';

const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const saveSettings = (settings: Omit<Settings, 'apiKeys'>): void => {
  try {
    const settingsToSave = {
      ...settings,
      lastUpdated: Date.now()
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = (): Partial<Settings> | null => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (!settings) return null;
    return JSON.parse(settings);
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
};

export const saveConversations = (conversations: Conversation[]): void => {
  try {
    const encryptedConversations = conversations.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg => ({
        ...msg,
        content: encryptData(msg.content),
        imageUrl: msg.imageUrl ? encryptData(msg.imageUrl) : undefined
      }))
    }));
    localStorage.setItem(CONVERSATIONS_KEY, encryptData(JSON.stringify(encryptedConversations)));
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
};

export const loadConversations = (): Conversation[] => {
  try {
    const encryptedData = localStorage.getItem(CONVERSATIONS_KEY);
    if (!encryptedData) return [];
    
    const decryptedData = decryptData(encryptedData);
    const conversations = JSON.parse(decryptedData);
    
    return conversations.map((conv: any) => ({
      ...conv,
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        content: decryptData(msg.content),
        imageUrl: msg.imageUrl ? decryptData(msg.imageUrl) : undefined
      }))
    }));
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
};

export const TOKENS_KEY = 'chatbot_tokens';

export const saveTokens = (tokens: ApiKeys): void => {
  try {
    const encryptedTokens = encryptData(JSON.stringify(tokens));
    localStorage.setItem(TOKENS_KEY, encryptedTokens);
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

export const loadTokens = (): ApiKeys | null => {
  try {
    const encryptedTokens = localStorage.getItem(TOKENS_KEY);
    if (!encryptedTokens) return null;
    const decryptedData = decryptData(encryptedTokens);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error loading tokens:', error);
    return null;
  }
};