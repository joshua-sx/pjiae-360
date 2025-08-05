import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSignatureCanvas } from "./useSignatureCanvas";

describe("useSignatureCanvas", () => {
  let canvas: HTMLCanvasElement;
  let ctx: any;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    };
    canvas.getContext = vi.fn(() => ctx);
    canvas.toDataURL = vi.fn(() => "data:url");
    canvas.getBoundingClientRect = vi.fn(() => ({ left: 0, top: 0, width: 600, height: 200 }));
    (global as any).Image = class {
      onload: (() => void) | null = null;
      set src(_src: string) {
        this.onload && this.onload();
      }
    };
  });

  it("supports undo and redo history", () => {
    const { result } = renderHook(() => useSignatureCanvas());
    act(() => {
      result.current.canvasRef.current = canvas;
    });
    act(() => {
      result.current.clearSignature();
    });

    act(() => {
      result.current.startDrawing({ clientX: 0, clientY: 0 } as MouseEvent);
    });
    act(() => {
      result.current.draw({ clientX: 10, clientY: 0 } as MouseEvent);
    });
    act(() => {
      result.current.stopDrawing();
    });
    expect(result.current.pathLength).toBeGreaterThan(0);
    expect(result.current.hasSignature).toBe(true);

    act(() => {
      result.current.undo();
    });
    expect(result.current.hasSignature).toBe(false);

    act(() => {
      result.current.redo();
    });
    expect(result.current.hasSignature).toBe(true);
  });
});
