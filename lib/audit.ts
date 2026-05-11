/**
 * audit.ts — AI Spend Audit Engine
 * ---------------------------------
 * A self-contained TypeScript module that analyses an organisation's AI tool
 * subscriptions, detects overspending, and recommends cheaper plans.
 *
 * Supported tools: ChatGPT, Claude, Cursor, Copilot, Gemini, Windsurf
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. SHARED TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Every supported AI tool. */
export type ToolName =
  | "ChatGPT"
  | "Claude"
  | "Cursor"
  | "Copilot"
  | "Gemini"
  | "Windsurf";

/**
 * Billing model of a plan:
 *  - "flat"      → one fixed price per month regardless of seats
 *  - "per_seat"  → price multiplied by number of seats purchased
 */
export type BillingModel = "flat" | "per_seat";

/** A single pricing tier for a tool. */
export interface Plan {
  /** Human-readable plan name, e.g. "Pro ($20/mo)". */
  name: string;
  /** Monthly cost in USD (base or per-seat depending on billingModel). */
  monthlyPrice: number;
  billingModel: BillingModel;
  /**
   * Minimum number of seats required to be on this plan.
   * Defaults to 1 if omitted.
   */
  minSeats?: number;
  /**
   * Maximum number of seats supported on this plan.
   * Unlimited if omitted.
   */
  maxSeats?: number;
}

/** The input a caller provides to runAudit(). */
export interface AuditInput {
  toolName: ToolName;
  /** Exact plan name the team is currently on (must match a Plan.name). */
  currentPlanName: string;
  /** Number of licences/seats purchased. */
  seats: number;
  /** Total headcount who actually need AI access. */
  teamSize: number;
}

/** The result returned by runAudit(). */
export interface AuditResult {
  toolName: ToolName;
  currentPlanName: string;
  /** What the team actually pays right now (USD / month). */
  currentSpend: number;
  /** What the team *should* pay on the recommended plan (USD / month). */
  recommendedSpend: number;
  /** currentSpend − recommendedSpend (USD / month; 0 if already optimal). */
  monthlySavings: number;
  /** monthlySavings × 12 (USD / year). */
  annualSavings: number;
  /** Name of the recommended plan. */
  recommendedPlanName: string;
  /** Human-readable explanation of the recommendation. */
  recommendation: string;
  /** TRUE when a more cost-effective option was found. */
  isOverspending: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRICING CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Source-of-truth pricing data, hardcoded for predictability.
 *
 * Plans are ordered cheapest → most expensive within each tool so that
 * recommendation logic can simply find the first plan that satisfies
 * the team's constraints.
 */
export const PRICING: Record<ToolName, Plan[]> = {
  // ── ChatGPT ────────────────────────────────────────────────────────────────
  ChatGPT: [
    {
      name: "Free",
      monthlyPrice: 0,
      billingModel: "flat",
    },
    {
      name: "ChatGPT Plus ($20/mo)",
      monthlyPrice: 20,
      billingModel: "flat",
      maxSeats: 1, // individual plan
    },
    {
      name: "ChatGPT Team ($25/user/mo)",
      monthlyPrice: 25,
      billingModel: "per_seat",
      minSeats: 2,
    },
    {
      name: "ChatGPT Enterprise",
      monthlyPrice: 60, // estimated per-seat list price
      billingModel: "per_seat",
      minSeats: 150,
    },
  ],

  // ── Claude ─────────────────────────────────────────────────────────────────
  Claude: [
    {
      name: "Free",
      monthlyPrice: 0,
      billingModel: "flat",
    },
    {
      name: "Claude Pro ($20/mo)",
      monthlyPrice: 20,
      billingModel: "flat",
      maxSeats: 1,
    },
    {
      name: "Claude Team ($25/user/mo)",
      monthlyPrice: 25,
      billingModel: "per_seat",
      minSeats: 2,
    },
    {
      name: "Claude Enterprise",
      monthlyPrice: 50,
      billingModel: "per_seat",
      minSeats: 40,
    },
  ],

  // ── Cursor ─────────────────────────────────────────────────────────────────
  Cursor: [
    {
      name: "Hobby (Free)",
      monthlyPrice: 0,
      billingModel: "flat",
    },
    {
      name: "Pro ($20/mo)",
      monthlyPrice: 20,
      billingModel: "flat",
      maxSeats: 1,
    },
    {
      name: "Business ($40/user/mo)",
      monthlyPrice: 40,
      billingModel: "per_seat",
      minSeats: 2,
    },
  ],

  // ── Copilot ────────────────────────────────────────────────────────────────
  Copilot: [
    {
      name: "Individual ($10/mo)",
      monthlyPrice: 10,
      billingModel: "flat",
      maxSeats: 1,
    },
    {
      name: "Business ($19/user/mo)",
      monthlyPrice: 19,
      billingModel: "per_seat",
      minSeats: 2,
    },
    {
      name: "Enterprise ($39/user/mo)",
      monthlyPrice: 39,
      billingModel: "per_seat",
      minSeats: 300,
    },
  ],

  // ── Gemini ─────────────────────────────────────────────────────────────────
  Gemini: [
    {
      name: "Free",
      monthlyPrice: 0,
      billingModel: "flat",
    },
    {
      name: "Google One AI Premium ($19.99/mo)",
      monthlyPrice: 19.99,
      billingModel: "flat",
      maxSeats: 1,
    },
    {
      name: "Gemini for Workspace",
      monthlyPrice: 20,
      billingModel: "per_seat",
      minSeats: 2,
    },
  ],

  // ── Windsurf ───────────────────────────────────────────────────────────────
  Windsurf: [
    {
      name: "Free",
      monthlyPrice: 0,
      billingModel: "flat",
    },
    {
      name: "Pro ($15/mo)",
      monthlyPrice: 15,
      billingModel: "flat",
      maxSeats: 1,
    },
    {
      name: "Teams ($35/user/mo)",
      monthlyPrice: 35,
      billingModel: "per_seat",
      minSeats: 2,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate what a given plan actually costs for a specific seat count.
 *
 * @example
 * calculatePlanCost({ monthlyPrice: 25, billingModel: "per_seat" }, 10)
 * // → 250
 */
export function calculatePlanCost(plan: Plan, seats: number): number {
  const actualSeats = Math.max(1, seats);
  return plan.billingModel === "per_seat"
    ? plan.monthlyPrice * actualSeats
    : plan.monthlyPrice;
}

/**
 * Find a plan object by its name for a given tool.
 * Returns undefined when the plan name doesn't exist.
 */
export function findPlan(toolName: ToolName, planName: string): Plan | undefined {
  return PRICING[toolName].find((p) => p.name === planName);
}

/**
 * Return every plan that is structurally valid for the given seat count —
 * i.e. plans where minSeats ≤ seats ≤ maxSeats.
 */
export function eligiblePlans(toolName: ToolName, seats: number): Plan[] {
  return PRICING[toolName].filter((plan) => {
    const min = plan.minSeats ?? 1;
    const max = plan.maxSeats ?? Infinity;
    return seats >= min && seats <= max;
  });
}

/**
 * Round a dollar amount to 2 decimal places to avoid floating-point noise.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RECOMMENDATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the cheapest plan suitable for the team's actual needs.
 *
 * Strategy:
 *  1. Filter plans that support `teamSize` seats (not seats purchased).
 *     We use teamSize as the true demand signal.
 *  2. Among those, pick the one with the lowest total monthly cost.
 *
 * If no plan covers teamSize seats (e.g. Enterprise with minSeats: 150 but
 * teamSize is 5), we relax the filter and just find the cheapest absolute plan.
 */
function findCheapestPlan(toolName: ToolName, teamSize: number): Plan {
  const plans = PRICING[toolName];

  // Plans the team is eligible for based on REAL demand (teamSize).
  const suitable = plans.filter((plan) => {
    const min = plan.minSeats ?? 1;
    const max = plan.maxSeats ?? Infinity;
    return teamSize >= min && teamSize <= max;
  });

  const pool = suitable.length > 0 ? suitable : plans;

  // Pick the plan with the lowest total cost at teamSize seats.
  return pool.reduce((best, plan) => {
    const bestCost = calculatePlanCost(best, teamSize);
    const planCost = calculatePlanCost(plan, teamSize);
    return planCost < bestCost ? plan : best;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. OVERSPENDING DETECTION RULES
// ─────────────────────────────────────────────────────────────────────────────

interface OverspendingFlag {
  detected: boolean;
  reason?: string;
}

/**
 * Apply heuristic rules to detect overspending patterns beyond raw cost.
 *
 * Rules checked (in order):
 *  A. Team-plan for solo user  → downgrade to individual plan
 *  B. Paying for far more seats than team needs (>30% overage)
 *  C. Enterprise plan for small team (< 20 people)
 */
function detectOverspending(
  toolName: ToolName,
  currentPlan: Plan,
  seats: number,
  teamSize: number
): OverspendingFlag {
  // Rule A: Per-seat plan but team is just 1 person
  if (currentPlan.billingModel === "per_seat" && teamSize <= 1) {
    return {
      detected: true,
      reason: `You're on a team/per-seat plan but only have 1 person. ` +
        `An individual flat-rate plan would be much cheaper.`,
    };
  }

  // Rule B: Paying for significantly more seats than team size
  if (seats > teamSize * 1.3) {
    const excess = seats - teamSize;
    return {
      detected: true,
      reason:
        `You purchased ${seats} seats but only have ${teamSize} people ` +
        `(${excess} unused seat${excess > 1 ? "s" : ""}). ` +
        `Consider reducing your seat count.`,
    };
  }

  // Rule C: Enterprise plan for a small team
  const isEnterprisePlan =
    currentPlan.name.toLowerCase().includes("enterprise");
  if (isEnterprisePlan && teamSize < 20) {
    return {
      detected: true,
      reason:
        `Enterprise plans are designed for large organisations. ` +
        `With only ${teamSize} people a Team plan will save money.`,
    };
  }

  return { detected: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN AUDIT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runAudit — the core engine entry point.
 *
 * @param input - Details about the tool subscription to audit.
 * @returns     - Full audit result including spend figures and recommendation.
 *
 * @example
 * const result = runAudit({
 *   toolName: "Claude",
 *   currentPlanName: "Claude Team ($25/user/mo)",
 *   seats: 10,
 *   teamSize: 2,
 * });
 * console.log(result.recommendation);
 * // "You're paying for 10 seats but only have 2 people …"
 */
export function runAudit(input: AuditInput): AuditResult {
  const { toolName, currentPlanName, seats, teamSize } = input;

  // ── Validate tool ──────────────────────────────────────────────────────────
  const toolPlans = PRICING[toolName];
  if (!toolPlans) {
    throw new Error(
      `Unknown tool "${toolName}". Supported tools: ${Object.keys(PRICING).join(", ")}`
    );
  }

  // ── Validate current plan ──────────────────────────────────────────────────
  const currentPlan = findPlan(toolName, currentPlanName);
  if (!currentPlan) {
    const validNames = toolPlans.map((p) => `"${p.name}"`).join(", ");
    throw new Error(
      `Unknown plan "${currentPlanName}" for ${toolName}. Valid plans: ${validNames}`
    );
  }

  // ── What they pay now ──────────────────────────────────────────────────────
  const currentSpend = round2(calculatePlanCost(currentPlan, seats));

  // ── What they *should* pay ─────────────────────────────────────────────────
  const recommendedPlan = findCheapestPlan(toolName, teamSize);
  const recommendedSpend = round2(calculatePlanCost(recommendedPlan, teamSize));

  // ── Savings ───────────────────────────────────────────────────────────────
  const monthlySavings = round2(Math.max(0, currentSpend - recommendedSpend));
  const annualSavings = round2(monthlySavings * 12);

  // ── Overspending heuristics ────────────────────────────────────────────────
  const overspendFlag = detectOverspending(toolName, currentPlan, seats, teamSize);

  // ── Build recommendation message ───────────────────────────────────────────
  const alreadyOnBest = recommendedPlan.name === currentPlan.name && monthlySavings === 0;
  const isOverspending = !alreadyOnBest || overspendFlag.detected;

  let recommendation: string;

  if (alreadyOnBest && !overspendFlag.detected) {
    recommendation =
      `✅ You're already on the most cost-effective ${toolName} plan ` +
      `("${currentPlan.name}") for a team of ${teamSize}. No changes needed.`;
  } else {
    const parts: string[] = [];

    // Prepend rule-based warning if one fired
    if (overspendFlag.detected && overspendFlag.reason) {
      parts.push(`⚠️  ${overspendFlag.reason}`);
    }

    if (monthlySavings > 0) {
      parts.push(
        `💡 Switch from "${currentPlan.name}" to "${recommendedPlan.name}" ` +
        `to save $${monthlySavings}/month ($${annualSavings}/year).`
      );

      // Contextual detail based on billing model change
      if (
        currentPlan.billingModel === "per_seat" &&
        recommendedPlan.billingModel === "flat"
      ) {
        parts.push(
          `A flat-rate individual plan suits your team size of ${teamSize} ` +
          `better than paying per seat.`
        );
      } else if (
        currentPlan.billingModel === "per_seat" &&
        recommendedPlan.billingModel === "per_seat"
      ) {
        parts.push(
          `The "${recommendedPlan.name}" tier is $${recommendedPlan.monthlyPrice}/seat ` +
          `vs your current $${currentPlan.monthlyPrice}/seat.`
        );
      }
    } else if (overspendFlag.detected) {
      // Overspend flag fired but no cheaper plan exists cost-wise — flag the pattern anyway
      parts.push(
        `Even though your raw cost is comparable, consider adjusting your ` +
        `seat count or plan to better reflect actual usage.`
      );
    }

    recommendation = parts.join(" ");
  }

  return {
    toolName,
    currentPlanName: currentPlan.name,
    currentSpend,
    recommendedSpend,
    monthlySavings,
    annualSavings,
    recommendedPlanName: recommendedPlan.name,
    recommendation,
    isOverspending,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. BATCH AUDIT (multiple tools at once)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run audits for several tools simultaneously and return a summary.
 *
 * @example
 * const summary = runBatchAudit([
 *   { toolName: "Claude", currentPlanName: "Claude Team ($25/user/mo)", seats: 20, teamSize: 3 },
 *   { toolName: "Cursor", currentPlanName: "Business ($40/user/mo)", seats: 5, teamSize: 5 },
 * ]);
 */
export interface BatchAuditSummary {
  results: AuditResult[];
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  /** Number of tools where overspending was detected. */
  overspendingCount: number;
}

export function runBatchAudit(inputs: AuditInput[]): BatchAuditSummary {
  const results = inputs.map(runAudit);

  const totalCurrentSpend = round2(results.reduce((s, r) => s + r.currentSpend, 0));
  const totalRecommendedSpend = round2(results.reduce((s, r) => s + r.recommendedSpend, 0));
  const totalMonthlySavings = round2(Math.max(0, totalCurrentSpend - totalRecommendedSpend));
  const totalAnnualSavings = round2(totalMonthlySavings * 12);
  const overspendingCount = results.filter((r) => r.isOverspending).length;

  return {
    results,
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    overspendingCount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. QUICK-START EXAMPLES (uncomment to test with `npx ts-node audit.ts`)
// ─────────────────────────────────────────────────────────────────────────────

/*
// Example 1: Team of 2 on an expensive per-seat plan → recommend downgrade
const ex1 = runAudit({
  toolName: "Claude",
  currentPlanName: "Claude Team ($25/user/mo)",
  seats: 10,
  teamSize: 2,
});
console.log("── Example 1 ──────────────────────────────");
console.log("Current Spend :  $" + ex1.currentSpend + "/mo");
console.log("Recommended   :  $" + ex1.recommendedSpend + "/mo");
console.log("Monthly Saving:  $" + ex1.monthlySavings);
console.log("Annual Saving :  $" + ex1.annualSavings);
console.log("Recommendation: ", ex1.recommendation);
console.log();

// Example 2: Solo developer on Cursor Business → suggest Pro
const ex2 = runAudit({
  toolName: "Cursor",
  currentPlanName: "Business ($40/user/mo)",
  seats: 1,
  teamSize: 1,
});
console.log("── Example 2 ──────────────────────────────");
console.log(ex2.recommendation);
console.log();

// Example 3: Perfectly sized Copilot Business subscription → no changes
const ex3 = runAudit({
  toolName: "Copilot",
  currentPlanName: "Business ($19/user/mo)",
  seats: 15,
  teamSize: 15,
});
console.log("── Example 3 ──────────────────────────────");
console.log(ex3.recommendation);
console.log();

// Example 4: Batch audit across multiple tools
const batch = runBatchAudit([
  { toolName: "ChatGPT", currentPlanName: "ChatGPT Team ($25/user/mo)", seats: 5, teamSize: 1 },
  { toolName: "Gemini",  currentPlanName: "Gemini for Workspace",        seats: 3, teamSize: 3 },
  { toolName: "Windsurf", currentPlanName: "Teams ($35/user/mo)",        seats: 8, teamSize: 4 },
]);
console.log("── Batch Audit Summary ────────────────────");
console.log("Total Current Spend    : $" + batch.totalCurrentSpend + "/mo");
console.log("Total Recommended Spend: $" + batch.totalRecommendedSpend + "/mo");
console.log("Total Monthly Savings  : $" + batch.totalMonthlySavings);
console.log("Total Annual  Savings  : $" + batch.totalAnnualSavings);
console.log("Tools Overspending     : " + batch.overspendingCount);
*/