import { APP_CONSTANTS } from '../core/constants.js';
import { getState, addChat, removeChat, updateChat, clearAllChats } from '../core/state.js';
import { saveChatsToStorage, clearChatsFromStorage } from '../core/storage.js';
import { switchToChat, renderChatList } from '../components/chat-list.js';

// Chat Management Service
export const generateChatId = () => {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const createNewChat = () => {
    const { chats } = getState();
    const chatId = generateChatId();
    const now = new Date().toISOString();
    
    const newChat = {
        id: chatId,
        title: APP_CONSTANTS.DEFAULT_CHAT_TITLE,
        messages: [],
        created: now,
        lastUpdated: now
    };
    
    addChat(newChat);
    saveChatsToStorage(chats);
    renderChatList();
    
    return chatId;
};

export const deleteChat = async (chatId) => {
    const { chats } = getState();
    if (!chats[chatId]) return;
    
    removeChat(chatId);
    saveChatsToStorage(chats);
    
    // If deleting current chat, switch to another or create new
    const { currentChatId } = getState();
    if (currentChatId === chatId) {
        const remainingChats = Object.keys(chats);
        if (remainingChats.length > 0) {
            await switchToChat(remainingChats[0]);
        } else {
            const newChatId = createNewChat();
            await switchToChat(newChatId);
        }
    }
    
    renderChatList();
};

export const updateChatTitle = (chatId, newTitle) => {
    const { chats } = getState();
    if (!chats[chatId]) return;
    
    updateChat(chatId, {
        title: newTitle.substring(0, APP_CONSTANTS.MAX_TITLE_LENGTH),
        lastUpdated: new Date().toISOString()
    });
    
    saveChatsToStorage(chats);
    renderChatList();
};

export const clearAllChatHistory = async () => {
    // Double confirmation to prevent accidental deletion
    const confirmMessage = 'Are you sure you want to delete ALL chat history? This action cannot be undone.';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Second confirmation for extra safety
    const finalConfirm = 'This will permanently delete all your conversations. Are you absolutely sure?';
    
    if (!confirm(finalConfirm)) {
        return;
    }
    
    // Clear all chats
    clearAllChats();
    clearChatsFromStorage();
    
    // Create a new default chat
    const newChatId = createNewChat();
    await switchToChat(newChatId);
    
    // Show success feedback
    setTimeout(() => {
        alert('Chat history has been cleared successfully.');
    }, 100);
};

export const loadChatMessages = (chatId) => {
    const { chats } = getState();
    if (!chats[chatId]) return [];
    return chats[chatId].messages;
};

export const saveCurrentChatMessages = (messages) => {
    const { currentChatId, chats } = getState();
    if (!currentChatId) return;
    
    updateChat(currentChatId, {
        messages: messages,
        lastUpdated: new Date().toISOString()
    });
    
    saveChatsToStorage(chats);
};
