import { APP_CONSTANTS } from '../core/constants.js';
import { getState, updateChat } from '../core/state.js';
import { saveChatsToStorage } from '../core/storage.js';
import { renderMessage } from '../components/message-renderer.js';

// Message Management Service
export const addWelcomeMessage = () => {
    const welcomeMessage = {
        sender: 'ai',
        text: 'Welcome To Uncensored AI',
        timestamp: new Date().toISOString(),
        hasUpgrade: true
    };
    
    renderMessage(welcomeMessage);
};

export const addMessage = (sender, text, hasUpgrade = false) => {
    const message = {
        sender: sender,
        text: text,
        timestamp: new Date().toISOString(),
        hasUpgrade: hasUpgrade
    };
    
    renderMessage(message);
    
    // Add to current chat
    const { currentChatId, chats } = getState();
    if (currentChatId && chats[currentChatId]) {
        const updatedMessages = [...chats[currentChatId].messages, message];
        updateChat(currentChatId, {
            messages: updatedMessages,
            lastUpdated: new Date().toISOString()
        });
        
        // Auto-generate title from first user message
        if (sender === 'user' && chats[currentChatId].title === APP_CONSTANTS.DEFAULT_CHAT_TITLE) {
            const title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
            updateChat(currentChatId, { title });
        }
        
        saveChatsToStorage(chats);
    }
    
    return message;
};

export const addMessageWithAttachments = (sender, text, attachments = []) => {
    const message = {
        sender: sender,
        text: text,
        attachments: attachments,
        timestamp: new Date().toISOString()
    };
    
    renderMessage(message);
    
    // Add to current chat
    const { currentChatId, chats } = getState();
    if (currentChatId && chats[currentChatId]) {
        const updatedMessages = [...chats[currentChatId].messages, message];
        updateChat(currentChatId, {
            messages: updatedMessages,
            lastUpdated: new Date().toISOString()
        });
        
        // Auto-generate title from first user message
        if (sender === 'user' && chats[currentChatId].title === APP_CONSTANTS.DEFAULT_CHAT_TITLE) {
            const title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
            updateChat(currentChatId, { title });
        }
        
        saveChatsToStorage(chats);
    }
    
    return message;
};

export const clearChatArea = (chatArea) => {
    if (chatArea) {
        chatArea.innerHTML = '';
    }
};
