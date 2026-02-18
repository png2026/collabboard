import { describe, it, expect } from 'vitest';
import { getCursorColor, CURSOR_COLORS } from './presence';

describe('presence', () => {
  it('CURSOR_COLORS has 8 vivid colors', () => {
    expect(CURSOR_COLORS).toHaveLength(8);
    CURSOR_COLORS.forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('getCursorColor returns consistent color for same userId', () => {
    const color1 = getCursorColor('user-abc');
    const color2 = getCursorColor('user-abc');
    expect(color1).toBe(color2);
  });

  it('getCursorColor returns a color from CURSOR_COLORS', () => {
    const color = getCursorColor('any-user-id');
    expect(CURSOR_COLORS).toContain(color);
  });

  it('getCursorColor produces variety across different users', () => {
    const colors = new Set();
    for (let i = 0; i < 30; i++) {
      colors.add(getCursorColor(`user-${i}`));
    }
    expect(colors.size).toBeGreaterThan(1);
  });
});
