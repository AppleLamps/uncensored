import { handleFileSelection, addAttachmentToComposer, updateSendButtonState } from '../utils/file-utils.js';
import { autosize } from '../utils/dom-helpers.js';
import { getAIResponse } from '../services/api.js'; // Import getAIResponse

// Composer Component
export const setupComposer = () => {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const generateImageBtn = document.getElementById('generateImageBtn'); // Get the new button
    
    if (userInput) {
        userInput.addEventListener('input', () => {
            autosize(userInput);
            updateSendButtonState();
        });
        
        // Enter to send, Shift+Enter for newline
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const chatForm = document.getElementById('chatForm');
                if (chatForm) {
                    chatForm.requestSubmit();
                }
            }
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            updateSendButtonState();
        });
    }
    
    // Add event listener for the new image generation button
    if (generateImageBtn) {
        generateImageBtn.addEventListener('click', () => {
            const userInput = document.getElementById('userInput');
            const prompt = userInput.value.trim();
            if (prompt) {
                getAIResponse(prompt, [], { isImageGeneration: true });
                userInput.value = ''; // Clear the input after sending
            }
        });
    }
};

export const handleFileAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
    input.multiple = true;
    input.onchange = async () => {
        const files = Array.from(input.files || []);
        if (files.length > 0) {
            await handleFileSelection(files, addAttachmentToComposer);
        }
    };
    input.click();
};

export const initializeComposer = () => {
    autosize(document.getElementById('userInput'));
    updateSendButtonState();
};
