// DOM Helper Functions
export const scrollToBottom = (chatArea) => {
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
};

export const autosize = (textarea) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 152) + 'px';
};

export const toggleSendDisabled = (sendBtn, userInput) => {
    if (!sendBtn || !userInput) return;
    const hasText = userInput.value.trim().length > 0;
    sendBtn.disabled = !hasText;
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('text')) return '📄';
    return '📎';
};

export const showActionFeedback = (message) => {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;

    // Add animation keyframes if not already added
    if (!document.querySelector('#feedback-animations')) {
        const style = document.createElement('style');
        style.id = 'feedback-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(feedback);

    // Remove after 3 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (feedback.parentNode) {
                document.body.removeChild(feedback);
            }
        }, 300);
    }, 3000);
};
