import { setDarkMode } from '../core/state.js';

// Dark Mode Functionality
export const initializeDarkMode = (darkMode) => {
    console.log('initializeDarkMode called with:', darkMode);
    console.log('document.documentElement exists:', !!document.documentElement);
    console.log('document.readyState:', document.readyState);
    
    const applyDarkMode = () => {
        if (document.documentElement) {
            if (darkMode) {
                console.log('Setting dark mode ON');
                document.documentElement.setAttribute('data-theme', 'dark');
                console.log('data-theme attribute set to:', document.documentElement.getAttribute('data-theme'));
                
                // Force a style recalculation
                document.documentElement.style.display = 'none';
                document.documentElement.offsetHeight; // Trigger reflow
                document.documentElement.style.display = '';
            } else {
                console.log('Setting dark mode OFF');
                document.documentElement.removeAttribute('data-theme');
                console.log('data-theme attribute removed, current value:', document.documentElement.getAttribute('data-theme'));
                
                // Force a style recalculation
                document.documentElement.style.display = 'none';
                document.documentElement.offsetHeight; // Trigger reflow
                document.documentElement.style.display = '';
            }
        } else {
            console.error('document.documentElement not available!');
        }
    };
    
    // Ensure CSS is loaded before applying dark mode
    if (document.readyState === 'loading') {
        console.log('Document still loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', applyDarkMode);
    } else {
        console.log('Document ready, applying dark mode immediately');
        // Add a small delay to ensure CSS is fully parsed
        setTimeout(applyDarkMode, 10);
    }
};

export const toggleDarkMode = () => {
    console.log('Dark mode toggle clicked!');
    
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
        console.warn('Dark mode toggle called outside of browser environment');
        return false;
    }
    
    const currentState = document.documentElement.getAttribute('data-theme') === 'dark';
    console.log('Current dark mode state:', currentState);
    const newMode = !currentState;
    
    console.log('Toggling dark mode to:', newMode);
    
    if (newMode) {
        console.log('Enabling dark mode');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        console.log('Disabling dark mode');
        document.documentElement.removeAttribute('data-theme');
    }
    
    // Force a style recalculation to ensure changes are applied immediately
    console.log('Forcing style recalculation...');
    document.documentElement.style.display = 'none';
    document.documentElement.offsetHeight; // Trigger reflow
    document.documentElement.style.display = '';
    
    // Verify the attribute was set correctly
    const actualState = document.documentElement.getAttribute('data-theme');
    console.log('Actual data-theme attribute after toggle:', actualState);
    
    // Check if CSS variables are actually changing
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-color').trim();
    const textColor = computedStyle.getPropertyValue('--text-dark').trim();
    const headerBg = computedStyle.getPropertyValue('--header-bg').trim();
    console.log('Current CSS variable values:');
    console.log('- --bg-color:', bgColor);
    console.log('- --text-dark:', textColor);
    console.log('- --header-bg:', headerBg);
    
    // Check if the body background actually changed
    const bodyStyle = getComputedStyle(document.body);
    const bodyBg = bodyStyle.backgroundColor;
    console.log('Body background color:', bodyBg);
    
    // Test if CSS is loaded by checking if variables exist
    if (!bgColor) {
        console.error('CSS variables not found! CSS may not be loaded properly.');
        // Try to reload the stylesheet
        const cssLink = document.querySelector('link[href="styles.css"]');
        if (cssLink) {
            console.log('Attempting to reload CSS...');
            cssLink.href = cssLink.href + '?v=' + Date.now();
        }
    }
    
    setDarkMode(newMode);
    console.log('Dark mode state saved to localStorage:', newMode);
    return newMode;
};
