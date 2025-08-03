import { setSidebarExpanded } from '../core/state.js';

// Sidebar Component
export const initializeSidebar = (sidebarExpanded) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebarExpanded) {
        sidebar.classList.add('expanded');
    }
};

export const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const isExpanded = sidebar.classList.contains('expanded');
    const newExpandedState = !isExpanded;
    
    sidebar.classList.toggle('expanded', newExpandedState);
    setSidebarExpanded(newExpandedState);
    
    return newExpandedState;
};
