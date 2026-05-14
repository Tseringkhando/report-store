Live dashboard: built with Next.js, connected to a hosted PostgreSQL instance on Neon, deployed on Vercel.

store_dashboard/ — Next.js frontend dashboard
├── app/
│ ├── page.tsx — Dashboard: revenue stats + charts
│ ├── products/page.tsx — Product catalogue with search + category filter
│ ├── products/new/page.tsx — Add new product form
│ ├── customers/page.tsx — Customer list with LTV + segmentation
│ ├── customers/new/page.tsx — Add new customer form
│ ├── orders/page.tsx — All orders with inline status update
│ ├── orders/new/page.tsx — New order form with cart system
│ ├── inventory/page.tsx — Inventory health with reorder alerts
│ ├── inventory/new/page.tsx — Add product to warehouse inventory
│ ├── warehouses/page.tsx — Warehouse list
│ └── warehouses/new/page.tsx — Add new warehouse form
│ └── api/ — Next.js API routes (connect to Neon)
│ ├── dashboard/route.ts
│ ├── products/route.ts
│ ├── customers/route.ts
│ ├── orders/route.ts
│ ├── orders/[id]/route.ts
│ ├── inventory/route.ts
│ └── warehouses/route.ts
├── components/
│ └── Sidebar.tsx — Navigation sidebar
├── lib/
│ └── db.ts — PostgreSQL connection pool (pg)
└── .env.local — DATABASE_URL (not committed)
Schema Overview
categories ──< products ──< order_items >── orders >── customers
│ │
└──< inventory >── warehouses reviews
│
inventory_log

Tech stack
LayerTechnologyDatabasePostgreSQL 15 on NeonBackend APINext.js 14 API RoutesFrontendNext.js 14 + TypeScript + TailwindChartsRechartsDeploymentVercel
