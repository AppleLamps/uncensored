// PDF Export Utility using jsPDF
import { getState } from '../core/state.js';

class ChatPDFExporter {
    constructor() {
        this.loadJsPDF();
    }

    async loadJsPDF() {
        // Load jsPDF from CDN if not already loaded
        if (typeof window.jsPDF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF loaded successfully');
            };
            document.head.appendChild(script);
            
            // Wait for script to load
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
    }

    async exportCurrentChat() {
        try {
            await this.loadJsPDF();
            
            const { chats, currentChatId } = getState();
            
            if (!currentChatId || !chats[currentChatId]) {
                throw new Error('No active chat to export');
            }

            const chat = chats[currentChatId];
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Set up document properties
            doc.setProperties({
                title: `Chat Export - ${chat.title}`,
                subject: 'Chat Conversation Export',
                author: 'Uncensored AI',
                creator: 'Uncensored AI Chat App'
            });

            // Document styling
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = margin;

            // Add header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(chat.title, margin, currentY);
            currentY += 10;

            // Add export date
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const exportDate = new Date().toLocaleString();
            doc.text(`Exported on: ${exportDate}`, margin, currentY);
            currentY += 15;

            // Add separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 15;

            // Process messages
            for (let i = 0; i < chat.messages.length; i++) {
                const message = chat.messages[i];
                currentY = await this.addMessageToPDF(doc, message, margin, currentY, contentWidth, pageHeight);
                
                // Add some space between messages
                currentY += 10;
            }

            // Save the PDF
            const filename = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat_export.pdf`;
            doc.save(filename);

            return true;
        } catch (error) {
            console.error('Error exporting chat to PDF:', error);
            throw error;
        }
    }

    async addMessageToPDF(doc, message, margin, startY, contentWidth, pageHeight) {
        let currentY = startY;
        const lineHeight = 6;
        const maxLineHeight = pageHeight - 40; // Leave space for margins

        // Check if we need a new page
        if (currentY > maxLineHeight) {
            doc.addPage();
            currentY = margin;
        }

        // Set message styling based on sender
        if (message.sender === 'user') {
            // User message styling
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(70, 130, 180); // Steel blue
            doc.text('You:', margin, currentY);
            currentY += lineHeight + 2;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
        } else {
            // AI message styling
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 139, 34); // Forest green
            doc.text('AI Assistant:', margin, currentY);
            currentY += lineHeight + 2;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
        }

        // Process message text
        const messageText = this.stripHtmlAndFormat(message.text);
        const lines = doc.splitTextToSize(messageText, contentWidth - 10);
        
        for (let line of lines) {
            // Check if we need a new page
            if (currentY > maxLineHeight) {
                doc.addPage();
                currentY = margin;
            }
            
            doc.setFontSize(10);
            doc.text(line, margin + 5, currentY);
            currentY += lineHeight;
        }

        // Add timestamp
        if (message.timestamp) {
            currentY += 3;
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            const timestamp = new Date(message.timestamp).toLocaleString();
            doc.text(timestamp, margin + 5, currentY);
            currentY += lineHeight;
        }

        // Add attachments info if any
        if (message.attachments && message.attachments.length > 0) {
            currentY += 3;
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`[${message.attachments.length} attachment(s)]`, margin + 5, currentY);
            currentY += lineHeight;
        }

        return currentY;
    }

    stripHtmlAndFormat(text) {
        if (!text) return '';
        
        // Create a temporary div to strip HTML tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        let cleanText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean up extra whitespace and normalize line breaks
        cleanText = cleanText
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
        
        return cleanText;
    }
}

// Create and export singleton instance
export const pdfExporter = new ChatPDFExporter();

// Export function for easy access
export const exportChatToPDF = async () => {
    try {
        await pdfExporter.exportCurrentChat();
        return true;
    } catch (error) {
        console.error('PDF export failed:', error);
        throw error;
    }
};
