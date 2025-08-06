import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock useAuth to provide a user
vi.mock("../useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } })
}));

const insertMock = vi.fn().mockResolvedValue({ error: null });
const updateEqMock = vi.fn().mockResolvedValue({ error: null });
const updateMock = vi.fn(() => ({ eq: updateEqMock }));
const maybeSingleMock = vi
  .fn()
  .mockResolvedValue({ data: { id: "profile-1", organization_id: "org-1" }, error: null });
const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "employee_info") {
        return {
          select: selectMock,
          update: updateMock
        } as any;
      }
      if (table === "user_roles") {
        return {
          insert: insertMock
        } as any;
      }
      return {} as any;
    }
  }
}));

import { useOnboardingStatus } from "../useOnboardingStatus";

describe("markOnboardingComplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts admin role for current user", async () => {
    const { result } = renderHook(() => useOnboardingStatus());

    await act(async () => {
      await result.current.markOnboardingComplete();
    });

    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-1",
      role: "admin",
      organization_id: "org-1"
    });
  });
});
