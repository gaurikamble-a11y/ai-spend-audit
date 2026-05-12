# AI Prompt Usage

AI tools were used during development to accelerate UI generation, debugging, and documentation. All generated code was manually integrated, tested, and modified during development.

---

# Tooling Used

- Claude
- ChatGPT
- Antigravity

---

# Primary Use Cases

## UI Generation

Used AI assistance for:
- landing page generation
- responsive layout ideas
- Tailwind component structures
- shadcn/ui integration

Example prompt:

"Build a modern SaaS landing page for an AI Spend Audit startup using React, Tailwind CSS, and shadcn/ui."

Why:
To accelerate frontend scaffolding and focus more time on business logic and audit functionality.

---

## Audit Engine Logic

AI assistance was used to:
- structure recommendation logic
- design pricing optimization rules
- generate TypeScript helper structures

Example prompt:

"Generate a TypeScript audit engine for an AI Spend Audit SaaS app that calculates savings and recommends cheaper plans."

Why:
To speed up repetitive TypeScript boilerplate and recommendation structure generation.

---

## Debugging & Integration

AI was heavily used for:
- import fixes
- component integration
- React state debugging
- TypeScript error debugging
- deployment troubleshooting

Example prompt:

"Fix this Next.js TypeScript import error."

Why:
To reduce debugging time during integration of multiple generated components.

---

## Documentation Assistance

AI assistance was used for:
- architecture writing
- README formatting
- project documentation drafting

All documentation was manually reviewed and edited before inclusion.

---

# What Did Not Work Well

Some AI-generated code initially produced:
- incorrect import paths
- mismatched component structures
- invalid hook references
- broken TypeScript types

These issues required manual debugging and incremental fixes.

One-shot generation attempts were avoided because they often created unstable or overly complex code structures.

---

# Engineering Decisions

The audit calculation logic itself was intentionally kept rule-based rather than fully AI-generated because deterministic pricing logic was more reliable and easier to validate.

AI was primarily used as:
- a coding assistant
- debugging assistant
- UI accelerator

rather than a replacement for engineering decisions.