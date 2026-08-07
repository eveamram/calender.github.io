# 📅 Shared Student Calendar

A polished, real-time shared calendar web application designed for two friends to track important dates, especially **exams, assignments, appointments, trips, and deadlines**.

Built with **React**, **TypeScript**, **Vite**, **Supabase (Auth, Realtime, RLS)**, and deployed automatically via **GitHub Pages**.

---

## ✨ Features

- **⚡ Real-Time Cloud Synchronization**: Supabase Realtime WebSocket subscriptions automatically broadcast additions, edits, and deletions instantly between users without refreshing.
- **🔒 Supabase Row Level Security (RLS)**: Database tables are secured so users can strictly access calendars they are members of.
- **📝 Exam Priority**: First-class exam selection with prominent badges and countdown widgets ("Exam in 3 days!").
- **🎨 Custom Avatars & Display Colors**: User profile color choices (Friend A & Friend B) color-code shared calendar items.
- **📅 Flexible Calendar Views**: Interactive 7x5 Monthly Grid, 7-Day Weekly view, and Chronological Agenda List view.
- **🔍 Multi-Level Filters & Search**: Instant search by title/notes/location, filter by Person (My events / Friend's events), filter by Category/Type, and Course selector.
- **📤 .ics iCalendar File Export**: One-click export of individual events or full shared schedules to Apple Calendar, Google Calendar, or Outlook.
- **🌙 Dark / Light Mode**: Smooth theme toggling with curated HSL design system.
- **📡 Offline Resiliency**: Connection status detection with offline banners and toast notifications.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Date-fns, Canvas-Confetti
- **Backend / Database**: Supabase PostgreSQL Database, Supabase Auth, Supabase Realtime WebSocket Channels
- **Deployment**: GitHub Pages with GitHub Actions CI/CD workflow

---

## 🚀 Supabase Setup Guide

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Navigate to **Project Settings -> API** to get your **Project URL** and **Anon Public Key**.

### 2. Apply Database Schema & RLS Policies
1. Open your Supabase Dashboard and go to the **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the complete contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Click **Run**. This will create the `calendars`, `calendar_members`, and `events` tables, setup indexes, create RLS policies, and enable Realtime publications.

### 3. Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-public-key
```

> **Note on Security**: The `VITE_SUPABASE_ANON_KEY` is completely safe to expose in client-side applications because Row Level Security (RLS) policies enforce database access control on the Supabase backend.

---

## 💻 Local Development Instructions

```bash
# Clone repository
git clone https://github.com/calender/calender.github.io.git
cd calender.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploying to GitHub Pages

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Build shared student calendar"
   git push origin main
   ```
2. In your GitHub Repository, go to **Settings -> Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Add your Supabase secrets in **Settings -> Secrets and variables -> Actions**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. The deployment workflow (`.github/workflows/deploy.yml`) will automatically build and deploy your application to GitHub Pages.

---

## 🧪 Testing Synchronization Workflow (2-User Verification)

To verify real-time sync between two users:

1. **User A** opens the app on a computer, signs up as "Alex (Friend A)", and creates a new shared calendar (e.g. "Study Duo 2026").
2. User A copies the generated **Invite Code** (e.g., `STUDY-2026-X89`).
3. **User B** opens the app on a phone/browser, signs up as "Sam (Friend B)", and selects **Join via Invite Code** using the code.
4. User A adds a new **Exam** for "CS 101".
5. **User B immediately sees the exam appear** on their screen without reloading.
6. User B edits the exam location to "Science Hall 302".
7. **User A sees the updated location immediately**.
8. User A deletes the event -> it vanishes live for both users and remains deleted after browser refreshes.
