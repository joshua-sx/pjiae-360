import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSignatureCanvas } from './useSignatureCanvas';

// Mock HTMLCanvasElement
const mockCanvas = {
  getContext: vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  }),
  toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata'),
  width: 400,
  height: 200,
  getBoundingClientRect: vi.fn().mockReturnValue({
    left: 0,
    top: 0,
    width: 400,
    height: 200,
    x: 0,
    y: 0,
    bottom: 200,
    right: 400,
    toJSON: () => ({})
  } as DOMRect)
};

describe('useSignatureCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSignatureCanvas());

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.canvasRef.current).toBeNull();
  });

  it('should set canvas ref correctly', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    const mockRef = { current: mockCanvas };
    result.current.setCanvasRef(mockRef);

    expect(result.current.canvasRef.current).toBe(mockCanvas);
  });

  it('should clear the canvas', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    const mockRef = { current: mockCanvas };
    result.current.setCanvasRef(mockRef);
    result.current.clearCanvas();

    expect(mockCanvas.getContext().clearRect).toHaveBeenCalled();
    expect(result.current.isEmpty).toBe(true);
  });

  it('should handle signature start', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    const mockRef = { current: mockCanvas };
    result.current.setCanvasRef(mockRef);
    result.current.handleSignatureStart({ clientX: 10, clientY: 10 } as any);

    expect(mockCanvas.getContext().beginPath).toHaveBeenCalled();
    expect(mockCanvas.getContext().moveTo).toHaveBeenCalledWith(10, 10);
  });

  it('should handle signature move', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    const mockRef = { current: mockCanvas };
    result.current.setCanvasRef(mockRef);
    result.current.handleSignatureMove({ clientX: 20, clientY: 20 } as any);

    expect(mockCanvas.getContext().lineTo).toHaveBeenCalledWith(20, 20);
    expect(mockCanvas.getContext().stroke).toHaveBeenCalled();
    expect(result.current.isEmpty).toBe(false);
  });

  it('should handle touch signature start', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    const mockRef = { current: mockCanvas };
    result.current.setCanvasRef(mockRef);
    result.current.handleTouchSignatureStart({ touches: [{ clientX: 10, clientY: 10 }] } as any);

    expect(mockCanvas.getContext().beginPath).toHaveBeenCalled();
    expect(mockCanvas.getContext().moveTo).toHaveBeenCalledWith(10, 10);
  });

  it('should handle touch signature move', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    const mockRef = { current: mockCanvas };
    result.current.setCanvasRef(mockRef);
    result.current.handleTouchSignatureMove({ touches: [{ clientX: 20, clientY: 20 }] } as any);

    expect(mockCanvas.getContext().lineTo).toHaveBeenCalledWith(20, 20);
    expect(mockCanvas.getContext().stroke).toHaveBeenCalled();
    expect(result.current.isEmpty).toBe(false);
  });

  it('should return signature data URL', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    const mockRef = { current: mockCanvas };
    result.current.setCanvasRef(mockRef);
    const dataURL = result.current.getSignatureData();

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(dataURL).toBe('data:image/png;base64,mockdata');
  });
});
