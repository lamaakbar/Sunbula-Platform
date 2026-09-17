# SANBALA | سنبلة

Centralized nursery management and decision-support platform.

> Demo data is fictional. It is not official nursery production data.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (portable relational schema; PostgreSQL-ready)

## Setup

```bash
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).


## First vertical slice

1. Choose **Employee**
2. Sign in as Ahmed
3. Open **My Zone** → cell **A-03**
4. See soil moisture **32% / LOW** (expected 40–60%)
5. Log **Irrigation**
6. Related watering task completes and event history updates
7. Sign in as **Khalid** (Eastern supervisor) to see the operation
8. Sign in as **HQ** to see Eastern nursery aggregation update

Ahmed belongs to Eastern Region Nursery. Sara supervises Riyadh, so she correctly cannot see Ahmed’s zone.
