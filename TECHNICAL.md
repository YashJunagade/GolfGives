# Technical Reference

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, CSS Modules (SCSS), Framer Motion, Zustand |
| Backend | Node.js + Express 5 (ESM), Supabase JS SDK |
| Database | PostgreSQL via Supabase (service role key on server) |
| File storage | Supabase Storage (winner proof images) |
| Auth | Supabase Auth — JWT tokens, verified server-side |
| Payments | Stripe (subscriptions + one-time Checkout sessions) |
| Email | Brevo REST API (transactional, no SMTP) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Project Structure

```
golf-platform/
├── client/                       # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/           # AppLayout, Sidebar, Navbar
│   │   ├── pages/                # One file per route
│   │   │   └── admin/            # Admin panel sub-pages
│   │   ├── services/             # API call functions (charityService, adminService, …)
│   │   ├── store/                # Zustand stores (authStore, dashboardStore)
│   │   └── hooks/                # useSubscription, useProfile, …
│   ├── vercel.json               # SPA rewrite — all paths → index.html
│   └── vite.config.js
│
├── server/
│   ├── server.js                 # Entry point — mounts /api router
│   └── src/
│       ├── controllers/          # One file per resource
│       ├── routes/               # Express routers, wired in server.js
│       ├── services/
│       │   └── emailService.js   # All transactional emails (Brevo REST)
│       └── middleware/
│           ├── auth.js           # Verifies Supabase JWT → req.user
│           └── requireSubscription.js  # Blocks non-subscribers from score/draw routes
│
└── supabase/
    └── migrations/               # SQL files — run in order in Supabase SQL Editor
```

---

## Database Schema (key tables)

| Table | Purpose |
|---|---|
| `users` | Mirrors Supabase Auth; stores `role`, `full_name`, `charity_id`, `charity_percent` |
| `subscriptions` | Stripe subscription record per user — plan, status, period dates |
| `scores` | One row per submitted score — `user_id`, `score`, `month`, `year` |
| `draws` | One per month — 5 ball numbers, prize amounts, status (`draft`/`published`) |
| `draw_results` | Winner rows — `user_id`, `draw_id`, `match_count`, `prize_amount`, `payout_status` |
| `winner_submissions` | Proof upload per win — `draw_result_id`, `image_url`, `status` |
| `charities` | Charity records — `name`, `description`, `website`, `image_url`, `featured`, `active` |
| `charity_events` | Upcoming events per charity — `charity_id`, `title`, `event_date`, `location` |

---

## API Routes

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, returns JWT |
| GET | `/api/auth/profile` | User | Get own profile |

### Subscriptions
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/subscription/checkout` | User | Create Stripe Checkout session |
| POST | `/api/subscription/cancel` | User | Cancel at period end |
| POST | `/api/subscription/webhook` | Stripe sig | Stripe event handler |

### Scores
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/scores` | Subscriber | List own scores for current month |
| POST | `/api/scores` | Subscriber | Submit a score |

### Draws
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/draws` | User | List all published draws |
| GET | `/api/draws/:id` | User | Single draw detail |

### Charities
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/charities` | — | List active charities |
| GET | `/api/charities/:id` | — | Single charity |
| GET | `/api/charities/:id/events` | — | Upcoming events for a charity |
| POST | `/api/charities/:id/events` | Admin | Add event |
| DELETE | `/api/charities/:id/events/:eventId` | Admin | Remove event |
| POST | `/api/charities/select` | User | Set charity + percent |
| POST | `/api/charities/deselect` | User | Remove charity selection |

### Dashboard
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | User | Returns subscription, scores, draws, winnings, upcoming draw |

### Donations
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/donation/checkout` | User | Create Stripe one-time Checkout session |

### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | List all users |
| PATCH | `/api/admin/users/:id` | Admin | Update user name |
| GET | `/api/admin/draws` | Admin | List all draws (draft + published) |
| POST | `/api/admin/draws` | Admin | Create draw |
| PATCH | `/api/admin/draws/:id` | Admin | Update / publish draw |
| GET | `/api/admin/winners` | Admin | List all winner submissions |
| PATCH | `/api/admin/winners/:id` | Admin | Update payout status |
| POST | `/api/admin/charities` | Admin | Create charity |
| PATCH | `/api/admin/charities/:id` | Admin | Toggle active / update |
| GET | `/api/admin/subscriptions` | Admin | List all subscriptions |
| GET | `/api/admin/analytics` | Admin | Revenue + draw statistics |

---

## Local Development

### Prerequisites

- Node.js 18+
- Supabase project (free tier works)
- Stripe account (test mode)
- Brevo account (free tier — for email)

### Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### Environment variables

**`server/.env`**

```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BRONZE=price_...
STRIPE_PRICE_SILVER=price_...
STRIPE_PRICE_GOLD=price_...
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=GolfGives <your-verified-sender@email.com>
CLIENT_URL=http://localhost:5173
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run migrations

Open the Supabase SQL Editor and run each file in `supabase/migrations/` in numeric order:

```
001_initial_schema.sql
002_subscriptions.sql
003_draws.sql
004_charities.sql
005_winners.sql
006_charity_events.sql
```

### Start

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev

# Terminal 3 — Stripe webhook forwarding
stripe listen --forward-to localhost:4000/api/subscription/webhook
```

---

## Stripe Webhook Events

The endpoint `/api/subscription/webhook` handles:

| Event | Action |
|---|---|
| `checkout.session.completed` | Records subscription, sends confirmation email |
| `customer.subscription.updated` | Syncs plan/status changes to DB |
| `customer.subscription.deleted` | Marks subscription cancelled, sends cancellation email |

The webhook secret (`STRIPE_WEBHOOK_SECRET`) is used to verify the Stripe signature on every incoming event.

---

## Email Service

All emails are sent via the Brevo REST API (`https://api.brevo.com/v3/smtp/email`) using `fetch` — no SDK, no SMTP.

Emails sent:

| Trigger | Template |
|---|---|
| Account created | Welcome email |
| Subscription confirmed | Confirmation with plan and renewal date |
| Subscription cancelled | Cancellation with access end date |
| Draw published | Notification to all subscribers |
| Win detected | Winner alert with prize amount |
| Proof reviewed | Status update to winner |

Email sends are fire-and-forget (non-blocking). Failures are logged but do not affect the API response.

---

## Auth Flow

1. Client calls `/api/auth/login` — Supabase Auth returns a JWT
2. JWT stored in Zustand (`authStore`) and sent as `Authorization: Bearer <token>` on every API request
3. Server middleware (`src/middleware/auth.js`) calls `supabase.auth.getUser(token)` to verify
4. `req.user` is populated with `{ id, email, role }`
5. Admin routes additionally check `req.user.role === 'admin'`

---

## Deployment

### Frontend → Vercel

1. In Vercel, create a new project and point the **root directory** to `client/`
2. Framework preset: **Vite**
3. Build command: `npm run build` — output: `dist`
4. Add environment variables (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
5. `client/vercel.json` already configures SPA routing — no extra steps

### Backend → Railway

1. Create a new Railway project → **Deploy from GitHub**
2. Set root directory to `server/`
3. Start command: `npm start`
4. Add all server environment variables in Railway's Variables panel
5. Set `CLIENT_URL` to your live Vercel frontend URL

### Stripe webhooks (production)

In Stripe Dashboard → Developers → Webhooks → Add endpoint:

```
https://your-railway-backend-url/api/subscription/webhook
```

Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Railway.

### Supabase Storage

The `winner-proofs` storage bucket must exist and have the following policy:

- **Upload**: authenticated users only
- **Read**: authenticated users (or public, depending on your preference)

Create the bucket in Supabase Dashboard → Storage → New bucket → name: `winner-proofs`.
