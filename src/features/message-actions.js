import { showActionFeedback } from '../utils/dom-helpers.js';

// Message Action Handlers
export const setupMessageActionListeners = (messageWrapper) => {
    const actionButtons = messageWrapper.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = button.dataset.action;
            const messageText = messageWrapper.querySelector('.message-bubble p')?.textContent || '';
            
            handleMessageAction(action, messageText, messageWrapper);
        });
    });
};

export const handleMessageAction = (action, messageText, messageWrapper) => {
    switch (action) {
        case 'copy':
            handleCopyAction(messageText);
            break;
        case 'download':
            handleDownloadAction(messageWrapper);
            break;
        case 'like':
            handleLikeAction(messageWrapper);
            break;
        case 'dislike':
            handleDislikeAction(messageWrapper);
            break;
        case 'share':
            handleShareAction(messageText);
            break;
        case 'more':
            handleMoreAction(messageWrapper);
            break;
        default:
            console.warn('Unknown action:', action);
    }
};

function handleCopyAction(messageText) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(messageText).then(() => {
            showActionFeedback('✅ Message copied to clipboard');
        }).catch(() => {
            fallbackCopyToClipboard(messageText);
        });
    } else {
        fallbackCopyToClipboard(messageText);
    }
}

function handleDownloadAction(messageWrapper) {
    // Find the first image in the message
    const imageElement = messageWrapper.querySelector('.message-image');
    if (!imageElement) {
        showActionFeedback('❌ No image found to download');
        return;
    }

    try {
        // Get the image data URL
        const imageDataUrl = imageElement.src;
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = `generated-image-${new Date().getTime()}.png`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showActionFeedback('✅ Image downloaded successfully');
    } catch (error) {
        console.error('Download error:', error);
        showActionFeedback('❌ Failed to download image');
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showActionFeedback('✅ Message copied to clipboard');
    } catch (err) {
        showActionFeedback('❌ Failed to copy message');
    }
    
    document.body.removeChild(textArea);
}

function handleShareAction(messageText) {
    if (navigator.share) {
        navigator.share({
            title: 'Uncensored AI Chat Message',
            text: messageText,
            url: window.location.href
        }).then(() => {
            showActionFeedback('✅ Message shared successfully');
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                fallbackShareAction(messageText);
            }
        });
    } else {
        fallbackShareAction(messageText);
    }
}

function fallbackShareAction(messageText) {
    const shareData = `Check out this message from Uncensored AI:\n\n"${messageText}"\n\n${window.location.href}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareData).then(() => {
            showActionFeedback('✅ Share link copied to clipboard');
        }).catch(() => {
            showActionFeedback('❌ Sharing not supported in this browser');
        });
    } else {
        showActionFeedback('❌ Sharing not supported in this browser');
    }
}

function handleLikeAction(messageWrapper) {
    const likeBtn = messageWrapper.querySelector('[data-action="like"]');
    const isLiked = likeBtn.classList.contains('liked');
    
    if (isLiked) {
        likeBtn.classList.remove('liked');
        likeBtn.style.color = '#6B7280';
        showActionFeedback('👍 Like removed');
    } else {
        likeBtn.classList.add('liked');
        likeBtn.style.color = '#10B981';
        
        // Remove dislike if it was active
        const dislikeBtn = messageWrapper.querySelector('[data-action="dislike"]');
        dislikeBtn.classList.remove('disliked');
        dislikeBtn.style.color = '#6B7280';
        
        showActionFeedback('👍 Message liked');
    }
}

function handleDislikeAction(messageWrapper) {
    const dislikeBtn = messageWrapper.querySelector('[data-action="dislike"]');
    const isDisliked = dislikeBtn.classList.contains('disliked');
    
    if (isDisliked) {
        dislikeBtn.classList.remove('disliked');
        dislikeBtn.style.color = '#6B7280';
        showActionFeedback('👎 Dislike removed');
    } else {
        dislikeBtn.classList.add('disliked');
        dislikeBtn.style.color = '#EF4444';
        
        // Remove like if it was active
        const likeBtn = messageWrapper.querySelector('[data-action="like"]');
        likeBtn.classList.remove('liked');
        likeBtn.style.color = '#6B7280';
        
        showActionFeedback('👎 Message disliked');
    }
}

function handleMoreAction(messageWrapper) {
    // Create a simple context menu
    const contextMenu = document.createElement('div');
    contextMenu.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 8px 0;
        z-index: 1000;
        min-width: 150px;
        font-size: 14px;
    `;
    
    const menuItems = [
        { label: 'Edit message', action: 'edit' },
        { label: 'Delete message', action: 'delete' },
        { label: 'Report message', action: 'report' }
    ];
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.textContent = item.label;
        menuItem.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            transition: background 0.2s ease;
        `;
        
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = '#F3F4F6';
        });
        
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = 'transparent';
        });
        
        menuItem.addEventListener('click', () => {
            showActionFeedback(`${item.label} - Feature coming soon!`);
            if (contextMenu.parentNode) {
                document.body.removeChild(contextMenu);
            }
        });
        
        contextMenu.appendChild(menuItem);
    });
    
    // Position the menu near the more button
    const moreBtn = messageWrapper.querySelector('[data-action="more"]');
    const rect = moreBtn.getBoundingClientRect();
    contextMenu.style.left = rect.left + 'px';
    contextMenu.style.top = (rect.bottom + 5) + 'px';
    
    document.body.appendChild(contextMenu);
    
    // Close menu when clicking outside
    const closeMenu = (e) => {
        if (!contextMenu.contains(e.target)) {
            if (contextMenu.parentNode) {
                document.body.removeChild(contextMenu);
            }
            document.removeEventListener('click', closeMenu);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
}
