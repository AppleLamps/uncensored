import { formatMarkdown } from '../utils/formatters.js';
import { setupMessageActionListeners } from '../features/message-actions.js';

// Message Renderer Component
export const renderMessage = (message) => {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    
    const wrap = document.createElement('div');
    wrap.className = 'message-wrapper ' + (message.sender === 'user' ? 'user-message' : 'ai-message');
    
    // Check if message has image attachments
    const hasImages = message.attachments && message.attachments.some(att => att.type === 'image');
    
    // Create action buttons HTML with conditional download button
    const downloadButton = hasImages ? `
            <button class="action-btn" data-action="download" title="Download Image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            </button>` : '';
    
    const actionButtons = `
        <div class="message-actions">
            <button class="action-btn" data-action="copy" title="Copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
            </button>${downloadButton}
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
        
        message.attachments.forEach(attachment => {
            if (attachment.type === 'image') {
                attachmentsHTML += `
                    <div class="message-attachment image-attachment">
                        <img src="${attachment.data}" alt="${attachment.name}" class="message-image" onclick="openImageModal(this)">
                        <div class="image-caption">${attachment.name}</div>
                    </div>
                `;
            } else {
                const fileIcon = getFileIcon(attachment.fileType);
                attachmentsHTML += `
                    <div class="message-attachment file-attachment">
                        <div class="file-icon">${fileIcon}</div>
                        <div class="file-info">
                            <span class="file-name">${attachment.name}</span>
                            <span class="file-size">${formatFileSize(attachment.size)}</span>
                        </div>
                    </div>
                `;
            }
        });
        
        attachmentsHTML += '</div>';
    }
    
    if (message.sender === 'user') {
        wrap.innerHTML = `
            <div class="message-bubble">
                ${message.text ? `<p>${message.text}</p>` : ''}
                ${attachmentsHTML}
            </div>
            ${actionButtons}`;
    } else {
        // Apply markdown formatting to AI messages
        const formattedText = formatMarkdown(message.text);
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
    setupMessageActionListeners(wrap);
    
    chatArea.appendChild(wrap);
    
    // Auto-scroll to bottom after adding message
    setTimeout(() => {
        scrollToBottom(chatArea);
    }, 100);
};

// Typing indicator functions removed - no longer needed for faster responses

function scrollToBottom(chatArea) {
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('text')) return '📄';
    return '📎';
}
