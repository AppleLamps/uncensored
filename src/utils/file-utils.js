import { formatFileSize, getFileIcon } from './dom-helpers.js';

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FILE_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
};

// File Handling Utilities
export const handleFileSelection = async (files, addAttachmentToComposer) => {
    const validFiles = [];
    const invalidFiles = [];
    
    // Validate each file
    files.forEach(file => {
        const validation = validateFile(file);
        if (validation.isValid) {
            validFiles.push(file);
        } else {
            invalidFiles.push({ file, error: validation.error });
        }
    });
    
    // Show errors for invalid files
    if (invalidFiles.length > 0) {
        const errorMessages = invalidFiles.map(({ file, error }) => `${file.name}: ${error}`);
        alert(`The following files could not be attached:\n\n${errorMessages.join('\n')}`);
    }
    
    // Process valid files
    const imageFiles = validFiles.filter(file => file.type.startsWith('image/'));
    const otherFiles = validFiles.filter(file => !file.type.startsWith('image/'));
    
    // Handle non-image files with content reading
    for (const file of otherFiles) {
        await addAttachmentToComposer(file, false);
    }
    
    // Handle image files with preview
    for (const file of imageFiles) {
        await addAttachmentToComposer(file, true);
    }
};

// File validation function
const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `File size exceeds 10MB limit (${formatFileSize(file.size)})`
        };
    }
    
    // Check file type
    const allAllowedTypes = [
        ...ALLOWED_FILE_TYPES.images,
        ...ALLOWED_FILE_TYPES.videos,
        ...ALLOWED_FILE_TYPES.audio,
        ...ALLOWED_FILE_TYPES.documents
    ];
    
    if (!allAllowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type not supported (${file.type || 'unknown type'})`
        };
    }
    
    return { isValid: true };
};

export const addAttachmentToComposer = async (file, isImage) => {
    // Create attachment container if it doesn't exist
    let attachmentContainer = document.querySelector('.attachment-container');
    if (!attachmentContainer) {
        attachmentContainer = document.createElement('div');
        attachmentContainer.className = 'attachment-container';
        
        // Insert before composer-bottom
        const composerBottom = document.querySelector('.composer-bottom');
        composerBottom.parentNode.insertBefore(attachmentContainer, composerBottom);
    }
    
    // Create attachment item
    const attachmentItem = document.createElement('div');
    attachmentItem.className = 'attachment-item';
    attachmentItem.dataset.fileName = file.name;
    attachmentItem.dataset.fileSize = file.size;
    attachmentItem.dataset.fileType = file.type;
    
    // Read file content for API transmission
    let fileContent = null;
    if (file.type === 'application/pdf' || file.type.startsWith('text/') || file.type.includes('document')) {
        // For PDFs and text files, read as base64
        fileContent = await readFileAsBase64(file);
        attachmentItem.dataset.fileContent = fileContent;
    } else if (isImage) {
        // For images, read as data URL
        fileContent = await readFileAsDataURL(file);
        attachmentItem.dataset.fileContent = fileContent;
    }
    
    // Function to add remove functionality
    const addRemoveFunctionality = () => {
        const removeBtn = attachmentItem.querySelector('.remove-attachment');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                attachmentItem.remove();
                
                // Remove container if no attachments left
                if (attachmentContainer.children.length === 0) {
                    attachmentContainer.remove();
                }
                
                updateSendButtonState();
            });
        }
    };
    
    if (isImage) {
        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            attachmentItem.innerHTML = `
                <div class="attachment-preview">
                    <img src="${e.target.result}" alt="${file.name}" class="preview-image">
                    <div class="attachment-overlay">
                        <div class="attachment-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-size">${formatFileSize(file.size)}</span>
                        </div>
                        <button class="remove-attachment" title="Remove attachment">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            // Add remove functionality after HTML is set
            addRemoveFunctionality();
        };
        reader.readAsDataURL(file);
    } else {
        // Create file attachment (non-image)
        const fileIcon = getFileIcon(file.type);
        attachmentItem.innerHTML = `
            <div class="attachment-preview file-attachment">
                <div class="file-icon">${fileIcon}</div>
                <div class="attachment-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
                <button class="remove-attachment" title="Remove attachment">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        // Add remove functionality after HTML is set
        addRemoveFunctionality();
    }
    
    attachmentContainer.appendChild(attachmentItem);
    updateSendButtonState();
};

export const updateSendButtonState = () => {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const hasText = userInput.value.trim().length > 0;
    const hasAttachments = document.querySelector('.attachment-container') !== null;
    sendBtn.disabled = !hasText && !hasAttachments;
};

// Helper function to read file as base64
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix to get just base64
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Helper function to read file as data URL
const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
