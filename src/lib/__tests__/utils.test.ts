import { describe, it, expect } from 'vitest';
import { escapeHtml, pad } from '../utils';

describe('escapeHtml', () => {
  it('escapes & to &amp;', () => {
    expect(escapeHtml('&')).toBe('&amp;');
  });
  it('escapes < to &lt;', () => {
    expect(escapeHtml('<')).toBe('&lt;');
  });
  it('escapes > to &gt;', () => {
    expect(escapeHtml('>')).toBe('&gt;');
  });
  it('escapes " to &quot;', () => {
    expect(escapeHtml('"')).toBe('&quot;');
  });
  it('escapes all special chars in sequence', () => {
    expect(escapeHtml('<script>"&x"</script>')).toBe(
      '&lt;script&gt;&quot;&amp;x&quot;&lt;/script&gt;',
    );
  });
  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('pad', () => {
  it('pads single digit', () => {
    expect(pad(5)).toBe('05');
  });
  it('does not pad double digit', () => {
    expect(pad(15)).toBe('15');
  });
  it('pads zero', () => {
    expect(pad(0)).toBe('00');
  });
});
