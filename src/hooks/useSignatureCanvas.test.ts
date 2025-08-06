
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

    expect(result.current.hasSignature).toBe(false);
    expect(result.current.canvasRef.current).toBeNull();
  });

  it('should set canvas ref correctly', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    // Simulate setting the canvas ref directly
    result.current.canvasRef.current = mockCanvas as any;

    expect(result.current.canvasRef.current).toBe(mockCanvas);
  });

  it('should clear the canvas', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    result.current.canvasRef.current = mockCanvas as any;
    result.current.clearSignature();

    expect(mockCanvas.getContext().clearRect).toHaveBeenCalled();
    expect(result.current.hasSignature).toBe(false);
  });

  it('should handle signature start', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    result.current.canvasRef.current = mockCanvas as any;
    result.current.startDrawing({ clientX: 10, clientY: 10 } as any);

    expect(mockCanvas.getContext().beginPath).toHaveBeenCalled();
    expect(mockCanvas.getContext().moveTo).toHaveBeenCalledWith(10, 10);
  });

  it('should handle signature move', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    result.current.canvasRef.current = mockCanvas as any;
    result.current.draw({ clientX: 20, clientY: 20 } as any);

    expect(mockCanvas.getContext().lineTo).toHaveBeenCalledWith(20, 20);
    expect(mockCanvas.getContext().stroke).toHaveBeenCalled();
  });

  it('should handle touch signature start', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    result.current.canvasRef.current = mockCanvas as any;
    result.current.startDrawing({ touches: [{ clientX: 10, clientY: 10 }] } as any);

    expect(mockCanvas.getContext().beginPath).toHaveBeenCalled();
    expect(mockCanvas.getContext().moveTo).toHaveBeenCalledWith(10, 10);
  });

  it('should handle touch signature move', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    result.current.canvasRef.current = mockCanvas as any;
    result.current.draw({ touches: [{ clientX: 20, clientY: 20 }] } as any);

    expect(mockCanvas.getContext().lineTo).toHaveBeenCalledWith(20, 20);
    expect(mockCanvas.getContext().stroke).toHaveBeenCalled();
  });

  it('should return signature data URL', () => {
    const { result } = renderHook(() => useSignatureCanvas());
    result.current.canvasRef.current = mockCanvas as any;
    const dataURL = result.current.saveSignature();

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(dataURL).toBe('data:image/png;base64,mockdata');
  });
});
