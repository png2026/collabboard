import { describe, it, expect, vi } from 'vitest';

// Mock firebase to avoid requiring env config for pure-function tests
vi.mock('./firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

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
