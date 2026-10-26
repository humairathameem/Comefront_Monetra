# Monetra — Make every day count.
A responsive personal-finance web app (React + Vite) with a date-aware budget engine and a **Financial Time Machine** that simulates a purchase before you make it. Uses **demo data** and **simulated connections** only.

## Team
- Team name: _TBD_  ·  Members: _add names here_

## Features
Overview with safe-to-spend today, Salary, Needs, Wants, Savings, Investments (manual), Transactions (add/edit/delete, filters, CSV import with validation + duplicate detection), CashFlow (ATM withdrawals, cash reconciliation), Bills, Time Machine, Goals, rule-based Money Coach, Reports (CSV export), Accounts (combined/individual view) and Settings. Screenshots: _add to `/docs`_.

## Tech stack
React 18, Vite, React Router (hash routing), Recharts, Lucide React, plain CSS design tokens, React Context, localStorage.

## Run
```bash
npm install
npm run dev      # development
npm test         # budget engine tests
npm run build    # production build
```

## Financial rules (`src/engine/budgetEngine.js`)
Flexible budget = income − protected savings − bills. Remaining = flexible − flexible spending. Safe to spend = min(remaining, liquid balance − protected − unpaid bills). Daily allowance = safe ÷ remaining days. Withdrawals and transfers move money between owned accounts and are never spending; refunds reduce category spend.

## Limits / security
Demo only: no login exists, data lives in localStorage, bank connections are simulated (`providerAdapter` in `Accounts.jsx` marks where an authorised provider would plug in). A real product needs a backend with secure server-side sessions. Monetra never asks for bank passwords or UPI PINs.

## AI tools used
Built with Claude (Anthropic) from a single project brief. _Team to add the prompts they actually used and which generated code they modified._

## Independently solved bug
_None recorded yet. Add a real bug, its cause and its fix here once your team has solved one — this section is intentionally not pre-filled._
