import { APP_CONSTANTS } from './constants.js';

// State Management
let currentChatId = null;
let chats = {};
let sidebarExpanded = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SIDEBAR_EXPANDED) === 'true';

// Debug dark mode loading
const darkModeValue = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.DARK_MODE);
console.log('Loading dark mode from localStorage:');
console.log('- Storage key:', APP_CONSTANTS.STORAGE_KEYS.DARK_MODE);
console.log('- Raw value from localStorage:', darkModeValue);
console.log('- Parsed boolean value:', darkModeValue === 'true');

let darkMode = darkModeValue === 'true';

// State getters
export const getState = () => ({
    currentChatId,
    chats,
    sidebarExpanded,
    darkMode
});

// State setters
export const setCurrentChatId = (chatId) => {
    currentChatId = chatId;
};

export const setChats = (newChats) => {
    chats = newChats;
};

export const setSidebarExpanded = (expanded) => {
    sidebarExpanded = expanded;
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.SIDEBAR_EXPANDED, expanded);
};

export const setDarkMode = (mode) => {
    darkMode = mode;
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.DARK_MODE, mode);
};

// Chat-specific state operations
export const getCurrentChat = () => {
    return chats[currentChatId] || null;
};

export const addChat = (chat) => {
    chats[chat.id] = chat;
};

export const removeChat = (chatId) => {
    delete chats[chatId];
};

export const updateChat = (chatId, updates) => {
    if (chats[chatId]) {
        chats[chatId] = { ...chats[chatId], ...updates };
    }
};

export const clearAllChats = () => {
    chats = {};
    currentChatId = null;
};
