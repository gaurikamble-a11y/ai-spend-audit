import { describe, it, expect } from "vitest";
import { runAudit } from "../lib/audit";

describe("AI Spend Audit Engine", () => {
  it("calculates monthly savings", () => {
    const result = runAudit({
      toolName: "Claude",
      currentPlanName: "Claude Team ($25/user/mo)",
      seats: 10,
      teamSize: 2,
    });

    expect(result.monthlySavings).toBeGreaterThan(0);
  });

  it("calculates annual savings correctly", () => {
    const result = runAudit({
      toolName: "Cursor",
      currentPlanName: "Business ($40/user/mo)",
      seats: 5,
      teamSize: 1,
    });

    expect(result.annualSavings).toBe(
      result.monthlySavings * 12
    );
  });

  it("detects overspending", () => {
    const result = runAudit({
      toolName: "ChatGPT",
      currentPlanName: "ChatGPT Team ($25/user/mo)",
      seats: 5,
      teamSize: 1,
    });

    expect(result.isOverspending).toBe(true);
  });

  it("returns recommendation text", () => {
    const result = runAudit({
      toolName: "Gemini",
      currentPlanName: "Gemini for Workspace",
      seats: 4,
      teamSize: 2,
    });

    expect(result.recommendation.length).toBeGreaterThan(0);
  });

  it("handles already optimal plans", () => {
    const result = runAudit({
      toolName: "Copilot",
      currentPlanName: "Business ($19/user/mo)",
      seats: 5,
      teamSize: 5,
    });

    expect(result.recommendation).toContain("cost-effective");
  });
});