/**
 * Clipboard utility for copying text to clipboard
 * Supports modern Clipboard API with fallback for older browsers
 */

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        // Modern Clipboard API (preferred)
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers or non-HTTPS contexts
            const textArea = document.createElement('textarea');
            textArea.value = text;

            // Make it invisible
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            return successful;
        }
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
};
