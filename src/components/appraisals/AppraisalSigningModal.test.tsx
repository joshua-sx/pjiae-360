import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppraisalSigningModal from "./AppraisalSigningModal";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
}));

const mockUseSignatureCanvas = vi.fn();
vi.mock("@/hooks/useSignatureCanvas", () => ({
  useSignatureCanvas: () => mockUseSignatureCanvas(),
}));

const mockToast = vi.fn();
vi.mock("@/hooks/useToastFeedback", () => ({
  useToastFeedback: () => mockToast,
}));

describe("AppraisalSigningModal", () => {
  let baseCanvasReturn: any;
  beforeEach(() => {
    baseCanvasReturn = {
      canvasRef: { current: document.createElement("canvas") },
      hasSignature: true,
      pathLength: 10,
      isSaved: true,
      signatureDataUrl: "data:url",
      startDrawing: vi.fn(),
      draw: vi.fn(),
      stopDrawing: vi.fn(),
      clearSignature: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      saveSignature: vi.fn().mockReturnValue("data:url"),
      historyStep: 1,
      historyLength: 2,
    };
    mockUseSignatureCanvas.mockReturnValue(baseCanvasReturn);
  });

  it("enables sign button after agreement and calls callbacks", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(<AppraisalSigningModal open onClose={onClose} onSuccess={onSuccess} />);
    const disabledButton = screen.getByRole("button", { name: /accept agreement first/i });
    expect(disabledButton).toBeDisabled();
    await user.click(screen.getByLabelText(/I confirm/i));
    const signButton = screen.getByRole("button", { name: /sign appraisal/i });
    expect(signButton).not.toBeDisabled();
    await user.click(signButton);
    await new Promise(resolve => setTimeout(resolve, 1100));
    expect(onSuccess).toHaveBeenCalledWith("data:url");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls saveSignature when save button clicked", async () => {
    const saveSignature = vi.fn().mockReturnValue("data:url");
    mockUseSignatureCanvas.mockReturnValueOnce({
      ...baseCanvasReturn,
      isSaved: false,
      hasSignature: true,
      saveSignature,
    });
    const user = userEvent.setup();
    render(<AppraisalSigningModal open onClose={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /^Save signature$/i }));
    expect(saveSignature).toHaveBeenCalled();
  });
});
