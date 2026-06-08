import { describe, it, expect } from 'vitest';
import { formatMessage } from './formatMessage';

describe('formatMessage (XSS-safe chatbot formatter)', () => {
  it('escapes raw HTML to prevent XSS injection', () => {
    const out = formatMessage('<img src=x onerror=alert(1)>');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });

  it('escapes script tags', () => {
    const out = formatMessage('<script>steal()</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('still renders bold and italic markdown', () => {
    expect(formatMessage('**bold**')).toBe('<strong>bold</strong>');
    expect(formatMessage('*italic*')).toBe('<em>italic</em>');
  });

  it('converts newlines to <br>', () => {
    expect(formatMessage('a\nb')).toBe('a<br>b');
  });

  it('handles null/undefined safely', () => {
    expect(formatMessage(null)).toBe('');
    expect(formatMessage(undefined)).toBe('');
  });
});
