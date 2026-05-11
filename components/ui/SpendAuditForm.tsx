"use client";

import { useState, useEffect } from "react";
// Only external dependency: your existing audit engine
import { runAudit, AuditResult, ToolName } from "@/lib/audit";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SupportedTool = "ChatGPT" | "Claude" | "Cursor" | "Copilot" | "Gemini" | "Windsurf";

interface FormState {
  toolName: SupportedTool | "";
  plan: string;
  monthlySpend: string;
  numberOfSeats: string;
  teamSize: string;
  primaryUseCase: string;
}

interface FormErrors {
  toolName?: string;
  plan?: string;
  monthlySpend?: string;
  numberOfSeats?: string;
  teamSize?: string;
  primaryUseCase?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORTED_TOOLS: SupportedTool[] = [
  "ChatGPT", "Claude", "Cursor", "Copilot", "Gemini", "Windsurf",
];

const TOOL_PLANS: Record<SupportedTool, string[]> = {
  ChatGPT:  ["Free", "ChatGPT Plus ($20/mo)", "ChatGPT Team ($25/user/mo)", "ChatGPT Enterprise"],
  Claude:   ["Free", "Claude Pro ($20/mo)", "Claude Team ($25/user/mo)", "Claude Enterprise"],
  Cursor:   ["Hobby (Free)", "Pro ($20/mo)", "Business ($40/user/mo)"],
  Copilot:  ["Individual ($10/mo)", "Business ($19/user/mo)", "Enterprise ($39/user/mo)"],
  Gemini:   ["Free", "Google One AI Premium ($19.99/mo)", "Gemini for Workspace"],
  Windsurf: ["Free", "Pro ($15/mo)", "Teams ($35/user/mo)"],
};

const USE_CASES = [
  "Code Generation & Review",
  "Content Writing & Editing",
  "Research & Summarization",
  "Customer Support Automation",
  "Data Analysis & Reporting",
  "Product Design & Ideation",
  "Documentation",
  "Internal Knowledge Base",
  "Sales & Marketing Copy",
  "Other",
];

const TOOL_COLORS: Record<SupportedTool, string> = {
  ChatGPT:  "#10a37f",
  Claude:   "#d97706",
  Cursor:   "#6366f1",
  Copilot:  "#0078d4",
  Gemini:   "#4285f4",
  Windsurf: "#06b6d4",
};
// ─────────────────────────────────────────────────────────────────────────────
// localStorage keys — centralised so they never drift out of sync
// ─────────────────────────────────────────────────────────────────────────────

const LS_FORM_KEY   = "spendAudit_form";   // saves form field values
const LS_RESULT_KEY = "spendAudit_result"; // saves latest audit result

const INITIAL_FORM: FormState = {
  toolName: "",
  plan: "",
  monthlySpend: "",
  numberOfSeats: "",
  teamSize: "",
  primaryUseCase: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.toolName) errors.toolName = "Please select a tool.";
  if (!form.plan) errors.plan = "Please select a plan.";
  if (!form.monthlySpend || isNaN(Number(form.monthlySpend)) || Number(form.monthlySpend) < 0)
    errors.monthlySpend = "Enter a valid monthly spend (>= 0).";
  if (!form.numberOfSeats || !Number.isInteger(Number(form.numberOfSeats)) || Number(form.numberOfSeats) < 1)
    errors.numberOfSeats = "Enter a valid number of seats (>= 1).";
  if (!form.teamSize || !Number.isInteger(Number(form.teamSize)) || Number(form.teamSize) < 1)
    errors.teamSize = "Enter a valid team size (>= 1).";
  if (!form.primaryUseCase) errors.primaryUseCase = "Please select a use case.";
  return errors;
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny reusable UI pieces
// ─────────────────────────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-400">{message}</p>;
}

function selectClass(hasError: boolean) {
  return [
    "w-full rounded-lg border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100",
    "appearance-none cursor-pointer outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-500 focus:ring-red-500/40"
      : "border-zinc-700 hover:border-zinc-500 focus:border-indigo-500 focus:ring-indigo-500/30",
  ].join(" ");
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-lg border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100",
    "placeholder:text-zinc-600 outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-500 focus:ring-red-500/40"
      : "border-zinc-700 hover:border-zinc-500 focus:border-indigo-500 focus:ring-indigo-500/30",
  ].join(" ");
}

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result panel — rendered inline when audit succeeds
// ─────────────────────────────────────────────────────────────────────────────

function AuditResultPanel({
  result,
  accentColor,
  onReset,
}: {
  result: AuditResult;
  accentColor: string;
  onReset: () => void;
}) {
  const hasSavings = result.monthlySavings > 0;

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-6">
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
          Current plan: <span className="font-medium text-zinc-300">{result.currentPlanName}</span>
        </p>
      </div>

      {/* Card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        style={{ boxShadow: `0 0 60px -20px ${accentColor}30` }}
      >
        {/* Accent top bar */}
        <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: accentColor }} />

        <div className="p-6 space-y-5">

          {/* ── KPI grid ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Current Spend */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Current Spend
              </p>
              <p className="text-2xl font-bold tabular-nums text-zinc-100">
                {usd(result.currentSpend)}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">per month</p>
            </div>

            {/* Recommended Spend */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Recommended Spend
              </p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: accentColor }}>
                {usd(result.recommendedSpend)}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">per month</p>
            </div>

            {/* Monthly Savings */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Monthly Savings
              </p>
              <p className={`text-2xl font-bold tabular-nums ${hasSavings ? "text-emerald-400" : "text-zinc-100"}`}>
                {hasSavings ? usd(result.monthlySavings) : "—"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {hasSavings ? "saved every month" : "already optimal"}
              </p>
            </div>

            {/* Annual Savings */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Annual Savings
              </p>
              <p className={`text-2xl font-bold tabular-nums ${hasSavings ? "text-emerald-400" : "text-zinc-100"}`}>
                {hasSavings ? usd(result.annualSavings) : "—"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {hasSavings ? "saved every year" : "already optimal"}
              </p>
            </div>
          </div>

          {/* ── Recommended plan chip ── */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                Recommended Plan
              </p>
              <p className="text-sm font-semibold text-zinc-200">{result.recommendedPlanName}</p>
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

          {/* ── Recommendation message ── */}
          <div
            className="rounded-xl border p-4 text-sm leading-relaxed text-zinc-300"
            style={{
              borderColor: result.isOverspending ? "#f8717140" : "#4ade8030",
              backgroundColor: result.isOverspending ? "#f8717108" : "#4ade8008",
            }}
          >
            {result.recommendation}
          </div>

          {/* ── Savings bar (only when there are savings) ── */}
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

          {/* ── Action buttons ── */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function SpendAuditForm() {
  // Form state
  const [form, setForm]     = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // Audit state — all managed here, no external hook needed
  const [result, setResult]       = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  // ── Persist & restore form inputs ─────────────────────────────────────────

  // On mount: read saved form values from localStorage (runs once on load)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_FORM_KEY);
      if (saved) {
        // JSON.parse turns the stored string back into a FormState object
        setForm(JSON.parse(saved) as FormState);
      }
    } catch {
      // Ignore parse errors — just start with the empty form
    }
  }, []); // empty array = run once on mount

  // On every form change: write the latest values to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_FORM_KEY, JSON.stringify(form));
    } catch {
      // localStorage can throw if the browser is in private mode with storage blocked
    }
  }, [form]); // runs whenever `form` state changes

  // ── Persist & restore latest audit result ──────────────────────────────────

  // On mount: restore the last audit result so it survives a page refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_RESULT_KEY);
      if (saved) {
        setResult(JSON.parse(saved) as AuditResult);
      }
    } catch {
      // Ignore — just show an empty state
    }
  }, []); // empty array = run once on mount

  // Whenever the result changes: write it to localStorage (clear on reset)
  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem(LS_RESULT_KEY, JSON.stringify(result));
      } else {
        // result is null after handleReset() — remove the stored result too
        localStorage.removeItem(LS_RESULT_KEY);
      }
    } catch {
      //
    }
  }, [result]); // runs whenever `result` state changes

  // Derived UI values
  const availablePlans =
    form.toolName ? TOOL_PLANS[form.toolName as SupportedTool] : [];

  const accentColor =
    form.toolName ? TOOL_COLORS[form.toolName as SupportedTool] : "#6366f1";

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "toolName" ? { plan: "" } : {}), // reset plan when tool changes
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Step 1 — client-side field validation
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    // Step 2 — clear any previous result/error and show loading
    setResult(null);
    setAuditError(null);
    setLoading(true);

    // Step 3 — call runAudit() directly from lib/audit.ts
    // We wrap it in setTimeout(0) so React flushes the loading state first.
    setTimeout(() => {
      try {
        const auditResult = runAudit({
          toolName:        form.toolName as ToolName,
          currentPlanName: form.plan,
          seats:           parseInt(form.numberOfSeats, 10),
          teamSize:        parseInt(form.teamSize, 10),
        });
        setResult(auditResult);
      } catch (err: unknown) {
        // runAudit() throws if the plan name doesn't match the catalogue
        setAuditError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please check your inputs."
        );
      } finally {
        setLoading(false);
      }
    }, 0);
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setErrors({});
    setResult(null);
    setAuditError(null);
    // Wipe localStorage so a fresh audit starts from a clean slate
    try {
      localStorage.removeItem(LS_FORM_KEY);
      localStorage.removeItem(LS_RESULT_KEY);
    } catch {
      //
    }
  }

  // ── Show result panel once the engine returns ──────────────────────────────

  if (result) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <AuditResultPanel result={result} accentColor={accentColor} onReset={handleReset} />
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Spend Audit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">AI Tool Audit</h1>
          <p className="mt-2 text-sm text-zinc-500">Track and evaluate your team's AI subscription spend.</p>
        </div>

        {/* Card */}
        <div
          className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          style={{ boxShadow: `0 0 60px -20px ${accentColor}30`, transition: "box-shadow 0.5s ease" }}
        >
          <div className="absolute inset-x-0 top-0 h-0.5 transition-all duration-500" style={{ backgroundColor: accentColor }} />

          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">

            {/* Engine error banner — only shown when runAudit() itself throws */}
            {auditError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <strong className="font-semibold">Error: </strong>{auditError}
              </div>
            )}

            {/* Tool Name */}
            <div>
              <FieldLabel htmlFor="toolName">Tool Name</FieldLabel>
              <div className="relative">
                <select id="toolName" name="toolName" value={form.toolName} onChange={handleChange} className={selectClass(!!errors.toolName)}>
                  <option value="" disabled>Select an AI tool...</option>
                  {SUPPORTED_TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronIcon />
              </div>
              {form.toolName && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-xs text-zinc-500">{form.toolName} selected</span>
                </div>
              )}
              <FieldError message={errors.toolName} />
            </div>

            {/* Plan */}
            <div>
              <FieldLabel htmlFor="plan">Plan</FieldLabel>
              <div className="relative">
                <select
                  id="plan" name="plan" value={form.plan} onChange={handleChange}
                  disabled={!form.toolName}
                  className={`${selectClass(!!errors.plan)} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>{form.toolName ? "Select a plan..." : "Select a tool first"}</option>
                  {availablePlans.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronIcon />
              </div>
              <FieldError message={errors.plan} />
            </div>

            {/* Monthly Spend */}
            <div>
              <FieldLabel htmlFor="monthlySpend">Monthly Spend (USD)</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">$</span>
                <input
                  id="monthlySpend" name="monthlySpend" type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.monthlySpend} onChange={handleChange}
                  className={`${inputClass(!!errors.monthlySpend)} pl-8`}
                />
              </div>
              <FieldError message={errors.monthlySpend} />
            </div>

            {/* Seats + Team Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="numberOfSeats">Number of Seats</FieldLabel>
                <input
                  id="numberOfSeats" name="numberOfSeats" type="number" min="1" step="1" placeholder="e.g. 10"
                  value={form.numberOfSeats} onChange={handleChange}
                  className={inputClass(!!errors.numberOfSeats)}
                />
                <FieldError message={errors.numberOfSeats} />
              </div>
              <div>
                <FieldLabel htmlFor="teamSize">Team Size</FieldLabel>
                <input
                  id="teamSize" name="teamSize" type="number" min="1" step="1" placeholder="e.g. 25"
                  value={form.teamSize} onChange={handleChange}
                  className={inputClass(!!errors.teamSize)}
                />
                <FieldError message={errors.teamSize} />
              </div>
            </div>

            {/* Live seat utilization bar */}
            {form.numberOfSeats && form.teamSize && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">Seat utilization</span>
                  <span className="text-xs font-bold text-zinc-300">
                    {Math.min(100, Math.round((Number(form.numberOfSeats) / Math.max(1, Number(form.teamSize))) * 100))}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((Number(form.numberOfSeats) / Math.max(1, Number(form.teamSize))) * 100))}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Primary Use Case */}
            <div>
              <FieldLabel htmlFor="primaryUseCase">Primary Use Case</FieldLabel>
              <div className="relative">
                <select id="primaryUseCase" name="primaryUseCase" value={form.primaryUseCase} onChange={handleChange} className={selectClass(!!errors.primaryUseCase)}>
                  <option value="" disabled>Select a use case...</option>
                  {USE_CASES.map((uc) => <option key={uc} value={uc}>{uc}</option>)}
                </select>
                <ChevronIcon />
              </div>
              <FieldError message={errors.primaryUseCase} />
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="relative mt-2 w-full overflow-hidden rounded-xl py-3 text-sm font-bold text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: accentColor, boxShadow: `0 4px 24px -8px ${accentColor}80` }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Running Audit...
                </span>
              ) : (
                "Run Spend Audit"
              )}
            </button>

          </form>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          All calculations run locally — nothing is sent to a server.
        </p>
      </div>
    </div>
  );
}
