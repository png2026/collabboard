import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from './useCanvas';

describe('useCanvas', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useCanvas());

    expect(result.current.stageScale).toBe(1);
    expect(result.current.stagePosition).toEqual({ x: 0, y: 0 });
    expect(result.current.selectedTool).toBe('SELECT');
    expect(result.current.selectedColor).toBeNull();
  });

  it('zoomIn increases scale', () => {
    const { result } = renderHook(() => useCanvas());

    act(() => result.current.zoomIn());

    expect(result.current.stageScale).toBeGreaterThan(1);
  });

  it('zoomOut decreases scale', () => {
    const { result } = renderHook(() => useCanvas());

    act(() => result.current.zoomOut());

    expect(result.current.stageScale).toBeLessThan(1);
  });

  it('zoomIn does not exceed max zoom (5)', () => {
    const { result } = renderHook(() => useCanvas());

    // Zoom in many times
    for (let i = 0; i < 50; i++) {
      act(() => result.current.zoomIn());
    }

    expect(result.current.stageScale).toBeLessThanOrEqual(5);
  });

  it('zoomOut does not go below min zoom (0.1)', () => {
    const { result } = renderHook(() => useCanvas());

    // Zoom out many times
    for (let i = 0; i < 50; i++) {
      act(() => result.current.zoomOut());
    }

    expect(result.current.stageScale).toBeGreaterThanOrEqual(0.1);
  });

  it('resetView resets scale and position', () => {
    const { result } = renderHook(() => useCanvas());

    // Zoom in first
    act(() => result.current.zoomIn());
    act(() => result.current.zoomIn());
    expect(result.current.stageScale).not.toBe(1);

    // Reset
    act(() => result.current.resetView());

    expect(result.current.stageScale).toBe(1);
    expect(result.current.stagePosition).toEqual({ x: 0, y: 0 });
  });

  it('setSelectedTool changes the tool', () => {
    const { result } = renderHook(() => useCanvas());

    act(() => result.current.setSelectedTool('STICKY_NOTE'));
    expect(result.current.selectedTool).toBe('STICKY_NOTE');

    act(() => result.current.setSelectedTool('RECTANGLE'));
    expect(result.current.selectedTool).toBe('RECTANGLE');
  });

  it('selectedColor starts null (per-type defaults used at creation time)', () => {
    const { result } = renderHook(() => useCanvas());
    expect(result.current.selectedColor).toBeNull();
  });

  it('setSelectedColor changes the color from null to a value', () => {
    const { result } = renderHook(() => useCanvas());
    expect(result.current.selectedColor).toBeNull();

    act(() => result.current.setSelectedColor('#FBCFE8'));
    expect(result.current.selectedColor).toBe('#FBCFE8');
  });
});
