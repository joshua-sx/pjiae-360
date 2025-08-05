import { useCallback, useEffect, useRef, useState } from "react";
import _ from "lodash";

export const CANVAS_CONFIG = {
  WIDTH: 600,
  HEIGHT: 200,
  STROKE_STYLE: "hsl(var(--foreground))",
  LINE_WIDTH: 3,
  LINE_CAP: "round" as CanvasLineCap,
  LINE_JOIN: "round" as CanvasLineJoin,
};

interface HistoryEntry {
  dataUrl: string;
  pathLength: number;
}

export const useSignatureCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isSaved, setIsSaved] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_CONFIG.WIDTH;
    canvas.height = CANVAS_CONFIG.HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = CANVAS_CONFIG.STROKE_STYLE;
    ctx.lineWidth = CANVAS_CONFIG.LINE_WIDTH;
    ctx.lineCap = CANVAS_CONFIG.LINE_CAP;
    ctx.lineJoin = CANVAS_CONFIG.LINE_JOIN;
    if (history.length === 0) {
      const blank = canvas.toDataURL();
      setHistory([{ dataUrl: blank, pathLength: 0 }]);
      setHistoryStep(0);
    }
  }, [history.length]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ dataUrl: canvas.toDataURL(), pathLength });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep, pathLength]);

  const restoreFromHistory = useCallback(
    (step: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setPathLength(history[step].pathLength);
        setHasSignature(history[step].pathLength > 0);
        setHistoryStep(step);
        setIsSaved(false);
      };
      img.src = history[step].dataUrl;
    },
    [history]
  );

  const undo = useCallback(() => {
    if (historyStep > 0) {
      restoreFromHistory(historyStep - 1);
    }
  }, [historyStep, restoreFromHistory]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      restoreFromHistory(historyStep + 1);
    }
  }, [historyStep, history.length, restoreFromHistory]);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setLastPosition(pos);
  }, []);

  const draw = useCallback(
    _.throttle((e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      const pos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      const distance = calculateDistance(
        lastPosition.x,
        lastPosition.y,
        pos.x,
        pos.y
      );
      const newPathLength = pathLength + distance;
      setPathLength(newPathLength);
      setLastPosition(pos);
      setIsSaved(false);
    }, 16),
    [isDrawing, lastPosition, pathLength]
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      if (pathLength > 0) {
        setHasSignature(true);
      }
    }
  }, [isDrawing, saveToHistory, pathLength]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setPathLength(0);
    setSignatureDataUrl("");
    setIsSaved(false);
    setLastPosition({ x: 0, y: 0 });
    const blankHistory = [{ dataUrl: canvas.toDataURL(), pathLength: 0 }];
    setHistory(blankHistory);
    setHistoryStep(0);
  }, []);

  const saveSignature = useCallback(() => {
    if (!hasSignature) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);
    setIsSaved(true);
    return dataUrl;
  }, [hasSignature]);

  return {
    canvasRef,
    hasSignature,
    pathLength,
    isSaved,
    signatureDataUrl,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    undo,
    redo,
    saveSignature,
    historyStep,
    historyLength: history.length,
  };
};

export type UseSignatureCanvasReturn = ReturnType<typeof useSignatureCanvas>;

