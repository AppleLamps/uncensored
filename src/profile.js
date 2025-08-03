import { initializeDarkMode, toggleDarkMode } from './features/dark-mode.js';
import { getApiKey, setApiKey, clearApiKey, getGetimgApiKey, setGetimgApiKey, clearGetimgApiKey } from './core/storage.js';

// Profile Page Module
class ProfilePage {
    constructor() {
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.initializePage();
    }
    
    initializePage() {
        // Load saved API keys and initialize dark mode on page load
        this.loadApiKey();
        this.loadGetimgApiKey();
        initializeDarkMode(this.darkMode);
        this.setupDarkModeToggle();
        this.setupEventListeners();
    }
    
    setupDarkModeToggle() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.darkMode = toggleDarkMode();
            });
        }
    }
    
    setupEventListeners() {
        // Handle API key form submission
        const apiKeyForm = document.getElementById('apiKeyForm');
        if (apiKeyForm) {
            apiKeyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveApiKey();
            });
        }
        
        // Handle clear API key button
        const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
        if (clearApiKeyBtn) {
            clearApiKeyBtn.addEventListener('click', () => {
                this.clearApiKey();
            });
        }

        // Handle GETIMG API key form submission
        const getimgApiKeyForm = document.getElementById('getimgApiKeyForm');
        if (getimgApiKeyForm) {
            getimgApiKeyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGetimgApiKey();
            });
        }
        
        // Handle clear GETIMG API key button
        const clearGetimgApiKeyBtn = document.getElementById('clearGetimgApiKeyBtn');
        if (clearGetimgApiKeyBtn) {
            clearGetimgApiKeyBtn.addEventListener('click', () => {
                this.clearGetimgApiKey();
            });
        }
    }
    
    loadApiKey() {
        const savedApiKey = getApiKey();
        if (savedApiKey) {
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.value = savedApiKey;
                this.showStatus('API key loaded successfully', 'success');
            }
        }
    }
    
    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (!apiKeyInput) return;
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus('Please enter an API key', 'error');
            return;
        }
        
        // Basic validation for OpenRouter API key format
        if (!apiKey.startsWith('sk-or-')) {
            this.showStatus('Invalid API key format. OpenRouter keys start with "sk-or-"', 'error');
            return;
        }
        
        try {
            setApiKey(apiKey);
            this.showStatus('API key saved successfully!', 'success');
        } catch (error) {
            this.showStatus('Failed to save API key. Please try again.', 'error');
        }
    }
    
    clearApiKey() {
        if (confirm('Are you sure you want to clear your API key?')) {
            clearApiKey();
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.value = '';
            }
            this.showStatus('API key cleared successfully', 'success');
        }
    }

    loadGetimgApiKey() {
        const savedGetimgApiKey = getGetimgApiKey();
        if (savedGetimgApiKey) {
            const getimgApiKeyInput = document.getElementById('getimgApiKeyInput');
            if (getimgApiKeyInput) {
                getimgApiKeyInput.value = savedGetimgApiKey;
                this.showGetimgStatus('GETIMG API key loaded successfully', 'success');
            }
        }
    }

    saveGetimgApiKey() {
        const getimgApiKeyInput = document.getElementById('getimgApiKeyInput');
        if (!getimgApiKeyInput) return;
        
        const getimgApiKey = getimgApiKeyInput.value.trim();
        
        if (!getimgApiKey) {
            this.showGetimgStatus('Please enter a GETIMG API key', 'error');
            return;
        }
        
        try {
            setGetimgApiKey(getimgApiKey);
            this.showGetimgStatus('GETIMG API key saved successfully!', 'success');
        } catch (error) {
            this.showGetimgStatus('Failed to save GETIMG API key. Please try again.', 'error');
        }
    }

    clearGetimgApiKey() {
        if (confirm('Are you sure you want to clear your GETIMG API key?')) {
            clearGetimgApiKey();
            const getimgApiKeyInput = document.getElementById('getimgApiKeyInput');
            if (getimgApiKeyInput) {
                getimgApiKeyInput.value = '';
            }
            this.showGetimgStatus('GETIMG API key cleared successfully', 'success');
        }
    }
    
    showStatus(message, type) {
        const statusDiv = document.getElementById('apiKeyStatus');
        const statusText = document.getElementById('statusText');
        
        if (!statusDiv || !statusText) return;
        
        statusText.textContent = message;
        statusDiv.style.display = 'block';
        
        if (type === 'success') {
            statusDiv.style.backgroundColor = '#d1fae5';
            statusDiv.style.color = '#065f46';
            statusDiv.style.border = '1px solid #a7f3d0';
        } else {
            statusDiv.style.backgroundColor = '#fee2e2';
            statusDiv.style.color = '#991b1b';
            statusDiv.style.border = '1px solid #fca5a5';
        }
        
        // Hide status after 3 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    showGetimgStatus(message, type) {
        // Create a temporary status message for GETIMG API key
        // Since there might not be a dedicated status div, we'll create a simple alert-style notification
        const getimgForm = document.getElementById('getimgApiKeyForm');
        if (!getimgForm) return;

        // Remove any existing status message
        const existingStatus = getimgForm.querySelector('.getimg-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create new status message
        const statusDiv = document.createElement('div');
        statusDiv.className = 'getimg-status';
        statusDiv.textContent = message;
        statusDiv.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
            ${type === 'success' 
                ? 'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' 
                : 'background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'
            }
        `;

        getimgForm.appendChild(statusDiv);

        // Hide status after 3 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }
}

// Initialize the profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profilePage = new ProfilePage();
});

// Export for potential debugging or external access
export { ProfilePage };
