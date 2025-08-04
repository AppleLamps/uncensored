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

// API key functions removed - now handled securely via Supabase Edge Functions
// These functions are kept as stubs to prevent breaking existing code
export const getApiKey = () => {
    console.warn('API keys are no longer stored in localStorage for security reasons');
    return null;
};

export const setApiKey = (apiKey) => {
    console.warn('API keys are no longer stored in localStorage for security reasons');
    return false;
};

export const clearApiKey = () => {
    console.warn('API keys are no longer stored in localStorage for security reasons');
    return false;
};

export const getGetimgApiKey = () => {
    console.warn('API keys are no longer stored in localStorage for security reasons');
    return null;
};

export const setGetimgApiKey = (apiKey) => {
    console.warn('API keys are no longer stored in localStorage for security reasons');
    return false;
};

export const clearGetimgApiKey = () => {
    console.warn('API keys are no longer stored in localStorage for security reasons');
    return false;
};
