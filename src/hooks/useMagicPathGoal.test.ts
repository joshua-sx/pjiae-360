import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

import { useMagicPathGoal } from "./useMagicPathGoal";

const { goalInsert, goalSelect, goalSingle, assignmentInsert, toast } = vi.hoisted(() => ({
  goalSingle: vi.fn(),
  goalSelect: vi.fn().mockReturnValue({ single: () => goalSingle() }),
  goalInsert: vi.fn().mockReturnValue({ select: () => goalSelect() }),
  assignmentInsert: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "goals") {
        return { insert: goalInsert };
      }
      if (table === "goal_assignments") {
        return { insert: assignmentInsert };
      }
      return {};
    },
  },
}));

vi.mock("./useOptimizedEmployees", () => ({
  useOptimizedEmployees: () => ({
    data: [
      {
        id: "emp1",
        profile: { first_name: "John", last_name: "Doe", avatar_url: "" },
        job_title: "Dev",
        department: { name: "Eng" },
      },
    ],
    isLoading: false,
  }),
}));

vi.mock("./useAuth", () => ({
  useAuth: () => ({ user: { id: "user1" } }),
}));

vi.mock("./useCurrentOrganization", () => ({
  useCurrentOrganization: () => ({ id: "org1" }),
}));

vi.mock("./use-toast", () => ({
  useToast: () => ({ toast }),
}));

describe("useMagicPathGoal", () => {
  beforeEach(() => {
    goalInsert.mockClear();
    goalSelect.mockClear();
    goalSingle.mockReset();
    assignmentInsert.mockClear();
    toast.mockClear();
    goalSingle.mockResolvedValue({ data: { id: "goal123" }, error: null });
    assignmentInsert.mockResolvedValue({ error: null });
  });

  it("creates goal successfully", async () => {
    const { result } = renderHook(() => useMagicPathGoal());

    act(() => {
      result.current.handleEmployeeSelection([
        { id: "emp1", name: "John Doe", role: "Dev", department: "Eng" },
      ]);
      result.current.handleGoalDetailsChange("goalName", "Test Goal");
      result.current.handleGoalDetailsChange("description", "Desc");
    });

    await act(async () => {
      await result.current.createGoal();
    });

    expect(goalInsert).toHaveBeenCalled();
    expect(assignmentInsert).toHaveBeenCalled();
    expect(result.current.currentStep).toBe(4);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Goal Created Successfully!" }),
    );
  });

  it("handles creation errors", async () => {
    goalSingle.mockResolvedValue({ data: null, error: new Error("fail") });

    const { result } = renderHook(() => useMagicPathGoal());
    act(() => {
      result.current.handleEmployeeSelection([
        { id: "emp1", name: "John Doe", role: "Dev", department: "Eng" },
      ]);
      result.current.handleGoalDetailsChange("goalName", "Test Goal");
      result.current.handleGoalDetailsChange("description", "Desc");
    });

    await act(async () => {
      await result.current.createGoal();
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.currentStep).toBe(1);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });
});
