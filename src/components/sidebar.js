import { setSidebarExpanded } from '../core/state.js';

// Check if device is mobile
const isMobile = () => window.innerWidth <= 768;

// Create mobile overlay
const createMobileOverlay = () => {
    if (document.querySelector('.sidebar-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);
};

// Close sidebar (mobile)
const closeSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.remove('expanded');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
    setSidebarExpanded(false);
};

// Sidebar Component
export const initializeSidebar = (sidebarExpanded) => {
    const sidebar = document.getElementById('sidebar');
    
    // Create mobile overlay if on mobile
    if (isMobile()) {
        createMobileOverlay();
    }
    
    // Only expand sidebar on desktop if previously expanded
    if (sidebar && sidebarExpanded && !isMobile()) {
        sidebar.classList.add('expanded');
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (isMobile()) {
            createMobileOverlay();
            // Close sidebar when switching to mobile
            if (sidebar && sidebar.classList.contains('expanded')) {
                closeSidebar();
            }
        } else {
            // Remove overlay on desktop
            if (overlay) {
                overlay.remove();
            }
        }
    });
};

export const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const isExpanded = sidebar.classList.contains('expanded');
    const newExpandedState = !isExpanded;
    
    sidebar.classList.toggle('expanded', newExpandedState);
    
    // Handle mobile overlay
    if (isMobile() && overlay) {
        overlay.classList.toggle('active', newExpandedState);
    }
    
    setSidebarExpanded(newExpandedState);
    
    return newExpandedState;
};

// Export close function for external use
export { closeSidebar };
