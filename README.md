# AI Spend Audit

AI Spend Audit is a small SaaS-style prototype that helps startups and small teams review their AI subscription costs and identify opportunities to reduce unnecessary spending.

The idea behind the project is simple:
many teams gradually subscribe to multiple AI tools (ChatGPT, Claude, Cursor, Copilot, Gemini, etc.) without regularly checking whether their current plans still make financial sense.

This project provides a quick audit flow that:
- estimates current spending
- recommends more cost-effective plans
- highlights potential monthly and annual savings

---

# Live Demo

https://ai-spend-audit-two-phi.vercel.app/

---

# What The App Does

Users can:
- choose an AI tool
- select their current subscription plan
- enter team size and seat count
- generate an instant spending audit

The app then:
- calculates current spend
- recommends cheaper or better-sized plans
- estimates monthly + yearly savings
- explains the recommendation in plain language

Audit results are persisted using localStorage so the user can refresh the page without losing progress.

---

# Supported AI Tools

- ChatGPT
- Claude
- Cursor
- GitHub Copilot
- Gemini
- Windsurf

---

# Tech Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Testing:
- Vitest

Deployment:
- Vercel

---

# Running Locally

Install dependencies:

```bash
npm install