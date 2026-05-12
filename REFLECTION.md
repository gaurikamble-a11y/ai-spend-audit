# Reflection

## 1. Hardest Bug

The hardest issue during development was integrating multiple AI-generated components into the same Next.js project structure.

Some generated files expected hooks or folders that did not actually exist in the project, which caused import and runtime errors. One example was generated code referencing useAudit hooks while my project only contained audit.ts logic files.

To debug this, I traced the import paths manually, compared file locations, and simplified the architecture instead of continuing to patch increasingly complex generated code.

This taught me that AI-generated code still requires strong understanding of project structure and debugging fundamentals.

---

## 2. A Decision I Reversed

Initially I considered adding a login system and user accounts because many SaaS products include authentication by default.

After rereading the assignment, I realized the product was intentionally designed to be frictionless and usable without login.

I removed the idea and focused more on improving the audit flow itself and making results immediately accessible.

This made the product simpler and more aligned with the actual use case.

---

## 3. What I Would Build Next

If I had another week, I would focus on:
- backend database integration
- email capture flow
- AI-generated summaries
- shareable public report URLs
- better analytics tracking

I would also improve recommendation accuracy using more detailed usage models and potentially benchmark spending against similar teams.

---

## 4. AI Usage During Development

I used AI tools including Claude, ChatGPT, and Antigravity during development.

AI was mainly used for:
- frontend scaffolding
- debugging TypeScript issues
- Tailwind layout generation
- documentation assistance
- architecture brainstorming

I did not fully trust one-shot generated code because it often introduced incorrect imports or overcomplicated structures.

One specific example was generated code referencing hooks and file paths that did not exist in the actual project. I manually simplified and corrected these integrations during development.

The most useful role of AI was speeding up repetitive work while still requiring manual debugging and decision-making.

---

## 5. Self Evaluation

### Discipline — 7/10
I stayed consistent with development and deployment work while balancing documentation and debugging.

### Code Quality — 7/10
The codebase is organized and functional, though some areas could be refactored further with more time.

### Design Sense — 8/10
I focused heavily on building a modern SaaS-style UI with responsive layouts and clean visual hierarchy.

### Problem Solving — 7/10
Several debugging and integration issues required manual fixes beyond AI-generated suggestions.

### Entrepreneurial Thinking — 6/10
I tried to think about real startup cost problems and user value rather than treating the assignment like a simple coding task.