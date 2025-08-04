import { APP_CONSTANTS } from './core/constants.js';
import { getState, setChats, setSidebarExpanded } from './core/state.js';
import { loadChatsFromStorage } from './core/storage.js';
import { initializeSidebar, toggleSidebar } from './components/sidebar.js';
import { initializeDarkMode, toggleDarkMode } from './features/dark-mode.js';
import { switchToChat } from './components/chat-list.js';
import { setupComposer, handleFileAttach, initializeComposer } from './components/composer.js';
import { addMessageWithAttachments } from './services/message-service.js';
import { createNewChat, clearAllChatHistory } from './services/chat-service.js';
import { getAIResponse } from './services/secure-api.js';
import { openImageModal } from './components/modal.js';
import { autosize } from './utils/dom-helpers.js';
import { updateSendButtonState } from './utils/file-utils.js';

// Main Application Module
class UncensoredAIApp {
    constructor() {
        // Add mutex for preventing race conditions in async operations
        this.operationLock = false;
        this.initializeApp();
    }
    
    async initializeApp() {
        // Load state from storage
        const storedChats = loadChatsFromStorage();
        setChats(storedChats);
        
        // Initialize UI components
        const { sidebarExpanded, darkMode } = getState();
        console.log('App initialization - State loaded:');
        console.log('- sidebarExpanded:', sidebarExpanded);
        console.log('- darkMode:', darkMode);
        
        initializeSidebar(sidebarExpanded);
        console.log('About to call initializeDarkMode with:', darkMode);
        initializeDarkMode(darkMode);
        console.log('initializeDarkMode call completed');
        initializeComposer();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Create initial chat if none exist (with operation lock)
        const { chats } = getState();
        if (Object.keys(chats).length === 0) {
            const newChatId = createNewChat();
            await this.safeSwitchToChat(newChatId);
        } else {
            // Load the most recent chat
            const chatIds = Object.keys(chats).sort((a, b) => 
                new Date(chats[b].lastUpdated) - new Date(chats[a].lastUpdated)
            );
            await this.safeSwitchToChat(chatIds[0]);
        }
    }
    
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
        
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        console.log('Dark mode button found:', !!darkModeToggle);
        if (darkModeToggle) {
            console.log('Adding dark mode event listener');
            darkModeToggle.addEventListener('click', toggleDarkMode);
        } else {
            console.error('Dark mode toggle button not found!');
        }
        
        // New chat button
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', async () => {
                const newChatId = createNewChat();
                await this.safeSwitchToChat(newChatId);
            });
        }
        
        // Clear history button
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', async () => {
                await clearAllChatHistory();
            });
        }
        
        // Chat form submission
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', this.handleChatSubmit.bind(this));
        }
        
        // File attach button
        const attachBtn = document.getElementById('attachBtn');
        if (attachBtn) {
            attachBtn.addEventListener('click', handleFileAttach);
        }
        
        // Auto-collapse sidebar on mobile using media query check
        this.handleMobileLayout();
        
        // Setup composer events
        setupComposer();
    }
    
    async handleChatSubmit(e) {
        e.preventDefault();
        const userInput = document.getElementById('userInput');
        const text = userInput.value.trim();
        const attachmentContainer = document.querySelector('.attachment-container');
        
        // Check if we have text or attachments
        if (!text && !attachmentContainer) return;
        
        // Collect attachment data
        let attachments = [];
        if (attachmentContainer) {
            const attachmentItems = Array.from(attachmentContainer.querySelectorAll('.attachment-item'));
            
            attachmentItems.forEach(item => {
                const fileName = item.dataset.fileName;
                const fileType = item.dataset.fileType;
                const fileSize = item.dataset.fileSize;
                const fileContent = item.dataset.fileContent;
                
                // Check if it's an image and get the image data
                if (fileType.startsWith('image/')) {
                    attachments.push({
                        type: 'image',
                        name: fileName,
                        size: fileSize,
                        fileType: fileType,
                        data: fileContent // Base64 data for API
                    });
                } else if (fileContent) {
                    // For PDFs and other documents with content
                    attachments.push({
                        type: 'file',
                        name: fileName,
                        size: fileSize,
                        fileType: fileType,
                        data: fileContent // Base64 content for API
                    });
                } else {
                    // Fallback for files without content
                    attachments.push({
                        type: 'file',
                        name: fileName,
                        size: fileSize,
                        fileType: fileType
                    });
                }
            });
            
            // Attachment info collected for potential future use
        }
        
        // Create message text (without attachment info for display)
        const messageText = text;
        
        // Use pre-imported message service (no dynamic import needed)
        await addMessageWithAttachments('user', messageText, attachments);
        
        // Clear input and attachments
        userInput.value = '';
        if (attachmentContainer) {
            attachmentContainer.remove();
        }
        
        // Use pre-imported utilities (no dynamic imports needed)
        autosize(userInput);
        updateSendButtonState();
        
        // Get AI response from OpenRouter API
        getAIResponse(messageText, attachments);
    }
    
    // Safe chat switching with mutex to prevent race conditions
    async safeSwitchToChat(chatId) {
        // Check if another operation is in progress
        if (this.operationLock) {
            console.warn('Chat switching operation already in progress, skipping...');
            return;
        }
        
        try {
            this.operationLock = true;
            await switchToChat(chatId);
        } catch (error) {
            console.error('Error switching to chat:', error);
        } finally {
            this.operationLock = false;
        }
    }
    
    // Handle mobile layout using CSS media query instead of magic numbers
    handleMobileLayout() {
        // Use CSS media query to check for mobile using constant from config
        const mediaQuery = `(max-width: ${APP_CONSTANTS.MOBILE_BREAKPOINT})`;
        const isMobile = window.matchMedia(mediaQuery).matches;
        
        if (isMobile) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('expanded');
                setSidebarExpanded(false);
            }
        }
        
        // Listen for viewport changes
        window.matchMedia(mediaQuery).addEventListener('change', (e) => {
            if (e.matches) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('expanded');
                    setSidebarExpanded(false);
                }
            }
        });
    }
}

// Note: App initialization is now handled by main.js

// Export utility functions for global access
window.openImageModal = openImageModal;

// Export for potential debugging or external access
export { UncensoredAIApp };
