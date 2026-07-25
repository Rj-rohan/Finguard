# ⚡ LeakZero AI

> **Hidden Subscription & Recurring Payment Leak Detector**  
> Stop losing money to forgotten subscriptions, price hikes, and duplicate services.

---

## What is LeakZero AI?

LeakZero AI is a full-stack SaaS application that automatically detects financial leaks in your subscription spending. It analyzes your subscriptions, finds waste, identifies duplicates, tracks price hikes, and uses AI to give you personalized advice — all in real time.

Built for **InnovaHack 2025**.

---

## Features

### 🏠 Dashboard
Real-time overview of your financial health — monthly spend, unused subscriptions, upcoming charges, leak score, and AI recommendations at a glance.

### 📄 Import Data
Import transactions via CSV bank statement upload. Supports drag & drop with live preview before importing. SMS, Gmail, and UPI integrations coming soon.

### 💳 Subscription Detector
Auto-detects and tracks all your subscriptions — Netflix, Spotify, Adobe, AWS, Google One, and more. Shows merchant, amount, frequency, next payment date, and status.

### 📈 Price Hike Monitor
Tracks historical pricing for each subscription and alerts you when prices increase. Visual line charts show the price trend over time with percentage increase highlighted.

### ⚠️ Duplicate Subscription Finder
Detects when you're paying for multiple services that do the same job — e.g. Spotify + YouTube Music + Apple Music. Recommends which one to keep (cheapest/most popular) and calculates exact monthly waste.

### 🎁 Free Trial Tracker
Tracks active free trials with countdown timers. Sends urgent warnings when a trial is 3 days or less from charging your card.

### 📊 Leak Score
Scores your financial health from 0–100 based on unused subscriptions, price hikes, duplicate services, and active trials. Visual gauge with color-coded severity.

### 💰 Savings Simulator — AI Financial Twin
Interactive simulator where you select subscriptions to cancel and instantly see:
- Monthly and annual savings
- Investment projection at custom return rate (1–20%)
- Wealth growth over 1–30 years using compound interest formula

### 🤖 AI Financial Advisor
Powered by **Groq (Llama 3.3 70B)** with 3-key rotation for zero downtime. Ask anything:
- *"Where am I wasting money?"*
- *"Do I have duplicate services?"*
- *"How much will I save if I cancel unused subscriptions?"*
- *"What happens if I invest those savings for 10 years?"*

### ✉️ AI Subscription Negotiator
Generates professional emails instantly for any subscription:
- **Cancel** — formal cancellation request
- **Downgrade** — request to move to a cheaper plan
- **Negotiate** — loyalty discount request to avoid cancellation

One click to copy and send.

### 📉 Spending Analytics
Pie chart breakdown of spending by category (Entertainment, Productivity, Cloud, etc.) and bar chart of monthly transaction history.

### 📅 Upcoming Payments
Calendar-style view of all upcoming charges sorted by date. Color-coded urgency — red for today/tomorrow, yellow for within 3 days.

### 🔔 Smart Alerts
Real-time alerts for:
- Price hikes detected
- Duplicate charges
- Unused subscriptions (30+ days)
- Trial ending soon
- Payment failures

Mark individual or all alerts as read.

### 📄 AI Reports
One-click PDF report generation with:
- Leak Score
- Monthly & annual spend
- Top spending breakdown
- Unused subscription list
- AI recommendations

### ⚙️ Settings
Notification preferences, currency selection, theme toggle, and one-click demo data seeding.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (Railway) / SQLite (local) |
| ORM | Prisma 7 |
| AI | Groq API — Llama 3.3 70B Versatile |
| Charts | Recharts |
| Icons | Lucide React |
| PDF | jsPDF |
| Styling | Tailwind CSS v4 |
| Auth | JWT (jose) + bcryptjs |
| Deployment | Railway |

---

## Project Structure

```
my-app/
├── app/
│   ├── (auth)/          # Login & signup pages
│   ├── advisor/         # AI Financial Advisor + Email Negotiator
│   ├── alerts/          # Smart Alerts
│   ├── analytics/       # Spending Analytics charts
│   ├── api/             # All API routes
│   │   ├── ai-chat/     # Groq AI with rule-based fallback
│   │   ├── alerts/      # CRUD for alerts
│   │   ├── leak-score/  # Score calculation
│   │   ├── price-history/ # Price hike detection
│   │   ├── seed/        # Demo data seeder
│   │   ├── subscriptions/ # Subscription CRUD
│   │   └── transactions/  # Transaction CRUD
│   ├── dashboard/       # Main dashboard
│   ├── duplicates/      # Duplicate finder
│   ├── import/          # CSV import
│   ├── leak-score/      # Leak score gauge
│   ├── price-hike/      # Price hike monitor
│   ├── reports/         # PDF report generator
│   ├── savings/         # AI Financial Twin simulator
│   ├── settings/        # App settings
│   ├── subscriptions/   # Subscription manager
│   ├── trials/          # Free trial tracker
│   └── upcoming/        # Upcoming payments calendar
├── components/
│   ├── Sidebar.js       # Navigation sidebar
│   ├── TopNav.js        # Top navigation bar
│   └── AICopilot.js     # Floating AI assistant
├── lib/
│   ├── prisma.js        # Prisma client singleton
│   ├── groq.js          # Groq client with 3-key rotation
│   └── auth.js          # JWT auth utilities
└── prisma/
    └── schema.prisma    # Database schema
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/leakzero-ai.git
cd leakzero-ai
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
GROQ_API_KEY_1="your_groq_key_1"
GROQ_API_KEY_2="your_groq_key_2"
GROQ_API_KEY_3="your_groq_key_3"
```

### 3. Set up the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Seed demo data
Go to **Settings → Seed Demo Data** or call the API directly:
```bash
curl -X POST http://localhost:3000/api/seed
```

---

## Deployment on Railway

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/leakzero-ai.git
git push -u origin main
```

### 2. Create Railway project
1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo** → select your repo

### 3. Add PostgreSQL
In your Railway project → **+ New → Database → PostgreSQL**

### 4. Add environment variables
In Railway → your service → **Variables**:

| Key | Value |
|---|---|
| `DATABASE_URL` | Add Reference → Postgres `DATABASE_URL` |
| `GROQ_API_KEY_1` | your key |
| `GROQ_API_KEY_2` | your key |
| `GROQ_API_KEY_3` | your key |
| `NODE_ENV` | `production` |

### 5. Deploy
Railway auto-deploys on push. Build runs:
1. `npm install` → `prisma generate`
2. `next build` → `prisma migrate deploy`
3. `next start`

### 6. Seed demo data
Visit `https://your-app.railway.app/settings` → click **Seed Demo Data**

---

## AI Architecture

The AI advisor uses a **two-layer system** for reliability:

```
User Question
      ↓
Rule-Based Engine (instant, always accurate)
  ├── Matches? → Return precise answer with exact numbers
  └── No match? → Send to Groq API
                      ↓
              Groq Key 1 → fails? → Key 2 → fails? → Key 3
                      ↓
              Personalized AI response
                      ↓
              All keys fail? → Smart fallback message
```

This ensures the app **never breaks during a demo** even if all API keys hit rate limits.

---

## Demo Account

Use the seed endpoint to populate demo data, then explore with these AI questions:

| Question | What it shows |
|---|---|
| *"Where am I wasting money?"* | Lists unused subscriptions with last-used dates |
| *"Do I have duplicate services?"* | Finds 3 music apps, 2 video apps, 2 design tools |
| *"How much can I save this year?"* | Full savings breakdown + 5yr/10yr investment projection |
| *"Which subscriptions should I cancel?"* | Prioritized cancel list with reasons |
| *"Write a cancellation email for Adobe"* | Generates professional email instantly |
| *"What if I invest my savings for 10 years?"* | Compound interest projection |

---

## Unique Features

### ⭐ AI Subscription Negotiator
Instead of just saying "cancel Netflix", LeakZero AI generates ready-to-send cancellation, downgrade, and price negotiation emails for any subscription. One click to copy.

### ⭐ AI Financial Twin
Interactive savings simulator — drag sliders to cancel subscriptions and watch your wealth grow in real time. Shows compound interest projections over 1–30 years at custom return rates. Transforms the app from a tracker into a financial planning tool.

---

## License

MIT

---

Built with ❤️ for InnovaHack 2025

---

## Quick Demo

Visit `/settings` after deployment and click **Seed Demo Data** to load 10 subscriptions, price history, and alerts instantly.
