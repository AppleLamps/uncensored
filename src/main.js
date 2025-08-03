// Main entry point for the Uncensored AI application
// This file coordinates all modules and ensures proper initialization

// Core modules
import { UncensoredAIApp } from './app.js';
import { ProfilePage } from './profile.js';
import { getState, setChats, setCurrentChatId, setSidebarExpanded, setDarkMode, updateChat } from './core/state.js';
import { loadChatsFromStorage, saveChatsToStorage, getApiKey, setApiKey, clearApiKey } from './core/storage.js';
// Components
import { initializeSidebar, toggleSidebar } from './components/sidebar.js';
import { renderChatList, switchToChat } from './components/chat-list.js';
import { setupComposer, handleFileAttach, initializeComposer } from './components/composer.js';
import { openImageModal } from './components/modal.js';
// Services
import { createNewChat, clearAllChatHistory } from './services/chat-service.js';
import { clearChatArea, addWelcomeMessage, addMessage, addMessageWithAttachments } from './services/message-service.js';
import { getAIResponse } from './services/api.js';
// Features
import { initializeDarkMode, toggleDarkMode } from './features/dark-mode.js';
import { setupMessageActionListeners, handleMessageAction } from './features/message-actions.js';
// Utilities
import { scrollToBottom, autosize, toggleSendDisabled, formatFileSize, getFileIcon, showActionFeedback } from './utils/dom-helpers.js';
import { formatMarkdown } from './utils/formatters.js';
import { updateSendButtonState } from './utils/file-utils.js';
import { exportChatToPDF } from './utils/pdf-export.js';
import { notificationManager } from './components/notifications.js';

// Global error handling
class UncensoredAIError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR') {
        super(message);
        this.name = 'UncensoredAIError';
        this.code = code;
    }
}

// Logger utility
const logger = {
    debug: (...args) => console.debug('[UncensoredAI]', ...args),
    info: (...args) => console.info('[UncensoredAI]', ...args),
    warn: (...args) => console.warn('[UncensoredAI]', ...args),
    error: (...args) => console.error('[UncensoredAI]', ...args)
};

// Global application state
const globalState = {
    isInitialized: false,
    currentPage: null,
    modules: new Map(),
    eventHandlers: new Map()
};

// Module registry for cross-module communication
const moduleRegistry = {
    app: null,
    profile: null,
    // Add other modules as needed
};

// Event system for cross-module communication
const eventSystem = {
    listeners: new Map(),
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    },
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    },
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    logger.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
};

// Global utility functions
const globalUtils = {
    // DOM helpers
    scrollToBottom,
    autosize,
    toggleSendDisabled,
    formatFileSize,
    getFileIcon,
    showActionFeedback,
    
    // Formatters
    formatMarkdown,
    
    // File utilities
    updateSendButtonState,
    
    // State management
    getState,
    setChats,
    setCurrentChatId,
    setSidebarExpanded,
    setDarkMode,
    
    // Storage operations
    loadChatsFromStorage,
    saveChatsToStorage,
    getApiKey,
    setApiKey,
    clearApiKey,
    
    // Event system
    on: eventSystem.on.bind(eventSystem),
    off: eventSystem.off.bind(eventSystem),
    emit: eventSystem.emit.bind(eventSystem),
    
    // Error handling
    handleError: (error, context = '') => {
        logger.error(`${context}:`, error);
        showActionFeedback(`❌ Error: ${error.message || 'Unknown error occurred'}`);
    },
    
    // Logger
    logger
};

// Module initialization coordinator
class ModuleCoordinator {
    constructor() {
        this.initializedModules = new Set();
        this.pendingInitializations = new Map();
    }
    
    async initializeModule(moduleName, initializer, dependencies = []) {
        // Check if all dependencies are initialized
        const missingDeps = dependencies.filter(dep => !this.initializedModules.has(dep));
        if (missingDeps.length > 0) {
            logger.warn(`Module ${moduleName} waiting for dependencies:`, missingDeps);
            return new Promise((resolve, reject) => {
                this.pendingInitializations.set(moduleName, {
                    initializer,
                    dependencies,
                    resolve,
                    reject
                });
            });
        }
        
        try {
            const result = await initializer();
            this.initializedModules.add(moduleName);
            logger.info(`Module ${moduleName} initialized successfully`);
            
            // Check if any pending modules can now be initialized
            this.checkPendingModules();
            
            return result;
        } catch (error) {
            logger.error(`Failed to initialize module ${moduleName}:`, error);
            throw new UncensoredAIError(`Module initialization failed: ${error.message}`, 'MODULE_INIT_ERROR');
        }
    }
    
    checkPendingModules() {
        for (const [moduleName, pending] of this.pendingInitializations.entries()) {
            const missingDeps = pending.dependencies.filter(dep => !this.initializedModules.has(dep));
            if (missingDeps.length === 0) {
                // All dependencies satisfied, initialize the module
                this.pendingInitializations.delete(moduleName);
                this.initializeModule(moduleName, pending.initializer, pending.dependencies)
                    .then(pending.resolve)
                    .catch(pending.reject);
            }
        }
    }
}

const moduleCoordinator = new ModuleCoordinator();

// Page detection and initialization
function detectCurrentPage() {
    if (document.getElementById('chatArea')) {
        return 'chat';
    } else if (document.getElementById('apiKeyForm')) {
        return 'profile';
    } else {
        return 'unknown';
    }
}

// Global event handlers setup
function setupGlobalEventHandlers() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', async (e) => {
        // Ctrl/Cmd + N for new chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (moduleRegistry.app) {
                const newChatId = createNewChat();
                await switchToChat(newChatId);
            }
        }
        
        // Ctrl/Cmd + Shift + C for clear history
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            if (confirm('Are you sure you want to clear all chat history?')) {
                await clearAllChatHistory();
            }
        }
    });
    
    // Global error handling
    window.addEventListener('error', (e) => {
        logger.error('Global error:', e.error);
        showActionFeedback('❌ Application error occurred');
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        logger.error('Unhandled promise rejection:', e.reason);
        showActionFeedback('❌ Application error occurred');
        e.preventDefault();
    });
    
    // Print/Export PDF button handler
    const printChatBtn = document.getElementById('printChatBtn');
    if (printChatBtn) {
        printChatBtn.addEventListener('click', async () => {
            try {
                const { currentChatId } = getState();
                if (!currentChatId) {
                    notificationManager.warning('No active chat to export');
                    return;
                }
                
                notificationManager.info('Generating PDF export...');
                await exportChatToPDF();
                notificationManager.success('Chat exported to PDF successfully!');
            } catch (error) {
                logger.error('PDF export failed:', error);
                notificationManager.error('Failed to export chat to PDF. Please try again.');
            }
        });
    }
    
    // Refresh chat button handler
    const refreshChatBtn = document.getElementById('refreshChatBtn');
    if (refreshChatBtn) {
        refreshChatBtn.addEventListener('click', async () => {
            try {
                const { currentChatId } = getState();
                if (!currentChatId) {
                    notificationManager.warning('No active chat to clear');
                    return;
                }
                
                // Get the chat area element
                const chatArea = document.getElementById('chatArea');
                if (!chatArea) {
                    logger.error('Chat area element not found');
                    return;
                }
                
                // Clear the chat area visually first
                chatArea.innerHTML = '';
                
                // Clear the current chat's messages from storage
                const currentState = getState();
                if (currentState.chats[currentChatId]) {
                    // Update the chat with empty messages array
                    updateChat(currentChatId, {
                        messages: [],
                        lastUpdated: new Date().toISOString()
                    });
                    
                    // Save the updated state to storage
                    const updatedState = getState();
                    saveChatsToStorage(updatedState.chats);
                    
                    logger.info(`Cleared chat ${currentChatId} - messages array length: ${updatedState.chats[currentChatId].messages.length}`);
                }
                
                // Add welcome message back (this only renders, doesn't store)
                setTimeout(() => {
                    addWelcomeMessage();
                }, 100);
                
                notificationManager.success('Chat cleared successfully!');
                logger.info('Chat cleared via refresh button');
            } catch (error) {
                logger.error('Failed to clear chat:', error);
                notificationManager.error('Failed to clear chat. Please try again.');
            }
        });
    }
    
    // Store event handlers for cleanup
    globalState.eventHandlers.set('global-keydown', async (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (moduleRegistry.app) {
                const newChatId = createNewChat();
                await switchToChat(newChatId);
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            if (confirm('Are you sure you want to clear all chat history?')) {
                await clearAllChatHistory();
            }
        }
    });
}

// Chat page initialization
async function initializeChatPage() {
    try {
        logger.info('Initializing chat page...');
        
        // Create main app instance (it will handle all initialization internally)
        const app = new UncensoredAIApp();
        moduleRegistry.app = app;
        window.uncensoredAIApp = app;
        
        // Setup global event handlers
        setupGlobalEventHandlers();
        
        logger.info('Chat page initialized successfully');
        return app;
    } catch (error) {
        logger.error('Failed to initialize chat page:', error);
        throw new UncensoredAIError('Chat page initialization failed', 'CHAT_PAGE_INIT_ERROR');
    }
}

// Profile page initialization
async function initializeProfilePage() {
    try {
        logger.info('Initializing profile page...');
        
        // Create profile page instance
        const profile = new ProfilePage();
        moduleRegistry.profile = profile;
        window.profilePage = profile;
        
        logger.info('Profile page initialized successfully');
        return profile;
    } catch (error) {
        logger.error('Failed to initialize profile page:', error);
        throw new UncensoredAIError('Profile page initialization failed', 'PROFILE_PAGE_INIT_ERROR');
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (globalState.isInitialized) {
            logger.warn('Application already initialized');
            return;
        }
        
        globalState.isInitialized = true;
        globalState.currentPage = detectCurrentPage();
        
        logger.info(`Application starting on ${globalState.currentPage} page`);
        
        // Initialize appropriate page
        switch (globalState.currentPage) {
            case 'chat':
                await moduleCoordinator.initializeModule('chat-page', initializeChatPage);
                break;
            case 'profile':
                await moduleCoordinator.initializeModule('profile-page', initializeProfilePage);
                break;
            default:
                logger.warn('Unknown page type detected');
        }
        
        logger.info('Application initialized successfully');
        
    } catch (error) {
        logger.error('Application initialization failed:', error);
        showActionFeedback('❌ Failed to initialize application');
    }
});

// Cleanup function for proper shutdown
function cleanup() {
    logger.info('Cleaning up application...');
    
    // Remove global event listeners
    globalState.eventHandlers.forEach((handler, eventName) => {
        if (eventName.startsWith('global-')) {
            const eventType = eventName.replace('global-', '');
            document.removeEventListener(eventType, handler);
        }
    });
    
    // Cleanup any ongoing operations
    if (moduleRegistry.app && typeof moduleRegistry.app.cleanup === 'function') {
        moduleRegistry.app.cleanup();
    }
    
    if (moduleRegistry.profile && typeof moduleRegistry.profile.cleanup === 'function') {
        moduleRegistry.profile.cleanup();
    }
}

// Export all modules and utilities for external access
export {
    // Main modules
    UncensoredAIApp,
    ProfilePage,
    
    // Core utilities
    globalUtils as utils,
    
    // Components
    initializeSidebar,
    toggleSidebar,
    renderChatList,
    switchToChat,
    setupComposer,
    handleFileAttach,
    initializeComposer,
    openImageModal,
    
    // Services
    createNewChat,
    clearAllChatHistory,
    clearChatArea,
    addWelcomeMessage,
    addMessage,
    addMessageWithAttachments,
    getAIResponse,
    
    // Features
    initializeDarkMode,
    toggleDarkMode,
    setupMessageActionListeners,
    handleMessageAction,
    
    // Utilities
    scrollToBottom,
    autosize,
    toggleSendDisabled,
    formatFileSize,
    getFileIcon,
    showActionFeedback,
    formatMarkdown,
    updateSendButtonState,
    
    // State management
    getState,
    setChats,
    setCurrentChatId,
    setSidebarExpanded,
    setDarkMode,
    
    // Storage operations
    loadChatsFromStorage,
    getApiKey,
    setApiKey,
    clearApiKey,
    
    // Event system
    eventSystem,
    
    // Module registry
    moduleRegistry,
    
    // Global functions
    detectCurrentPage,
    setupGlobalEventHandlers,
    cleanup
};

// Global namespace for backward compatibility
window.UncensoredAI = {
    app: UncensoredAIApp,
    profile: ProfilePage,
    utils: globalUtils,
    events: eventSystem,
    modules: moduleRegistry,
    cleanup
};

logger.info('Uncensored AI - Modularized Application Loaded');
