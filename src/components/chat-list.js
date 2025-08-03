import { APP_CONSTANTS } from '../core/constants.js';
import { getState, setCurrentChatId } from '../core/state.js';
import { deleteChat } from '../services/chat-service.js';
import { notificationManager } from './notifications.js';

// Mutex for preventing race conditions in chat switching
let chatSwitchLock = false;

// Show delete confirmation with in-app notification
function showDeleteConfirmation(chatId, chatTitle) {
    const confirmationId = notificationManager.show(
        `Delete "${chatTitle}"? This action cannot be undone.`,
        'warning',
        0 // Don't auto-dismiss
    );
    
    // Add custom buttons to the notification
    const notification = notificationManager.notifications.get(confirmationId);
    if (notification) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'notification-buttons';
        buttonsContainer.innerHTML = `
            <button class="notification-btn notification-btn-cancel">Cancel</button>
            <button class="notification-btn notification-btn-delete">Delete</button>
        `;
        
        notification.querySelector('.notification-content').appendChild(buttonsContainer);
        
        // Add event listeners
        buttonsContainer.querySelector('.notification-btn-cancel').addEventListener('click', () => {
            notificationManager.remove(confirmationId);
        });
        
        buttonsContainer.querySelector('.notification-btn-delete').addEventListener('click', async () => {
            notificationManager.remove(confirmationId);
            await handleChatDeletion(chatId, chatTitle);
        });
    }
}

// Handle the actual chat deletion with success/error notifications
async function handleChatDeletion(chatId, chatTitle) {
    try {
        await deleteChat(chatId);
        notificationManager.success(`"${chatTitle}" has been deleted successfully.`);
    } catch (error) {
        console.error('Error deleting chat:', error);
        notificationManager.error(`Failed to delete "${chatTitle}". Please try again.`);
    }
}

// Chat List Component
export const renderChatList = () => {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    
    const { chats, currentChatId } = getState();
    const chatIds = Object.keys(chats).sort((a, b) => 
        new Date(chats[b].lastUpdated) - new Date(chats[a].lastUpdated)
    );
    
    if (chatIds.length === 0) {
        chatList.innerHTML = '<div class="no-chats-message"><em>No previous chats yet</em></div>';
        return;
    }
    
    // Clear existing content
    chatList.replaceChildren();
    
    // Create chat items using DOM methods
    chatIds.forEach(chatId => {
        const chat = chats[chatId];
        const isActive = chatId === currentChatId;
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? lastMessage.text.substring(0, APP_CONSTANTS.MAX_MESSAGE_PREVIEW_LENGTH) + '...' : 'New chat';
        
        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'chat-item-wrapper';
        
        // Create chat item button
        const chatButton = document.createElement('button');
        chatButton.className = `chat-item ${isActive ? 'active' : ''}`;
        chatButton.setAttribute('data-chat-id', chatId);
        chatButton.setAttribute('title', chat.title);
        
        // Create chat content div
        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';
        
        // Create title div
        const titleDiv = document.createElement('div');
        titleDiv.style.fontWeight = '500';
        titleDiv.style.marginBottom = '2px';
        titleDiv.textContent = chat.title;
        
        // Create preview div
        const previewDiv = document.createElement('div');
        previewDiv.style.fontSize = '12px';
        previewDiv.style.color = 'var(--text-secondary)';
        previewDiv.style.opacity = '0.8';
        previewDiv.textContent = preview;
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'chat-delete-btn';
        deleteButton.setAttribute('data-chat-id', chatId);
        deleteButton.setAttribute('title', 'Delete chat');
        
        // Create SVG for delete button
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        
        // Create SVG paths
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M3 6h18');
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6');
        const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path3.setAttribute('d', 'M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2');
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '10');
        line1.setAttribute('y1', '11');
        line1.setAttribute('x2', '10');
        line1.setAttribute('y2', '17');
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '14');
        line2.setAttribute('y1', '11');
        line2.setAttribute('x2', '14');
        line2.setAttribute('y2', '17');
        
        // Assemble SVG
        svg.appendChild(path1);
        svg.appendChild(path2);
        svg.appendChild(path3);
        svg.appendChild(line1);
        svg.appendChild(line2);
        deleteButton.appendChild(svg);
        
        // Assemble chat content
        chatContent.appendChild(titleDiv);
        chatContent.appendChild(previewDiv);
        chatButton.appendChild(chatContent);
        
        // Assemble wrapper
        wrapper.appendChild(chatButton);
        wrapper.appendChild(deleteButton);
        
        // Add to chat list
        chatList.appendChild(wrapper);
    });
    
    // Add event listeners to chat items
    setupChatItemEventListeners();
};

function setupChatItemEventListeners() {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    
    // Add event listeners to chat items
    chatList.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            const chatId = e.currentTarget.dataset.chatId;
            await switchToChat(chatId);
        });
    });
    
    // Add event listeners to delete buttons
    chatList.querySelectorAll('.chat-delete-btn').forEach(deleteBtn => {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent triggering chat selection
            const chatId = e.currentTarget.dataset.chatId;
            const { chats } = getState();
            const chatTitle = chats[chatId]?.title || 'Untitled Chat';
            
            // Show confirmation notification with custom buttons
            showDeleteConfirmation(chatId, chatTitle);
        });
    });
}

export const switchToChat = async (chatId) => {
    // Prevent race conditions with mutex lock
    if (chatSwitchLock) {
        console.warn('Chat switching operation already in progress, skipping...');
        return;
    }
    
    const { chats, currentChatId } = getState();
    if (!chats[chatId]) return;
    
    try {
        chatSwitchLock = true;
        
        // Save current chat state if switching from another chat
        // This would need to be implemented properly
        if (currentChatId && currentChatId !== chatId) {
            // Save current chat messages
            // saveCurrentChatMessages();
        }
        
        setCurrentChatId(chatId);
        await loadChatMessages(chatId);
        renderChatList(); // Update active state
        scrollToBottom();
    } catch (error) {
        console.error('Error switching to chat:', error);
    } finally {
        chatSwitchLock = false;
    }
};

async function loadChatMessages(chatId) {
    const { chats } = getState();
    const chatArea = document.getElementById('chatArea');
    if (!chatArea || !chats[chatId]) return;
    
    // Clear chat area
    chatArea.innerHTML = '';
    
    const messages = chats[chatId].messages;
    
    if (messages.length === 0) {
        await addWelcomeMessage();
    } else {
        for (const message of messages) {
            await renderMessage(message);
        }
    }
}

async function addWelcomeMessage() {
    const welcomeMessage = {
        sender: 'ai',
        text: 'Welcome To Uncensored AI',
        timestamp: new Date().toISOString(),
        hasUpgrade: true
    };
    
    await renderMessage(welcomeMessage);
}

async function renderMessage(message) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    
    const wrap = document.createElement('div');
    wrap.className = 'message-wrapper ' + (message.sender === 'user' ? 'user-message' : 'ai-message');
    
    // Create action buttons HTML
    const actionButtons = `
        <div class="message-actions">
            <button class="action-btn" data-action="copy" title="Copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
            </button>
            <button class="action-btn" data-action="like" title="Like">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 10v12l4-4 4 4V10"/>
                    <path d="M5 6h14l-1 4H6z"/>
                </svg>
            </button>
            <button class="action-btn" data-action="dislike" title="Dislike">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 14V2l-4 4-4-4v12"/>
                    <path d="M19 18H5l1-4h12z"/>
                </svg>
            </button>
            <button class="action-btn" data-action="share" title="Share">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16,6 12,2 8,6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
            </button>
            <button class="action-btn" data-action="more" title="More">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="19" cy="12" r="1"/>
                    <circle cx="5" cy="12" r="1"/>
                </svg>
            </button>
        </div>
    `;
    
    // Create attachments HTML
    let attachmentsHTML = '';
    if (message.attachments && message.attachments.length > 0) {
        attachmentsHTML = '<div class="message-attachments">';
        
        for (const attachment of message.attachments) {
            if (attachment.type === 'image') {
                attachmentsHTML += `
                    <div class="message-attachment image-attachment">
                        <img src="${attachment.data}" alt="${attachment.name}" class="message-image" onclick="openImageModal(this)">
                        <div class="image-caption">${attachment.name}</div>
                    </div>
                `;
            } else {
                const fileIcon = await getFileIcon(attachment.fileType);
                const formattedSize = await formatFileSize(attachment.size);
                attachmentsHTML += `
                    <div class="message-attachment file-attachment">
                        <div class="file-icon">${fileIcon}</div>
                        <div class="file-info">
                            <span class="file-name">${attachment.name}</span>
                            <span class="file-size">${formattedSize}</span>
                        </div>
                    </div>
                `;
            }
        }
        
        attachmentsHTML += '</div>';
    }
    
    if (message.sender === 'user') {
        // Apply markdown formatting to user messages as well
        const formattedUserText = message.text ? await formatMarkdown(message.text) : '';
        wrap.innerHTML = `
            <div class="message-bubble">
                ${formattedUserText}
                ${attachmentsHTML}
            </div>
            ${actionButtons}`;
    } else {
        // Apply markdown formatting to AI messages
        const formattedText = await formatMarkdown(message.text);
        wrap.innerHTML = `
            <div class="ai-icon message-icon"></div>
            <div class="message-bubble">
                ${formattedText}
                ${message.hasUpgrade ? '<button class="upgrade-btn">Upgrade to Pro</button>' : ''}
                ${attachmentsHTML}
            </div>
            ${actionButtons}`;
    }
    
    // Add event listeners for action buttons
    const module = await import('../features/message-actions.js');
    const setupMessageActionListeners = module.setupMessageActionListeners;
    setupMessageActionListeners(wrap);
    
    chatArea.appendChild(wrap);
}

function scrollToBottom() {
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

// Helper function imports (to be resolved at runtime)
async function formatMarkdown(text) {
    const { formatMarkdown } = await import('../utils/formatters.js');
    return formatMarkdown(text);
}

async function formatFileSize(bytes) {
    const { formatFileSize } = await import('../utils/dom-helpers.js');
    return formatFileSize(bytes);
}

async function getFileIcon(fileType) {
    const { getFileIcon } = await import('../utils/dom-helpers.js');
    return getFileIcon(fileType);
}
