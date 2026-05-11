"use client";

/**
 * AuditResultCard.tsx
 * -------------------
 * Displays the output of runAudit() in a polished dark card.
 *
 * Props:
 *   result  — AuditResult from the audit engine
 *   onReset — callback to clear the result and show the form again
 */

import { AuditResult } from "@/lib/audit";

// ── Tool accent colours (mirrors SpendAuditForm) ─────────────────────────────

const TOOL_COLORS: Record<string, string> = {
  ChatGPT:  "#10a37f",
  Claude:   "#d97706",
  Cursor:   "#6366f1",
  Copilot:  "#0078d4",
  Gemini:   "#4285f4",
  Windsurf: "#06b6d4",
};

// ── Helper: format dollars ────────────────────────────────────────────────────

function usd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── Sub-component: a single KPI tile ─────────────────────────────────────────

interface KpiTileProps {
  label: string;
  value: string;
  /** Optional highlight colour for the value text */
  valueColor?: string;
  /** Optional small badge below the value */
  badge?: string;
}

function KpiTile({ label, value, valueColor, badge }: KpiTileProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span
        className="text-2xl font-bold tabular-nums"
        style={{ color: valueColor ?? "#f4f4f5" }}
      >
        {value}
      </span>
      {badge && (
        <span className="text-[11px] text-zinc-500">{badge}</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface AuditResultCardProps {
  result: AuditResult;
  onReset: () => void;
}

export default function AuditResultCard({ result, onReset }: AuditResultCardProps) {
  const accentColor = TOOL_COLORS[result.toolName] ?? "#6366f1";
  const hasSavings = result.monthlySavings > 0;

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Status pill */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: result.isOverspending ? "#f87171" : "#4ade80" }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            {result.isOverspending ? "Overspending Detected" : "Spend Optimised"}
          </span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          {result.toolName} Audit Results
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Current plan:{" "}
          <span className="font-medium text-zinc-300">{result.currentPlanName}</span>
        </p>
      </div>

      {/* ── Card ───────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        style={{ boxShadow: `0 0 60px -20px ${accentColor}30` }}
      >
        {/* Coloured top bar */}
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: accentColor }}
        />

        <div className="p-6 space-y-6">

          {/* ── KPI grid ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <KpiTile
              label="Current Spend"
              value={usd(result.currentSpend)}
              badge="per month"
            />
            <KpiTile
              label="Recommended Spend"
              value={usd(result.recommendedSpend)}
              valueColor={accentColor}
              badge="per month"
            />
            <KpiTile
              label="Monthly Savings"
              value={hasSavings ? usd(result.monthlySavings) : "—"}
              valueColor={hasSavings ? "#4ade80" : undefined}
              badge={hasSavings ? "saved every month" : "already optimal"}
            />
            <KpiTile
              label="Annual Savings"
              value={hasSavings ? usd(result.annualSavings) : "—"}
              valueColor={hasSavings ? "#4ade80" : undefined}
              badge={hasSavings ? "saved every year" : "already optimal"}
            />
          </div>

          {/* ── Recommended plan chip ─────────────────────────────────────── */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                Recommended Plan
              </p>
              <p className="text-sm font-semibold text-zinc-200">
                {result.recommendedPlanName}
              </p>
            </div>
            {result.isOverspending ? (
              <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-400">
                Switch now
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                ✓ Optimal
              </span>
            )}
          </div>

          {/* ── Recommendation message ────────────────────────────────────── */}
          <div
            className="rounded-xl border p-4 text-sm leading-relaxed"
            style={{
              borderColor: result.isOverspending ? "#f87171" + "40" : "#4ade80" + "30",
              backgroundColor: result.isOverspending ? "#f8717108" : "#4ade8008",
              color: "#d4d4d8",
            }}
          >
            {result.recommendation}
          </div>

          {/* ── Savings bar (only shown when there are savings) ───────────── */}
          {hasSavings && (
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-zinc-500">Potential savings vs current spend</span>
                <span className="text-xs font-semibold text-zinc-300">
                  {Math.round((result.monthlySavings / result.currentSpend) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((result.monthlySavings / result.currentSpend) * 100))}%`,
                    backgroundColor: "#4ade80",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Action buttons ────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onReset}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700"
            >
              ← Audit Another Tool
            </button>
            {hasSavings && (
              <button
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 16px -6px ${accentColor}80`,
                }}
              >
                Save Report
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
