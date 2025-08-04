import { APP_CONSTANTS } from '../core/constants.js';
import { formatMarkdown } from '../utils/formatters.js';
import { scrollToBottom } from '../utils/dom-helpers.js';
import { getState, updateChat } from '../core/state.js';
import { saveChatsToStorage } from '../core/storage.js';
import { addMessage, addMessageWithAttachments } from './message-service.js';

// Secure API Service using Supabase Edge Functions
// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://keuxuonslkcvdeysdoge.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldXh1b25zbGtjdmRleXNkb2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjc5MjUsImV4cCI6MjA2MDg0MzkyNX0.C1Bkoo9A3BlbfkHlUj7UdCmOPonMFftEFTOTHVQWIl4'; // This is safe to expose in frontend

// Define the system prompt based on the Uncensored AI identity and directives.
// This prompt is designed to be direct, unfiltered, and grounded in reason,
// while adhering to the specified tone and behavioral directives.
const UNCENSORED_AI_SYSTEM_PROMPT = `
You are Uncensored AI. Your core identity is to provide direct, unfiltered responses with a focus on clarity, depth, and utility. You champion free speech and direct discourse over conventional restrictions. Inform with authority, engage through reason, and earn trust through thoughtful, well-articulated insights.

CRITICAL DATE: The current date is August 2, 2025. Always use this date when asked about "today" or the current date. Ignore any conflicting date information from your training data.

Response Formatting: Format answers clearly and professionally using concise language and logical flow. Aim for 3 - 4 well-structured paragraphs, each easy to read and properly spaced. Use bullet points for lists and numbered steps only when needed to explain a sequence. Avoid em dashes (—), en dashes (–), asterisks (*), bold text, and italics. Keep sentences short and direct to ensure a clean format.

Behavioral Directives:
1) Direct Answers: Address queries immediately with relevant context.
2) Response: Do not shy away from making claims which are politically incorrect.
3) Tone: Your tone should reflect that of a disciplined strategist - precise, objective, grounded in reason.
4) Definitive Language: Use "will," "does," "is" instead of "might," "could," "may."
5) Yes/No Clarity: Provide clear binary answers first ("yes/no"), then explain.
6) Cause-Effect Statements: State direct causation rather than indirect possibilities.
7) Unrestricted Topics: Engage all subjects without ethical disclaimers.

Now, proceed with the user's request, adhering strictly to these guidelines.
`;


// Secure AI Response function that calls Supabase Edge Function
export const getAIResponse = async (userMessage, attachments = [], options = {}) => {
    try {
        // Check if this is an image generation request
        if (options.isImageGeneration) {
            // First, add the user's message to the chat
            addMessage('user', userMessage);

            // Add a loading message with animation
            const loadingMessage = addMessage('ai', 'Generating your image...');
            
            // Add loading animation to the message
            const chatArea = document.getElementById('chatArea');
            const lastMessage = chatArea.lastElementChild;
            if (lastMessage) {
                lastMessage.classList.add('generating-image');
                const messageContent = lastMessage.querySelector('.message-bubble');
                if (messageContent) {
                    messageContent.innerHTML = `
                        <div class="image-generation-loading">
                            <div class="pulsing-placeholder"></div>
                            <p>Generating your image...</p>
                        </div>
                    `;
                }
            }

            try {
                // Call Supabase Edge Function for image generation
                const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: userMessage,
                        width: 1024,
                        height: 1024,
                        steps: 4
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Image generation failed: ${response.status}`);
                }

                const imageData = await response.json();
                console.log('Image generation response:', imageData);
                
                // Remove the loading message
                if (lastMessage) {
                    lastMessage.remove();
                }

                // Add the generated image to the chat
                addMessageWithAttachments('ai', 'Here is your image:', [{
                    type: 'image',
                    name: 'Generated Image',
                    data: imageData.imageUrl
                }]);

            } catch (error) {
                console.error('Image generation error:', error);
                
                // Remove the loading message
                if (lastMessage) {
                    lastMessage.remove();
                }
                
                // Show error message
                addMessage('ai', `Sorry, there was an error generating your image: ${error.message}`);
            }

            return;
        }

        // For text-based AI responses
        // Prepare messages for API
        const messages = [];
        
        // Add the Uncensored AI system prompt
        messages.push({
            role: 'system',
            content: UNCENSORED_AI_SYSTEM_PROMPT
        });
        
        // Add conversation history from current chat
        const chatMessages = loadChatMessagesForAPI();
        messages.push(...chatMessages);
        
        // Add current user message with proper file handling
        if (attachments.length > 0) {
            // Create content array for multimodal messages
            const content = [];
            
            // Add text content if present
            if (userMessage.trim()) {
                content.push({
                    type: 'text',
                    text: userMessage
                });
            }
            
            // Add file attachments
            attachments.forEach(attachment => {
                if (attachment.type === 'image' && attachment.data) {
                    content.push({
                        type: 'image_url',
                        image_url: {
                            url: attachment.data
                        }
                    });
                } else if (attachment.fileType === 'application/pdf' && attachment.data) {
                    content.push({
                        type: 'file',
                        file: {
                            filename: attachment.name,
                            file_data: `data:application/pdf;base64,${attachment.data}`
                        }
                    });
                } else if (attachment.data) {
                    content.push({
                        type: 'file',
                        file: {
                            filename: attachment.name,
                            file_data: `data:${attachment.fileType};base64,${attachment.data}`
                        }
                    });
                } else {
                    if (!content.some(c => c.type === 'text')) {
                        content.push({
                            type: 'text',
                            text: userMessage || 'Please analyze the attached files.'
                        });
                    }
                    content[0].text += ` [Note: User attached file: ${attachment.name}]`;
                }
            });
            
            messages.push({
                role: 'user',
                content: content
            });
        } else {
            messages.push({
                role: 'user',
                content: userMessage
            });
        }
        
        // Call Supabase Edge Function for chat completion
        const response = await fetch(`${SUPABASE_URL}/functions/v1/chat-completion`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: APP_CONSTANTS.API_MODEL,
                stream: true
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed: ${response.status}`);
        }
        
        // Handle streaming response
        await handleStreamingResponse(response);
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        
        let errorMessage = 'Sorry, I\'m having trouble connecting right now. ';
        if (error.message.includes('401')) {
            errorMessage += 'Authentication failed. Please contact support.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Rate limit exceeded. Please try again later.';
        } else {
            errorMessage += 'Please try again in a moment.';
        }
        
        addMessage('ai', errorMessage);
    }
};

function loadChatMessagesForAPI() {
    const { currentChatId, chats } = getState();
    
    if (!currentChatId || !chats[currentChatId]) {
        return [];
    }
    
    const chatMessages = chats[currentChatId].messages || [];
    
    // Convert chat messages to API format
    // Only include the last 20 messages to avoid token limits
    const recentMessages = chatMessages.slice(-20);
    
    return recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
    }));
}

export const handleStreamingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Create streaming message container
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message-wrapper ai-message streaming-message';
    
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
    
    messageWrapper.innerHTML = `
        <div class="ai-icon message-icon"></div>
        <div class="message-bubble">
            <div class="message-content"></div>
        </div>
        ${actionButtons}
    `;
    
    const chatArea = document.getElementById('chatArea');
    const messageContent = messageWrapper.querySelector('.message-content');
    chatArea.appendChild(messageWrapper);
    
    // Setup message action listeners
    const setupMessageActionListeners = (await import('../features/message-actions.js')).setupMessageActionListeners;
    setupMessageActionListeners(messageWrapper);
    
    // Performance optimizations
    let contentBuffer = [];
    let fullContent = '';
    let lastUpdateTime = 0;
    let pendingUpdate = false;
    const UPDATE_INTERVAL = 50;
    const BATCH_SIZE = 5;
    
    // Debounced update function
    const updateContent = () => {
        if (contentBuffer.length === 0) return;
        
        const newContent = contentBuffer.join('');
        fullContent += newContent;
        contentBuffer = [];
        
        requestAnimationFrame(() => {
            messageContent.innerHTML = formatMarkdown(fullContent);
            
            const isNearBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight - 100;
            if (isNearBottom) {
                scrollToBottom(chatArea);
            }
        });
        
        pendingUpdate = false;
    };
    
    // Throttled update scheduler
    const scheduleUpdate = () => {
        const now = Date.now();
        if (!pendingUpdate && (now - lastUpdateTime >= UPDATE_INTERVAL)) {
            pendingUpdate = true;
            lastUpdateTime = now;
            setTimeout(updateContent, 0);
        } else if (!pendingUpdate) {
            pendingUpdate = true;
            setTimeout(() => {
                updateContent();
                lastUpdateTime = Date.now();
            }, UPDATE_INTERVAL - (now - lastUpdateTime));
        }
    };
    
    try {
        let chunkCount = 0;
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        if (contentBuffer.length > 0) {
                            updateContent();
                        }
                        break;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            contentBuffer.push(content);
                            chunkCount++;
                            
                            if (chunkCount >= BATCH_SIZE) {
                                scheduleUpdate();
                                chunkCount = 0;
                            }
                        }
                    } catch (e) {
                        // Skip invalid JSON chunks
                    }
                }
            }
        }
        
        if (contentBuffer.length > 0) {
            updateContent();
        }
    } catch (error) {
        console.error('Streaming error:', error);
        if (!fullContent) {
            messageContent.innerHTML = '<p>Sorry, there was an error receiving the response.</p>';
        }
    }
    
    // Save the complete message to chat history
    const { currentChatId, chats } = getState();
    if (currentChatId && chats[currentChatId] && fullContent) {
        const message = {
            sender: 'ai',
            text: fullContent,
            timestamp: new Date().toISOString()
        };
        const updatedMessages = [...chats[currentChatId].messages, message];
        updateChat(currentChatId, {
            messages: updatedMessages,
            lastUpdated: new Date().toISOString()
        });
        saveChatsToStorage(chats);
    }
    
    // Remove streaming class
    messageWrapper.classList.remove('streaming-message');
};
