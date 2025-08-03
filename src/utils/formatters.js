// Text and Markdown Formatting Utilities
export const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Escape HTML first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Code blocks (triple backticks)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code (single backticks)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold text (**text** or __text__)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic text (*text* or _text_)
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Split into blocks for better processing
    const blocks = html.split(/\n\s*\n/);
    const processedBlocks = [];
    
    for (let block of blocks) {
        block = block.trim();
        if (!block) continue;
        
        const lines = block.split('\n');
        
        // Check if this is a numbered list block
        if (lines.every(line => line.match(/^\d+\.\s/) || line.trim() === '')) {
            const listItems = lines
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+\.\s(.+)$/, '<li>$1</li>'))
                .join('');
            processedBlocks.push(`<ol>${listItems}</ol>`);
        }
        // Check if this is a bulleted list block
        else if (lines.every(line => line.match(/^[*+-]\s/) || line.trim() === '')) {
            const listItems = lines
                .filter(line => line.trim())
                .map(line => line.replace(/^[*+-]\s(.+)$/, '<li>$1</li>'))
                .join('');
            processedBlocks.push(`<ul>${listItems}</ul>`);
        }
        // Check if this is already a block-level element
        else if (block.match(/^<(h[1-6]|ul|ol|pre|div)/)) {
            processedBlocks.push(block);
        }
        // Regular paragraph
        else {
            // Replace single newlines with <br> within paragraphs
            const paragraphContent = block.replace(/\n/g, '<br>');
            processedBlocks.push(`<p>${paragraphContent}</p>`);
        }
    }
    
    html = processedBlocks.join('');
    
    // Sanitize the final HTML output using DOMPurify to prevent XSS attacks
    if (typeof DOMPurify !== 'undefined') {
        html = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: []
        });
    }
    
    return html;
};
