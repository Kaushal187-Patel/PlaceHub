// Escapes HTML to prevent XSS, then applies a small allowlist of markdown-like
// formatting (bold, italic, line breaks). Safe to use with dangerouslySetInnerHTML.
export const formatMessage = (text) => {
  const escaped = String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};

export default formatMessage;
