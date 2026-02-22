import { describe, it, expect } from 'vitest';
import { COLORS, DEFAULT_COLOR, TYPE_DEFAULT_COLORS, getRandomColor, getUserColor } from './colors';

describe('colors', () => {
  it('has 9 color options', () => {
    expect(COLORS).toHaveLength(9);
  });

  it('each color has name, value, and dark properties', () => {
    COLORS.forEach((color) => {
      expect(color).toHaveProperty('name');
      expect(color).toHaveProperty('value');
      expect(color).toHaveProperty('dark');
      expect(color.value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('DEFAULT_COLOR is the first color (yellow)', () => {
    expect(DEFAULT_COLOR).toBe(COLORS[0].value);
  });

  it('TYPE_DEFAULT_COLORS has correct defaults per object type', () => {
    expect(TYPE_DEFAULT_COLORS.stickyNote).toBe('#FDE68A'); // Yellow
    expect(TYPE_DEFAULT_COLORS.rectangle).toBe('#E5E7EB'); // Gray
    expect(TYPE_DEFAULT_COLORS.circle).toBe('#E5E7EB'); // Gray
  });

  it('TYPE_DEFAULT_COLORS fill types use valid palette colors', () => {
    const values = COLORS.map((c) => c.value);
    // Fill-based types should use palette colors; line/text/frame use non-palette colors
    ['stickyNote', 'rectangle', 'circle'].forEach((type) => {
      expect(values).toContain(TYPE_DEFAULT_COLORS[type]);
    });
  });

  it('getRandomColor returns a valid color from the palette', () => {
    const color = getRandomColor();
    const values = COLORS.map((c) => c.value);
    expect(values).toContain(color);
  });

  it('getUserColor returns consistent color for same userId', () => {
    const color1 = getUserColor('user-abc-123');
    const color2 = getUserColor('user-abc-123');
    expect(color1).toBe(color2);
  });

  it('getUserColor returns different colors for different userIds', () => {
    const colors = new Set();
    for (let i = 0; i < 20; i++) {
      colors.add(getUserColor(`user-${i}`));
    }
    // Should produce more than 1 unique color across 20 users
    expect(colors.size).toBeGreaterThan(1);
  });
});
