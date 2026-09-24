# How Well Do You Know Me? — Questionnaire App & Admin Portal

A production-ready full-stack questionnaire application built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL + Row-Level Security + Auth)**.

---

## Architecture & Security Highlights

1. **Participant Flow (Zero-Auth Session Context)**
   - Participants claim a unique name on the landing page via an atomic PostgreSQL RPC (`claim_name`).
   - Duplicate names are blocked at the database layer with friendly validation.
   - The session persists across browser refreshes via `localStorage` and Supabase RPC context (`set_participant_context`), enforcing Row Level Security (RLS) so participants can only access and update their own responses.
   - Answers auto-save continuously on change with a 500ms debounce.

2. **Admin Flow (Hardened Role-Based Access & Dynamic Quiz Builder)**
   - Authentication powered by Supabase Auth (email + password).
   - Only accounts whose user ID is registered in the `public.admins` table can access the admin dashboard. Unauthorized accounts are immediately rejected and signed out.
   - **Dynamic Quiz Builder**:
     - Customize quiz length from a **minimum of 5 to a maximum of 20 questions** using a real-time slider and quick presets (5, 8, 10, 12, 15, 20).
     - Create custom questions and answers for **Multiple Choice (Select)**, **Open Text**, and **Rating Scale (1–10)**.
     - Designate the official correct answer and accepted aliases/alternatives directly in the builder.
     - Reorder questions (Move Up / Down), edit prompts and lore notes, and delete questions (guaranteeing minimum 5).
     - Built-in **Idea Library** with 1-click preset templates.
   - **Split Leaderboards**:
     - **Hall of Fame (100% Club)**: Participants who scored all questions correct.
     - **Hall of Shame (Got Questions Wrong)**: Ranked by most mistakes with hilarious custom roasts and mistake inspection.
   - Real-time response inspection, completion percentages, search & filtering, and one-click CSV export with detailed answer breakdowns.

3. **Database Security**
   - RLS strictly enforced on both `responses` and `admins` tables.
   - Admin access governed by `exists (select 1 from public.admins where id = auth.uid())`.
   - Security Definer RPCs isolate name claiming and session configuration.

---

## Quick Start / Setup Steps

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note down your **Project URL** and **Anon / Public Key** from **Project Settings → API**.

### Step 2: Apply the Database Migration
1. In the Supabase Dashboard, navigate to the **SQL Editor**.
2. Open or paste the contents of `supabase/migrations/01_schema.sql`.
3. Click **Run**. This provisions:
   - The `responses` table with JSONB answers and unique constraint
   - The `admins` table linked to `auth.users`
   - Row Level Security policies for both participants and admins
   - Atomic RPC functions `claim_name` and `set_participant_context`
   - Automatic `updated_at` timestamps

### Step 3: Create an Admin User (Two Easy Methods)

**Method A: In-App Admin Sign Up (Recommended)**
1. Open the app and click **Quiz Creator Admin Portal** at the bottom (or the **Admin** shield icon in the top header).
2. Select the **Sign Up** tab.
3. Enter your email (e.g. `mensahdenzel285@gmail.com`) and choose a password (minimum 6 characters).
4. Click **Create Admin Account**.
5. Your account is automatically registered in Supabase Authentication and granted admin permissions in the `public.admins` table!

> **Note on Email Verification Redirecting to localhost:**
> By default, Supabase sets `Site URL` to `http://localhost:3000`.
> - If you click the email verification link and see "localhost refused to connect", your email **has already been confirmed** in Supabase! You can simply return to the app, switch to the **Sign In** tab, and enter your password.
> - To make future verification links redirect back to your live app: In Supabase Dashboard, go to **Authentication → URL Configuration**, and paste your app's live URL into **Site URL** and **Redirect URLs**.
> - Alternatively, in Supabase Dashboard → **Authentication → Providers → Email**, turn off **"Confirm email"** for instant 1-step signups.

**Method B: Via Supabase Dashboard (Manual)**
1. In the Supabase Dashboard, go to **Authentication → Users**.
2. Click **Add User** → **Create User**, and enter your admin email and password.
3. Copy the newly created user's **User UID**.
4. Go back to the **SQL Editor** and run:
   ```sql
   insert into public.admins (id, email)
   values ('<PASTE-USER-UID-HERE>', 'your-email@example.com')
   on conflict (id) do nothing;
   ```

### Step 4: Configure Environment Variables
Create a `.env` (or `.env.local`) file in the root folder with:
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
*(Note: If environment variables are not yet configured, the app includes a Live In-Browser Demo fallback and interactive credential configuration dialog).*

### Step 5: Install and Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── supabase/
│   └── migrations/
│       └── 01_schema.sql       # Database schema, RLS policies, RPC functions
├── src/
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client, demo emulation, and DB operations
│   │   ├── questions.ts        # 12 questions definition & types
│   │   └── utils.ts            # Debounce utility, CSV export generator, percentage helpers
│   ├── components/
│   │   ├── Layout.tsx          # App header, brand bar, and connection status
│   │   ├── QuestionCard.tsx    # Multi-type question input (text, select, 1-10 scale)
│   │   ├── ProgressBar.tsx     # Animated progress indicator & completion percentage
│   │   └── AdminTable.tsx      # Response listing, search, status, and detail triggers
│   ├── pages/
│   │   ├── Landing.tsx         # Participant name claim and resume portal
│   │   ├── Questionnaire.tsx   # Quiz view with auto-save and completion banner
│   │   ├── AdminLogin.tsx      # Secure email/password login with role verification
│   │   ├── AdminDashboard.tsx  # Admin metrics, CSV export, and response management
│   │   └── AdminResponse.tsx   # Detailed answer viewer for single participant
│   ├── hooks/
│   │   ├── useParticipant.ts   # Participant session persistence & context management
│   │   └── useAdminAuth.ts     # Admin auth state, login/logout, and RBAC verification
│   ├── App.tsx                 # Router, route guard, and global connection modal
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind CSS styles & typography
├── package.json
└── README.md
```
