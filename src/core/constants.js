// Application constants and configuration
export const APP_CONSTANTS = {
    STORAGE_KEYS: {
        CHATS: 'uncensoredai_chats',
        SIDEBAR_EXPANDED: 'sidebarExpanded',
        DARK_MODE: 'darkMode',
        API_KEY: 'openrouter_api_key',
        GETIMG_API_KEY: 'getimg_api_key'
    },
    DEFAULT_CHAT_TITLE: 'New Chat',
    MAX_TITLE_LENGTH: 50,
    MAX_MESSAGE_PREVIEW_LENGTH: 40,
    API_ENDPOINT: 'https://openrouter.ai/api/v1/chat/completions',
    API_MODEL: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    MOBILE_BREAKPOINT: '768px'
};

export const SELECTORS = {
    // DOM Elements
    SIDEBAR: '#sidebar',
    SIDEBAR_TOGGLE: '#sidebarToggle',
    NEW_CHAT_BTN: '#newChatBtn',
    CHAT_LIST: '#chatList',
    CHAT_FORM: '#chatForm',
    USER_INPUT: '#userInput',
    CHAT_AREA: '#chatArea',
    ATTACH_BTN: '#attachBtn',
    SEND_BTN: '#sendBtn',
    DARK_MODE_TOGGLE: '#darkModeToggle'
};

export const CSS_CLASSES = {
    SIDEBAR_EXPANDED: 'expanded',
    ACTIVE_CHAT: 'active',
    USER_MESSAGE: 'user-message',
    AI_MESSAGE: 'ai-message',
    TYPING_INDICATOR: 'typing-indicator',
    STREAMING_MESSAGE: 'streaming-message'
};
