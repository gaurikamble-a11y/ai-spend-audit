# Tests

## Planned Audit Engine Tests

### test-audit-basic.ts
Checks whether the audit engine returns savings calculations correctly for standard plans.

---

### test-overkill-plan.ts
Verifies that expensive team plans are flagged for small teams.

---

### test-optimal-plan.ts
Checks that already optimized plans return honest recommendations instead of forced savings.

---

### test-alternative-recommendation.ts
Ensures lower-cost alternatives are suggested where applicable.

---

### test-annual-savings.ts
Validates annual savings calculations based on monthly values.

---

# How To Run

Tests are intended to run using:

```bash
npm test