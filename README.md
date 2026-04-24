# GolfGives

GolfGives is a subscription-based golf lottery platform. Members subscribe monthly, submit their golf scores, and those scores automatically enter them into a monthly prize draw. A portion of every subscription goes directly to a charity the member chooses.

---

## What the Platform Does

Every month follows the same cycle:

1. **Members subscribe** — choose Bronze, Silver, or Gold. Each tier gives a different number of lottery entries per month.
2. **Members submit scores** — up to 5 golf scores per month. Each score submitted counts as one entry into that month's draw.
3. **Admin publishes the draw** — at month end, the admin picks 5 balls (numbers 1–59) and publishes the draw result.
4. **Winners are calculated** — the system matches each member's submitted score numbers against the draw balls. 3 matches, 4 matches, or 5 matches each pay out a different prize tier.
5. **Winners claim prizes** — winners upload a proof image (e.g. a scorecard photo) to verify their win. Admin reviews and marks as paid.
6. **Charities receive donations** — each month, the platform collects the charity portion from active subscriptions and distributes it to members' chosen charities.

---

## User Roles

### Member

| What they do | Where |
|---|---|
| Sign up and subscribe | `/subscribe` |
| View their dashboard (stats, draw results, charity) | `/dashboard` |
| Submit golf scores for the month | `/scores` |
| Browse and choose a charity | `/charities` |
| View a charity profile and donate directly | `/charities/:id` |
| See past draw results and upload win proof | `/draws` |
| Manage account and subscription | `/profile` |

### Admin

| What they do | Where |
|---|---|
| Manage users (view, edit names, check subscription status) | `/admin` → Users tab |
| Create and publish monthly draws | `/admin` → Draws tab |
| Review and mark winner payouts | `/admin` → Winners tab |
| Add, activate, or deactivate charities | `/admin` → Charities tab |
| Add upcoming events to a charity | `/admin` → Charities tab → expand row |
| View subscription and revenue analytics | `/admin` → Analytics tab |
| Manage active subscriptions | `/admin` → Subscriptions tab |

---

## Key Flows

### Signing Up

The signup page has a **Member / Admin** toggle at the top.

**As a Member:**
1. Go to `/signup` — select **Member**
2. Enter name, email, password → account created
3. Pick a charity (optional) → redirected to dashboard

**As an Admin:**
1. Go to `/signup` — select **Admin**
2. Enter name, email, password
3. Enter the **Admin Invite Code**: `GolfAdmin@2026`
4. Account is created with admin role → redirected to `/admin`

### Logging In

The login page also has a **Member / Admin** toggle:

- **Member** — logs in and goes to `/dashboard`
- **Admin** — logs in and verifies the admin role. If the account is not admin, access is denied.

### Subscribing

- Three tiers: **Bronze** (1 entry), **Silver** (3 entries), **Gold** (5 entries)
- Checkout handled by Stripe — user is redirected to Stripe's hosted page
- On success, Stripe fires a webhook; the backend records the subscription and sends a confirmation email
- Subscription status is visible in the dashboard and profile page

### Submitting a Score

1. Go to `/scores`
2. Enter a score (0–59) and submit
3. The score is saved against the current month — maximum 5 per month
4. The progress bar on the scores page and dashboard shows how many slots are filled

### How the Draw Works

- Admin goes to `/admin` → Draws → creates a new draw for the current month
- Picks 5 numbers (1–59) and publishes
- The system immediately calculates winners across all subscribed members
- Members who match 3, 4, or 5 balls see a win badge on their `/draws` page
- Winners upload a proof image; admin confirms and marks payout as paid or pending

### Charity Giving

1. Go to `/charities`
2. Browse all charities or filter by Featured
3. Click **Details** on any charity to see its profile, upcoming events, and donation options
4. Click **Support this charity** to select it as your monthly recipient
5. Use the slider (10–100%) to set what percentage of your subscription goes to them
6. Alternatively, make a one-time donation via Stripe Checkout on the charity profile page

### Cancelling a Subscription

- Go to `/profile` → Cancel subscription
- Stripe schedules the cancellation at period end (member keeps access until then)
- A cancellation confirmation email is sent with the exact end date

---

## Subscription Tiers

| Tier | Monthly Entries | Charity Portion |
|---|---|---|
| Bronze | 1 | Member-set % of subscription |
| Silver | 3 | Member-set % of subscription |
| Gold | 5 | Member-set % of subscription |

The charity percentage is 10% by default and can be adjusted up to 100% on the Charities page.

---

## Prize Structure

| Matches | Prize |
|---|---|
| 5 balls | Jackpot (configurable per draw) |
| 4 balls | Second prize |
| 3 balls | Third prize |

Prize amounts are set by the admin when creating each draw. The total prize pool is shown publicly on the Draws page.
