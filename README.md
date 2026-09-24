# HotSeat — The Official Denzel Questionnaire 🔥

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![React 19](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.x-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth%20%2B%20RLS-3ECF8E?logo=supabase)
![Theme](https://img.shields.io/badge/Theme-Molten%20Lava%20Orange-F97316)

> **"How well do you really know Denzel?"**  
> An interactive, high-stakes friendship questionnaire with real-time scoring, live leaderboards, brutal custom roasts, and a hardened Supabase admin portal.

---

## ✨ Features

- **🔥 Molten Lava Orange Aesthetics**: High-energy tactile UI with dark volcanic obsidian surfaces, warm amber highlights, and haptic audio sound effects.
- **⚡ Zero-Auth Participant Experience**: Participants claim a unique nickname with zero sign-up friction. Names are reserved atomically in PostgreSQL.
- **💾 Real-Time Auto-Save**: Participant answers save continuously with a 500ms debounce. Safe against accidental refreshes and browser disconnects.
- **🏆 Live Dual Leaderboards**:
  - **Hall of Fame (100% Club)**: Participants who scored a perfect 100%, ranked by submission speed.
  - **Hall of Shame**: Ranked by mistakes made, complete with personalized tier titles and hilarious roasts.
  - **Interactive Modals**: Click any participant card to view their accuracy summary (correct count, wrong count, and rank). Full answer sheets are protected and exclusively visible to verified admins.
- **🛡️ Secure Creator Admin Portal**:
  - Admin login powered by Supabase Auth with Row Level Security (RLS) checks.
  - **Dynamic Quiz Builder**: Adjust quiz length (5 to 20 questions), edit multiple choice, scales, or open-ended questions, designate official answers, and reorder questions.
  - **Participant Breakdown & CSV Export**: Inspect individual participant responses and download timestamped CSV data with one click.
- **🔒 Enterprise-Grade PostgreSQL Security**:
  - Row Level Security (RLS) enabled on all tables.
  - `is_admin()` Security Definer helper prevents infinite subquery recursion.
  - Participant session context isolated via parameterized PostgreSQL RPC functions.

---

## 🚀 One-Click Deploy to Vercel

### 1. Push to GitHub
If you haven't already, push or sync this repository to your GitHub account:
```bash
git init
git add .
git commit -m "Initial commit of HotSeat questionnaire app"
git branch -M main
git remote add origin https://github.com/<your-username>/hotseat-quiz.git
git push -u origin main
```

### 2. Import into Vercel
1. Log into [Vercel](https://vercel.com) and click **"Add New..." → "Project"**.
2. Select your `hotseat-quiz` repository.
3. Vercel will automatically detect **Vite** as the framework preset (configured via `vercel.json`).

### 3. Add Environment Variables in Vercel
Under the **Environment Variables** section in the Vercel import screen, add:

| Variable | Value | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Your Supabase Public Anonymous API Key |

### 4. Click Deploy
Vercel will build the Vite app in seconds and assign you a production URL (e.g. `https://hotseat-quiz.vercel.app`).

---

## 🗄️ Supabase Backend Setup

### Step 1: Create a Free Supabase Project
1. Head over to [supabase.com](https://supabase.com) and create a new project.
2. Once provisioned, navigate to **Project Settings → API** and copy:
   - **Project URL** (`https://xyzcompany.supabase.co`)
   - **anon public** key

### Step 2: Run the SQL Migration
1. In the Supabase Dashboard, click **SQL Editor** from the left navigation bar.
2. Click **New query**.
3. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository, copy its entire contents, paste it into the editor, and click **Run**.
4. This script sets up:
   - `public.responses` table with JSONB answers and unique participant constraints
   - `public.admins` table referencing `auth.users(id)`
   - Row Level Security (RLS) policies for anonymous participants and authenticated admins
   - Atomic RPC functions: `claim_name`, `set_participant_context`, and `register_admin_user`
   - Automated timestamp triggers

### Step 3: Configure Authentication & Redirect URLs
1. In Supabase Dashboard, go to **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel deployment URL (e.g. `https://your-app.vercel.app`).
3. Under **Redirect URLs**, add:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local development)
4. *(Optional for instant sign-in)*: Under **Authentication → Providers → Email**, you can disable **"Confirm email"** if you want instant admin signups without requiring an email confirmation link.

### Step 4: Create Your Creator Admin Account
You can create your admin account in either of two ways:

#### Option A: In-App Admin Sign-Up (Recommended)
1. Open your deployed HotSeat app in the browser.
2. Click the **Admin Shield icon** in the top navigation bar (or click "Creator Admin Portal" in the footer).
3. Switch to the **Sign Up** tab.
4. Enter your email and password (minimum 6 characters), then click **Create Admin Account**.
5. The built-in RPC `register_admin_user` immediately provisions your user in `public.admins`.

#### Option B: Manual Provisioning via Supabase Dashboard
1. In Supabase Dashboard, go to **Authentication → Users → Add User → Create User**.
2. Enter your email and password, then copy the generated **User UID**.
3. In the **SQL Editor**, run:
   ```sql
   insert into public.admins (id, email)
   values ('<PASTE-USER-UID-HERE>', 'your-email@example.com')
   on conflict (id) do nothing;
   ```

---

## 💻 Local Development Setup

To run and test the project locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/hotseat-quiz.git
cd hotseat-quiz

# 2. Install dependencies
npm install

# 3. Configure local environment variables
cp .env.example .env.local
# Edit .env.local and add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start the Vite development server
npm run dev

# 5. Build for production (verifies TypeScript types & assets)
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
├── .env.example            # Template for environment variables (Vercel & local)
├── vercel.json             # Vercel deployment config, SPA rewrites & cache headers
├── supabase/
│   ├── schema.sql          # Complete copy-pasteable PostgreSQL schema & RLS rules
│   └── migrations/
│       └── 01_schema.sql   # Versioned migration file
├── public/                 # Static public assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AdminTable.tsx             # Responses table with search and progress bars
│   │   ├── Layout.tsx                 # Header, HotSeat flame logo, and navigation
│   │   ├── ParticipantDetailModal.tsx # Participant accuracy modal with admin view guard
│   │   ├── ProgressBar.tsx            # Animated progress indicator
│   │   ├── QuestionBuilder.tsx        # Dynamic quiz customization panel
│   │   └── QuestionCard.tsx           # Interactive question renderer (select, scale, text)
│   ├── context/
│   │   └── DesignSystemContext.tsx    # Theme provider & custom design system tokens
│   ├── hooks/
│   │   ├── useAdminAuth.ts            # Supabase auth, session handling & role check
│   │   └── useParticipant.ts          # Session persistence & auto-save hook
│   ├── lib/
│   │   ├── audio.ts                   # Web Audio API haptics & confetti fireworks
│   │   ├── designSystems.ts           # Lava orange palette & geometry configuration
│   │   ├── questions.ts               # Default questions & scoring logic
│   │   ├── supabase.ts                # Supabase client & fallback emulation
│   │   └── utils.ts                   # Debounce, CSV export, and score calculators
│   ├── pages/
│   │   ├── AdminDashboard.tsx         # Creator metrics, question builder, and response data
│   │   ├── AdminLogin.tsx             # Supabase Auth sign-in / sign-up modal
│   │   ├── AdminResponse.tsx          # Single participant full-answer inspector
│   │   ├── Landing.tsx                # Nickname entry & instructions
│   │   ├── Leaderboard.tsx            # Hall of Fame & Hall of Shame podiums
│   │   └── Questionnaire.tsx          # Active quiz screen with auto-save & score summary
│   ├── App.tsx                        # Main application router
│   ├── main.tsx                       # React DOM entry point
│   └── index.css                      # Tailwind CSS v4 directives & keyframe animations
├── index.html              # HTML shell with meta tags & Google fonts
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and plugin setup
```

---

## 🛡️ Security Model & Privacy

1. **Row Level Security (RLS)**:
   - The `responses` table requires an authenticated admin session to view full participant answers.
   - Public visitors can only view aggregate accuracy metrics (total score and percentage) via the leaderboard.
2. **Zero Sensitive Secrets in Client Code**:
   - Only public Supabase parameters (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are exposed to the client. The Supabase service role key is **never** embedded or needed in client-side code.
3. **Parametric Sanitization**:
   - Participant names and answers are processed through parameterized queries and stored as structured JSONB documents, preventing SQL injection.

---

## 📄 License

MIT © [Denzel Mensah](https://github.com)
