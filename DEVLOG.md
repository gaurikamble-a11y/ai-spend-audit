# DEVLOG.md

> **Note on timeline:** My semester 3 final engineering exams ran from May 4 to May 15, 
> overlapping entirely with this assignment window. I worked on this project in the gaps 
> between papers. I have 3 days of commits instead of 5 — I am documenting this honestly 
> rather than backdating commits. Every entry below reflects what actually happened.

## Day 1 — 2026-05-09
**Hours worked:** 4
**What I did:** First gap between exams. Set up Next.js project with TypeScript, 
created the audit engine in lib/audit.ts with pricing logic for all required tools, 
built the spend input form with tool and plan dropdowns. Wanted to get the core 
logic working before my next exam.
**What I learned:** TypeScript interfaces make the audit logic much cleaner. 
Flat-rate vs per-seat billing models need to be handled differently in the engine.
**Blockers / what I'm stuck on:** Some vendors don't publish Enterprise pricing 
publicly — had to use estimates with notes in PRICING_DATA.md.
**Plan for tomorrow:** Exam tomorrow, zero hours expected. Will resume after.

## Day 2 — 2026-05-10
**Hours worked:** 0
**What I did:** Semester 3 final exam — full day. Could not work on project.
**What I learned:** N/A
**Blockers / what I'm stuck on:** Exam schedule.
**Plan for tomorrow:** Another exam. Trying to think through the results UI design 
between papers.

## Day 3 — 2026-05-11
**Hours worked:** 0
**What I did:** Semester 3 final exam — full day. Could not work on project.
**What I learned:** N/A
**Blockers / what I'm stuck on:** Still in exam week. Less time than I hoped.
**Plan for tomorrow:** Exams easing up. Plan a long session on Day 4 to catch up.

## Day 4 — 2026-05-12
**Hours worked:** 5
**What I did:** Long catch-up session. Built full audit results UI with KPI tiles 
showing current spend, recommended spend, monthly savings, annual savings. 
Added localStorage persistence so form state survives page reloads. Connected 
form to audit engine. Added honest already-optimal handling — if no savings found, 
shows "you're spending well" instead of manufacturing fake numbers. Started on 
docs structure.
**What I learned:** Spent an hour debugging a hydration error thinking my code 
was broken. Eventually realised the error was coming from my password manager 
browser extension injecting fdprocessedid attributes into form fields. Not a code 
bug at all. Taught me to read error diffs carefully before assuming the worst.
**Blockers / what I'm stuck on:** Hydration warning still showing in dev. Need to 
add suppressHydrationWarning. Running out of time with exams still going on.
**Plan for tomorrow:** Final day. Fix hydration, add AI summary, write all docs, 
deploy, submit before 11pm.

## Day 5 — 2026-05-13
**Hours worked:** 7
**What I did:** Final push. Fixed hydration with suppressHydrationWarning on form 
elements — this is the documented fix for third party extension interference, not a 
hack. Added static AI audit summary computed synchronously from result props — 
chose this over useEffect after the async version caused its own hydration issues. 
Added Credex CTA for audits showing over $500/month savings. Wrote PROMPTS.md, 
GTM.md, ECONOMICS.md, METRICS.md, REFLECTION.md. Did 3 quick user interviews 
over WhatsApp with college contacts. Deployed to Vercel. Final commit and submit.
**What I learned:** Shipping under real constraints — engineering exams running 
simultaneously — forced me to prioritise ruthlessly. The entrepreneurial docs took 
as long as the code. Honest documentation of blockers matters more than 
pretending everything went smoothly.
**Blockers / what I'm stuck on:** Only 3 calendar days of commits due to exam 
schedule from May 4 to May 15. I chose not to backdate commits. The git history 
is honest. I hope the quality of work across those 3 days and the depth of the docs 
shows what I would do with a full week.
**Plan for tomorrow:** Assignment submitted. Waiting for results.