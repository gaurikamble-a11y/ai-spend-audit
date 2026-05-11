/**
 * useAudit.ts
 * -----------
 * A custom React hook that bridges SpendAuditForm → audit engine.
 *
 * Usage:
 *   const { result, error, loading, calculate, reset } = useAudit();
 */

import { useState } from "react";
import { runAudit, AuditResult, ToolName } from "@/lib/audit";

// ── The shape of raw form data coming in from SpendAuditForm ─────────────────

export interface AuditFormData {
  toolName: string;       // e.g. "Claude"
  currentPlanName: string; // e.g. "Claude Team ($25/user/mo)"
  seats: string;          // raw string from <input type="number">
  teamSize: string;       // raw string from <input type="number">
}

// ── Hook return type ─────────────────────────────────────────────────────────

export interface UseAuditReturn {
  /** The audit result, or null if not yet calculated. */
  result: AuditResult | null;
  /** Any error message from the engine (e.g. invalid plan name). */
  error: string | null;
  /** True while the audit is being computed (useful for loading spinners). */
  loading: boolean;
  /**
   * Call this on form submission. Parses + validates the raw form data,
   * runs runAudit(), and stores the result in state.
   */
  calculate: (formData: AuditFormData) => void;
  /** Clears the result and error so the user can start over. */
  reset: () => void;
}

// ── The hook ─────────────────────────────────────────────────────────────────

export function useAudit(): UseAuditReturn {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function calculate(formData: AuditFormData) {
    // Clear any previous state
    setError(null);
    setResult(null);
    setLoading(true);

    // Wrap in setTimeout(0) so the loading state renders before computation.
    // For a real async API call, replace this with an async/await fetch.
    setTimeout(() => {
      try {
        // ── Parse raw string inputs into numbers ──────────────────────────
        const seats = parseInt(formData.seats, 10);
        const teamSize = parseInt(formData.teamSize, 10);

        // ── Basic sanity checks (the form should catch these, but belt-and-suspenders)
        if (!formData.toolName) throw new Error("Please select a tool.");
        if (!formData.currentPlanName) throw new Error("Please select a plan.");
        if (isNaN(seats) || seats < 1) throw new Error("Seats must be a whole number ≥ 1.");
        if (isNaN(teamSize) || teamSize < 1) throw new Error("Team size must be a whole number ≥ 1.");

        // ── Run the audit engine ──────────────────────────────────────────
        const auditResult = runAudit({
          toolName: formData.toolName as ToolName,
          currentPlanName: formData.currentPlanName,
          seats,
          teamSize,
        });

        setResult(auditResult);
      } catch (err: unknown) {
        // Surface a friendly error message in the UI
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong. Please check your inputs and try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 0);
  }

  function reset() {
    setResult(null);
    setError(null);
    setLoading(false);
  }

  return { result, error, loading, calculate, reset };
}
