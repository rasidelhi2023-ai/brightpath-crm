# BrightPath CRM — Admissions & Student Pipeline Portal

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ECF8E.svg)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

A modern, role-secured Customer Relationship Management (CRM) platform engineered for **BrightPath Academy**, a coaching institute managing prospective student inquiries, admissions counseling, and follow-up tasks.

---

## 1. Business Context & Problem Statement

BrightPath Academy receives prospective student inquiries through website brochures, phone calls, walk-in visits, referrals, and social media campaigns. Prior to this platform, inquiries were manually tracked across spreadsheets and chat groups, leading to:
- **Lost Enquiries**: Lack of central capture meant students were forgotten.
- **Unclear Ownership**: Counselors lacked clear assignment of leads.
- **Missed Follow-ups**: Zero visibility into overdue calls and inquiry consultations.
- **Poor Conversion Visibility**: Management had no truthful metrics on admission drop-offs.

### Target Roles & Access Levels
* **Administrator**: Manages global operational settings, user access, and system integrity.
* **Manager**: Oversees team-wide admissions pipeline, monitors overdue follow-ups, and assigns leads to staff.
* **Counsellor**: Default least-privileged role. Manages assigned or created student leads, records interaction notes, and schedules follow-up tasks.

---

## 2. Architecture & Data Flow

```mermaid
graph TD
    User([Browser Client])
    subgraph Frontend ["React 19 + TypeScript + Vite (Hosted on Vercel)"]
        UI[App Layout / Navigation]
        Pages[Dashboard / Leads / Follow-ups / Reports / Settings]
        Services[Typed Service Layer: leadService, followupService, metricService]
        AuthContext[Auth Context & Role State]
        Client[Supabase JS Client]
    end
    subgraph Backend ["Supabase Managed Cloud"]
        Auth[Supabase Auth (JWT)]
        Postgres[(PostgreSQL Database)]
        RLS[Row Level Security Policies]
        Tables[profiles | leads | follow_ups | activities]
    end
    User --> UI
    UI --> Pages
    Pages --> Services
    Services --> Client
    Client -->|Anon Key + Bearer JWT| Auth
    Client -->|RLS-Enforced Queries| Postgres
    Postgres --> RLS
    RLS --> Tables
```

* **Client Security Boundary**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed to the browser. Privileged `service_role` keys and database passwords are never bundled or committed.
* **Database Row Level Security (RLS)**: Enforced directly at the PostgreSQL layer. Counselors only access permitted leads (`created_by = auth.uid() OR assigned_to = auth.uid()`), while Managers and Admins access team records.

---

## 3. Technology Stack & Directory Structure

* **Frontend**: React 19, TypeScript, Vite 8, React Router v7, Lucide React icons.
* **Styling**: Native CSS modern SaaS design system (Navy/Indigo tokens, glassmorphism, responsive drawer).
* **Backend & Auth**: Supabase PostgreSQL, Supabase Auth.
* **Hosting**: GitHub + Vercel.

```
brightpath-crm/
├── .env.example                     # Environment template (public anon key only)
├── index.html                       # HTML5 entry with meta tags
├── package.json                     # Scripts and dependencies
├── tsconfig.json                    # TypeScript compiler configuration
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Tables, constraints, triggers & RLS policies
│       └── 002_demo_seed.sql        # Realistic sample student inquiries & tasks
└── src/
    ├── components/
    │   ├── common/                  # ErrorBoundary, ConfigBanner
    │   ├── followups/               # CreateFollowUpModal
    │   ├── layout/                  # Sidebar, Header, AppLayout
    │   └── leads/                   # LeadModal, LeadDetailModal
    ├── context/
    │   └── AuthContext.tsx          # Session & profile lifecycle provider
    ├── hooks/
    │   └── useAuth.ts               # Typed auth hook
    ├── lib/
    │   └── supabaseClient.ts        # Singleton client with runtime validator
    ├── pages/
    │   ├── AuthPage.tsx             # Sign in & Account creation
    │   ├── DashboardPage.tsx        # Live KPI metrics & pipeline progress
    │   ├── FollowUpsPage.tsx        # Follow-ups with overdue calculation
    │   ├── LeadsPage.tsx            # Multi-field search, filters, and CRUD
    │   ├── ReportsPage.tsx          # Channel breakdown & funnel progression
    │   └── SettingsPage.tsx         # Account role & live connection tester
    ├── services/
    │   ├── activityService.ts       # Audit logging
    │   ├── followupService.ts       # Task scheduling & overdue logic
    │   ├── leadService.ts           # Inquiries CRUD & stage transitions
    │   └── metricService.ts         # Mathematical KPI aggregations
    ├── types/
    │   ├── crm.types.ts             # Domain models (Lead, FollowUp, Profile)
    │   └── database.types.ts        # Supabase schema types
    ├── index.css                    # Design system tokens and styling
    └── main.tsx                     # React root with ErrorBoundary
```

---

## 4. Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [Git](https://git-scm.com/)
- A free [Supabase](https://supabase.com/) account (optional for local mock preview)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rasidelhi2023-ai/brightpath-crm.git
cd brightpath-crm
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```ini
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-client-key
```
*(Note: If you run without configuring `.env`, the app automatically launches in **Local Demo Mode** with built-in mock data for review).*

### 3. Run Locally
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build & Verify
```bash
npm run lint    # Runs strict TypeScript type-checking (tsc --noEmit)
npm run build   # Produces production distribution bundle in dist/
```

---

## 5. Supabase Database & Migrations Setup

### Step A: Execute Schema Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open the **SQL Editor**.
2. Open [supabase/migrations/001_initial_schema.sql](file:///c:/Users/Rajesh/brightpath-crm/supabase/migrations/001_initial_schema.sql).
3. Paste the contents into the SQL Editor and click **Run**.
   * *This creates the `profiles`, `leads`, `follow_ups`, and `activities` tables, enables Row Level Security, configures role helper functions, and sets up the auto-profile trigger on signup.*

### Step B: (Optional) Load Demo Workshop Data
1. In the Supabase SQL Editor, open [supabase/migrations/002_demo_seed.sql](file:///c:/Users/Rajesh/brightpath-crm/supabase/migrations/002_demo_seed.sql).
2. Paste and click **Run** to populate realistic sample student inquiries and follow-up tasks.

### Step C: Bootstrap Initial Administrator
Sign up your primary counselor account via the application's `/auth` page. Next, run this one-line command in the Supabase SQL Editor to elevate your account to Administrator:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

---

## 6. Verification Testing Checklist

| Test Case | Description & Command | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Static Build** | `npm run build` | Zero TypeScript or bundler errors; output generated in `dist/`. | **PASS** |
| **Type Check / Lint** | `npm run lint` | Strict type validation passes across all components and services. | **PASS** |
| **Lead Creation** | Add Lead modal on `/leads` | Lead created with name, phone, course interest; persists and logs audit event. | **PASS** |
| **Lead Status & Lost Reason** | Change stage to `Lost` | Prompts for required `lost_reason` per specification; persists on save. | **PASS** |
| **Multi-Filter & Search** | Keyword search + Status + Source filter | Real-time filter conjunction with one-click "Reset" button. | **PASS** |
| **Follow-up Overdue Logic** | Due date earlier than current time | `due_at < now() && status === 'pending'` triggers red Overdue badge. | **PASS** |
| **Follow-up Completion** | Click "Mark Done" | Sets `status = 'completed'`, stamps `completed_at`, removes overdue alert. | **PASS** |
| **KPI Mathematical Reconcile** | Dashboard counts vs table lists | Total inquiries and conversion rate mathematically match database rows. | **PASS** |
| **Error Boundary** | Unhandled rendering errors | Friendly recovery screen rendered with a "Reload CRM" button. | **PASS** |
| **Keyboard Accessibility** | Modal `Escape` key | Pressing Escape immediately closes open modals and dialogs. | **PASS** |

---

## 7. Vercel Deployment Procedure

Deploying BrightPath CRM to Vercel is straightforward:

1. **Push to GitHub**:
   Ensure all changes are pushed to your repository:
   ```bash
   git push origin main
   ```
2. **Import into Vercel**:
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New...** -> **Project**.
   - Select your `brightpath-crm` repository and click **Import**.
3. **Configure Build Settings**:
   - **Framework Preset**: `Vite` (automatically detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Configure Environment Variables**:
   In Vercel's project settings, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public publishable/anon key.
5. **Deploy & Verify**:
   - Click **Deploy**.
   - Open your live production URL (e.g. `https://brightpath-crm.vercel.app`).
   - Test sign-in, lead creation, and dashboard metrics on desktop and mobile viewports.

---

## 8. Limitations & Production Considerations

This repository is designed as an educational and workshop CRM foundation. Before onboarding real student records with sensitive personal data, consider:
- **Audit Log Retention**: Implement automated PostgreSQL partitioning or cold-storage archiving for the `activities` table.
- **Automated Messaging**: Integrate WhatsApp Business API or transactional email (SendGrid/AWS SES) for automated follow-up reminders.
- **Rate Limiting**: Enable Supabase API rate limiting to safeguard public endpoints against brute force attempts.
- **Data Compliance**: Define student data retention policies and consent capture conforming to applicable privacy regulations (e.g., GDPR / DPDP).
- **Automated E2E Testing**: Add Playwright or Cypress end-to-end browser test suites to the CI/CD pipeline.

---

## 9. License

This project was built for BrightPath Academy educational workshops under the MIT License.
