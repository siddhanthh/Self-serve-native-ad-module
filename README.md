# Self-Serve Native Ad Platform (Ad-Module)

Ad-Module is a self-serve native advertising platform built with Next.js 15, React, Tailwind CSS, and PostgreSQL. It allows advertisers to create, run, and track native ad campaigns using a hybrid budget model (both CPC and CPM simultaneously) with real-time analytics. It includes an administrative moderation workflow for approving, rejecting, or pausing campaigns before they go live.

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create a `.env.local` file in the project root:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your-secret-key-here
```

### 3. Initialize the database
Set up tables and run mock data/event seeding:
```bash
node migration.mjs
node seed.mjs
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔒 User Roles & Credentials

For local testing, the seeding script creates accounts with the password `password123`:

- **Superadmin (Moderator dashboard & approvals)**: `admin@example.com`
- **Advertiser (Campaign creation & campaign analytics)**: `advertiser@example.com`
- **Viewer (Landing page ad feed)**: `viewer@example.com`

---

## 🛠️ Features & Architecture

- **Budget Capping**: Campaigns are automatically pulled from rotation inside `/api/ads/serve` as soon as their spent amount crosses the budget limit (`spent_amount >= total_budget`).
- **Atomic Transactions**: Campaign event tracking increments spent balances dynamically using atomic SQL updates inside Postgres transactions.
- **Dynamic Charting**: Multi-axis charts matching clicks, impressions, CTR, and spend figures over time.
