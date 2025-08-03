// In-App Notification System
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.nextId = 1;
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 4000) {
        const id = this.nextId++;
        const notification = this.createNotification(id, message, type, duration);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    }

    createNotification(id, message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.dataset.id = id;

        const icon = this.getIcon(type);
        const closeBtn = duration === 0 ? this.createCloseButton(id) : '';

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-message">${message}</div>
                ${closeBtn}
            </div>
        `;

        return notification;
    }

    createCloseButton(id) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => this.remove(id));
        return closeBtn.outerHTML;
    }

    getIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <circle cx="12" cy="12" r="10"/>
                     <line x1="12" y1="16" x2="12" y2="12"/>
                     <line x1="12" y1="8" x2="12.01" y2="8"/>
                   </svg>`
        };
        return icons[type] || icons.info;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }

    // Convenience methods
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Create global notification manager instance
const notificationManager = new NotificationManager();

// Export both the class and the instance
export { NotificationManager, notificationManager };

// Also add to window for global access if needed
window.notifications = notificationManager;
