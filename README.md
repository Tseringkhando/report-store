## Live Dashboard — Next.js + Neon PostgreSQL + Vercel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL 15 on Neon |
| Backend API | Next.js 14 API Routes |
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project Structure

```
ecommerce_db/
├── 01_schema.sql       — DDL: tables, types, constraints, comments
├── 02_seed.sql         — DML: 20 customers, 25 products, 4 warehouses, 30 orders
├── 03_queries.sql      — 12 showcase queries
├── 04_indexes.sql      — B-tree, partial, composite, expression, GIN indexes
├── 05_triggers.sql     — Auto-logging trigger on inventory changes
└── README.md

store_dashboard/
├── app/
│   ├── page.tsx                     — Dashboard: revenue stats + charts
│   ├── products/page.tsx            — Product catalogue with search + filter
│   ├── products/new/page.tsx        — Add product form
│   ├── customers/page.tsx           — Customers with LTV + segmentation
│   ├── customers/new/page.tsx       — Add customer form
│   ├── orders/page.tsx              — Orders with inline status update
│   ├── orders/new/page.tsx          — New order form with cart system
│   ├── inventory/page.tsx           — Inventory health + reorder alerts
│   ├── inventory/new/page.tsx       — Add product to warehouse
│   ├── warehouses/page.tsx          — Warehouse list
│   ├── warehouses/new/page.tsx      — Add warehouse form
│   └── api/
│       ├── dashboard/route.ts
│       ├── products/route.ts
│       ├── customers/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/route.ts
│       ├── inventory/route.ts
│       └── warehouses/route.ts
├── components/
│   └── Sidebar.tsx
├── lib/
│   └── db.ts                        — PostgreSQL connection pool
└── .env.local                       — DATABASE_URL (not committed)
```

---

## Schema

```
categories ──< products ──< order_items >── orders >── customers
                   │                                        │
                   └──< inventory >── warehouses        reviews
                             │
                         inventory_log
```

---

