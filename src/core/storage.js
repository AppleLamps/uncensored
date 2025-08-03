import { APP_CONSTANTS } from './constants.js';

// Local Storage Operations
export const saveChatsToStorage = (chats) => {
    try {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.CHATS, JSON.stringify(chats));
        return true;
    } catch (error) {
        console.warn('Failed to save chats to localStorage:', error);
        return false;
    }
};

export const loadChatsFromStorage = () => {
    try {
        const stored = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.CHATS);
        if (stored) {
            return JSON.parse(stored);
        }
        return {};
    } catch (error) {
        console.warn('Failed to load chats from localStorage:', error);
        return {};
    }
};

export const clearChatsFromStorage = () => {
    try {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.CHATS);
        return true;
    } catch (error) {
        console.warn('Failed to clear chats from localStorage:', error);
        return false;
    }
};

export const getApiKey = () => {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.API_KEY);
};

export const setApiKey = (apiKey) => {
    try {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.API_KEY, apiKey);
        return true;
    } catch (error) {
        console.warn('Failed to save API key to localStorage:', error);
        return false;
    }
};

export const clearApiKey = () => {
    try {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.API_KEY);
        return true;
    } catch (error) {
        console.warn('Failed to clear API key from localStorage:', error);
        return false;
    }
};

export const getGetimgApiKey = () => {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.GETIMG_API_KEY);
};

export const setGetimgApiKey = (apiKey) => {
    try {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.GETIMG_API_KEY, apiKey);
        return true;
    } catch (error) {
        console.warn('Failed to save GETIMG API key to localStorage:', error);
        return false;
    }
};

export const clearGetimgApiKey = () => {
    try {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.GETIMG_API_KEY);
        return true;
    } catch (error) {
        console.warn('Failed to clear GETIMG API key from localStorage:', error);
        return false;
    }
};
