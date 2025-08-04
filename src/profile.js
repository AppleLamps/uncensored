import { initializeDarkMode, toggleDarkMode } from './features/dark-mode.js';

// Profile Page Module
class ProfilePage {
    constructor() {
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.initializePage();
    }
    
    initializePage() {
        // Initialize dark mode and setup security notice
        initializeDarkMode(this.darkMode);
        this.setupDarkModeToggle();
        this.setupSecurityNotice();
    }
    
    setupDarkModeToggle() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.darkMode = toggleDarkMode();
            });
        }
    }
    
    setupSecurityNotice() {
        // Display security notice about API key handling
        const apiKeyForm = document.getElementById('apiKeyForm');
        const getimgApiKeyForm = document.getElementById('getimgApiKeyForm');
        
        if (apiKeyForm) {
            this.replaceFormWithNotice(apiKeyForm, 'OpenRouter API');
        }
        
        if (getimgApiKeyForm) {
            this.replaceFormWithNotice(getimgApiKeyForm, 'GETIMG API');
        }
    }
    
    replaceFormWithNotice(formElement, apiType) {
        const noticeHTML = `
            <div class="security-notice">
                <div class="notice-icon">🔒</div>
                <h3>Enhanced Security</h3>
                <p><strong>${apiType} keys are now handled securely on the backend.</strong></p>
                <p>For your security, API keys are no longer stored in your browser's localStorage. 
                All API interactions are now processed through secure Supabase Edge Functions.</p>
                <div class="security-benefits">
                    <h4>Security Benefits:</h4>
                    <ul>
                        <li>✅ API keys never exposed in browser</li>
                        <li>✅ Secure server-side processing</li>
                        <li>✅ Protection against XSS attacks</li>
                        <li>✅ Centralized key management</li>
                    </ul>
                </div>
            </div>
        `;
        
        formElement.innerHTML = noticeHTML;
        
        // Add CSS styles for the notice
        const style = document.createElement('style');
        style.textContent = `
            .security-notice {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                margin: 1rem 0;
            }
            .notice-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .security-notice h3 {
                margin: 0 0 1rem 0;
                font-size: 1.5rem;
            }
            .security-notice p {
                margin: 0.5rem 0;
                opacity: 0.9;
            }
            .security-benefits {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                text-align: left;
            }
            .security-benefits h4 {
                margin: 0 0 0.5rem 0;
                text-align: center;
            }
            .security-benefits ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .security-benefits li {
                padding: 0.25rem 0;
                font-size: 0.9rem;
            }
        `;
        
        if (!document.querySelector('#security-notice-styles')) {
            style.id = 'security-notice-styles';
            document.head.appendChild(style);
        }
    }
    

}

// Initialize the profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profilePage = new ProfilePage();
});

// Export for potential debugging or external access
export { ProfilePage };
