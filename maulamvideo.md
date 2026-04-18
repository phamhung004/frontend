# Project Report: Mẫu Làm Video (Prompt Creator Hub)

**Generated:** April 16, 2026

---

## 1. Project Overview

- **Project Name:** Mẫu Làm Video (prompt-creator-hub)
- **Purpose:** A Vietnamese-language e-commerce marketplace for selling and distributing AI prompts ("gems"), AI tool accounts, free prompt templates, and AI tool reviews. The platform enables creators to sell chatbot prompts, workflow templates, and AI-powered content, while providing an admin/staff/sale-staff management layer for operations, commissions, and analytics.
- **Type of Application:** Single-Page Application (SPA) — React web app with Supabase serverless backend (Edge Functions + PostgreSQL)
- **Target Users:**
  - **End users (Vietnamese market):** Content creators, video makers, and AI enthusiasts looking for pre-built AI prompts and tool accounts
  - **Staff/Creators:** Content creators who author and sell prompts, earning commissions
  - **Sale Staff / Affiliates:** Sales team members who drive referrals and earn commissions
  - **Administrators:** Platform operators managing orders, products, users, revenue, and analytics
- **Live URL:** https://maulamvideo.com
- **Current Development Status:** **Production** — 121 database migrations, full payment integration (Sepay bank transfer), email system (Resend), analytics (Facebook/Google/TikTok pixels), affiliate/referral programs, and multi-role dashboards all operational.

---

## 2. Tech Stack

### Primary Language
- **TypeScript** (~5.8.3) — used across frontend and Supabase Edge Functions (Deno runtime)

### Frontend Frameworks & Libraries
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router-dom` | ^6.30.1 | Client-side routing (66 routes) |
| `@tanstack/react-query` | ^5.83.0 | Server state management & caching |
| `react-hook-form` | ^7.61.1 | Form management |
| `@hookform/resolvers` | ^3.10.0 | Zod resolver for form validation |
| `zod` | ^3.25.76 | Schema validation |
| `framer-motion` | ^12.27.1 | Animations |
| `gsap` | ^3.14.2 | Advanced animations |
| `react-helmet-async` | ^2.0.5 | SEO meta tag management |
| `react-markdown` | ^10.1.0 | Markdown rendering |
| `recharts` | ^2.15.4 | Charts & data visualization |
| `sonner` | ^1.7.4 | Toast notifications |
| `canvas-confetti` | ^1.9.4 | Celebration effects on purchase |
| `date-fns` | ^3.6.0 | Date utility library |
| `embla-carousel-react` | ^8.6.0 | Carousel/slider component |
| `lucide-react` | ^0.462.0 | Icon library |
| `cmdk` | ^1.1.1 | Command palette component |
| `input-otp` | ^1.4.2 | OTP input component |
| `vaul` | ^0.9.9 | Drawer component |
| `react-resizable-panels` | ^2.1.9 | Resizable panel layouts |
| `react-day-picker` | ^8.10.1 | Date picker |
| `next-themes` | ^0.3.0 | Dark mode theme switching |

### UI Component Library
| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-*` | Various | 20+ Radix UI primitives (dialog, dropdown, tabs, tooltip, etc.) |
| `class-variance-authority` | ^0.7.1 | Variant-based component styling |
| `clsx` | ^2.1.1 | Conditional class names |
| `tailwind-merge` | ^2.6.0 | Tailwind class conflict resolution |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities for Tailwind |
| shadcn/ui | N/A (copy-paste) | 47 pre-built UI components |

### Backend / BaaS
| Technology | Details |
|------------|---------|
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth + Edge Functions + Storage) |
| `@supabase/supabase-js` | ^2.89.0 — Client SDK |
| **Supabase Edge Functions** | 15 Deno-based serverless functions |
| **Supabase Auth** | Email/password + Google OAuth |
| **Supabase Storage** | Image/file uploads |
| **PostgreSQL** | Primary database via Supabase |

### Build Tools
| Tool | Version | Purpose |
|------|---------|---------|
| `vite` | ^5.4.19 | Build tool & dev server |
| `@vitejs/plugin-react-swc` | ^3.11.0 | React fast refresh via SWC |
| `tailwindcss` | ^3.4.17 | Utility-first CSS framework |
| `postcss` | ^8.5.6 | CSS post-processing |
| `autoprefixer` | ^10.4.21 | CSS vendor prefixing |
| `typescript` | ^5.8.3 | Type checking |
| `eslint` | ^9.32.0 | Linting |
| `lovable-tagger` | ^1.1.13 | Component tagging (Lovable platform) |

### Testing Frameworks
- **None configured** — No test files, test dependencies, or test scripts exist in the project.

### Containerization / Deployment
- **No Docker/Kubernetes** — No Dockerfile, docker-compose, or container config found.
- **Hosting:** Lovable.dev platform (detected from README and `@lovable.dev/cloud-auth-js` dependency)
- **Supabase Edge Functions:** Deployed to Supabase cloud infrastructure

### CI/CD
- **None configured** — No GitHub Actions, GitLab CI, Jenkins, or other CI/CD pipeline files found.

---

## 3. Project Structure

### Directory Tree

```
prompt-creator-hub/
├── index.html                    # SPA entry HTML with font preloading & SEO setup
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite bundler config with manual chunks
├── tailwind.config.ts            # Tailwind CSS theme (colors, fonts, animations)
├── tsconfig.json                 # TypeScript project references
├── tsconfig.app.json             # App TypeScript config
├── tsconfig.node.json            # Node TypeScript config
├── postcss.config.js             # PostCSS with Tailwind + Autoprefixer
├── eslint.config.js              # ESLint flat config for React/TS
├── components.json               # shadcn/ui configuration
├── bun.lockb                     # Bun package manager lockfile
├── .env                          # Environment variables (⚠️ committed)
│
├── public/
│   ├── robots.txt                # Search engine crawl rules
│   ├── sitemap.xml               # SEO sitemap
│   └── videos/                   # Static video assets
│
├── src/
│   ├── main.tsx                  # React entry point (HelmetProvider + App)
│   ├── App.tsx                   # Router definition (66 routes)
│   ├── App.css                   # App-level styles
│   ├── index.css                 # Global Tailwind imports + CSS variables
│   ├── vite-env.d.ts             # Vite type declarations
│   │
│   ├── assets/                   # Static assets (images, icons)
│   │
│   ├── components/               # 109 component files
│   │   ├── ErrorBoundary.tsx     # React error boundary
│   │   ├── NavLink.tsx           # Navigation link component
│   │   ├── admin/                # Admin dashboard components (19 files)
│   │   │   ├── AdminLayout.tsx   # Admin sidebar + layout
│   │   │   ├── GemForm.tsx       # Gem CRUD form
│   │   │   ├── MediaUploader.tsx # File upload component
│   │   │   ├── revenue/          # Revenue analytics (10 files)
│   │   │   └── users/            # User management (5 files)
│   │   ├── auth/
│   │   │   └── AuthDialog.tsx    # Login/signup modal
│   │   ├── free-prompt/          # Free prompt components (2 files)
│   │   ├── gem/                  # Gem product components (4 files)
│   │   ├── home/                 # Homepage sections (8 files)
│   │   ├── layout/               # App layout components (5 files)
│   │   ├── payment/              # Payment flow (2 files)
│   │   ├── premium/              # Premium upsell (1 file)
│   │   ├── referral/             # Referral UI (2 files)
│   │   ├── sale/                 # Sale staff layout (1 file)
│   │   ├── seo/                  # SEO head component (1 file)
│   │   ├── shared/               # Shared withdrawal components (2 files)
│   │   ├── staff/                # Staff dashboard (3 files)
│   │   └── ui/                   # shadcn/ui components (47 files)
│   │
│   ├── hooks/                    # 17 custom React hooks
│   │   ├── useAuth.tsx           # Auth context provider
│   │   ├── useBookmarks.tsx      # Bookmark system
│   │   ├── useConversionTracking.ts  # Funnel event tracking
│   │   ├── useFlashSalePrice.tsx # Flash sale pricing
│   │   ├── useGemClickTracking.tsx   # Product click analytics
│   │   ├── useHomeData.tsx       # Homepage data fetching
│   │   ├── usePageTracking.ts    # Page view tracking
│   │   ├── usePagination.tsx     # Pagination logic
│   │   ├── usePartnerMode.tsx    # Partner/reseller mode
│   │   ├── usePixelTracking.tsx  # Facebook/Google/TikTok pixels
│   │   ├── usePremiumTracking.ts # Premium feature tracking
│   │   ├── useReferral.tsx       # Referral system
│   │   ├── useSaleAffiliate.ts   # Sale affiliate tracking
│   │   ├── useStaffOrderNotifications.tsx # Staff notifications
│   │   ├── useWithdrawal.tsx     # Withdrawal management
│   │   ├── use-mobile.tsx        # Mobile detection
│   │   └── use-toast.ts          # Toast notifications
│   │
│   ├── integrations/
│   │   ├── lovable/index.ts      # Lovable platform integration
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client initialization
│   │       └── types.ts          # Generated Supabase database types
│   │
│   ├── lib/
│   │   ├── utils.ts              # Tailwind cn() utility
│   │   ├── video.ts              # Video URL parsing (YouTube, Vimeo, direct)
│   │   └── warranty-email.ts     # Warranty email sender
│   │
│   ├── pages/                    # 67 page components
│   │   ├── Index.tsx             # Homepage
│   │   ├── Auth.tsx              # Auth page
│   │   ├── Gems.tsx              # Gem listing
│   │   ├── GemDetail.tsx         # Gem detail (600+ lines)
│   │   ├── Pay.tsx               # Payment page
│   │   ├── FreePrompts.tsx       # Free prompt listing
│   │   ├── AITools.tsx           # AI tools listing
│   │   ├── Reviews.tsx           # Reviews listing
│   │   ├── Referral.tsx          # Referral dashboard
│   │   ├── admin/                # 29 admin pages
│   │   ├── staff/                # 9 staff pages
│   │   └── sale/                 # 5 sale staff pages
│   │
│   └── types/
│       ├── database.ts           # App-level type definitions
│       ├── gem.ts                # Gem/product types
│       └── free-prompt.ts        # Free prompt types
│
└── supabase/
    ├── config.toml               # Supabase project config & function settings
    ├── functions/                # 15 Edge Functions (Deno runtime)
    │   ├── approve-bigman-withdrawal/
    │   ├── approve-order/
    │   ├── auto-review-workflow/
    │   ├── bigman-revenue-api/
    │   ├── check-payment/
    │   ├── cleanup-expired-reservations/
    │   ├── create-bigman-withdrawal/
    │   ├── create-payment/
    │   ├── crm-data-export/
    │   ├── fb-conversions-api/
    │   ├── generate-tool-review/
    │   ├── mark-commissions-paid/
    │   ├── send-email/
    │   ├── send-newsletter/
    │   └── sepay-webhook/
    └── migrations/               # 121 SQL migration files
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Dev server (port 8080), path aliases (`@/` → `src/`), manual chunks for code splitting |
| `tailwind.config.ts` | Custom theme: DM Sans/Playfair Display fonts, premium/success colors, custom animations |
| `tsconfig.json` | Project references, path mapping, relaxed strict mode (`noImplicitAny: false`, `strictNullChecks: false`) |
| `components.json` | shadcn/ui config: default style, slate base color, CSS variables, component aliases |
| `eslint.config.js` | Flat config with React hooks + refresh plugins, unused vars rule disabled |
| `supabase/config.toml` | Project ID, JWT verification settings per Edge Function |

### Entry Points
1. **Frontend:** `index.html` → `src/main.tsx` → `src/App.tsx` (React Router)
2. **Backend:** Each `supabase/functions/*/index.ts` is an independent entry point

---

## 4. Architecture & Design

### Overall Architecture Pattern
**Serverless SPA + BaaS (Backend-as-a-Service)**

The application follows a modern JAMstack-like pattern:
- **Frontend:** React SPA with client-side routing
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- **No traditional server** — all backend logic runs as Supabase Edge Functions (Deno)

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                              │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  React   │  │  React   │  │ Pixel    │  │ Conversi-│               │
│  │  Router  │  │  Query   │  │ Tracking │  │ on Track │               │
│  │ (66 rts) │  │ (cache)  │  │ (FB/GG/  │  │ (funnel  │               │
│  │          │  │          │  │  TikTok) │  │  events) │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       │              │             │              │                     │
│  ┌────┴──────────────┴─────────────┴──────────────┴─────┐              │
│  │              Supabase JS Client SDK                   │              │
│  └──────────────────────┬───────────────────────────────┘              │
└─────────────────────────┼───────────────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────────────────────┐
│                    SUPABASE CLOUD                                       │
│                         │                                               │
│  ┌──────────────────────┼──────────────────────────────────────┐       │
│  │              Supabase API Gateway                            │       │
│  │  ┌─────────┐  ┌──────┴──────┐  ┌─────────┐  ┌───────────┐ │       │
│  │  │  Auth   │  │  PostgREST  │  │ Storage │  │   Edge    │ │       │
│  │  │ (email, │  │  (REST API  │  │ (images,│  │ Functions │ │       │
│  │  │ Google  │  │  for DB)    │  │  files) │  │ (15 fns)  │ │       │
│  │  │ OAuth)  │  │             │  │         │  │           │ │       │
│  │  └────┬────┘  └──────┬──────┘  └────┬────┘  └─────┬─────┘ │       │
│  │       │              │              │              │       │       │
│  │  ┌────┴──────────────┴──────────────┴──────────────┘       │       │
│  │  │                PostgreSQL Database                       │       │
│  │  │   (40+ tables, RLS policies, RPC functions)             │       │
│  │  └─────────────────────────────────────────────────────────┘       │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────────────┐
          │               │                       │
┌─────────▼───┐  ┌───────▼────────┐  ┌───────────▼──────┐
│   Sepay     │  │   Resend       │  │  Facebook CAPI   │
│  (Bank      │  │  (Transactional│  │  (Server-side    │
│   Transfer  │  │   Email)       │  │   conversion     │
│   Webhook)  │  │                │  │   tracking)      │
└─────────────┘  └────────────────┘  └──────────────────┘
          │                                    │
┌─────────▼───────────┐           ┌────────────▼─────────┐
│   KIE AI API        │           │  BigMan System       │
│  (AI review gen,    │           │  (Internal staff     │
│   image gen)        │           │   management &       │
│                     │           │   withdrawal API)    │
└─────────────────────┘           └──────────────────────┘
```

### Data Flow

1. **Product Browsing:** Browser → Supabase PostgREST → PostgreSQL → React Query cache → UI
2. **Payment Flow:**
   - User clicks "Buy" → `create-payment` Edge Function → `pending_payments` record + bank transfer info displayed
   - User transfers to bank → Sepay detects transfer → `sepay-webhook` → validates & creates purchase records → sends confirmation email → fires conversion pixels
3. **Authentication:** Supabase Auth SDK (email/password or Google OAuth) → JWT tokens → RLS policies enforce access
4. **Analytics:** Client-side pixel SDKs (FB/Google/TikTok) + server-side Facebook CAPI via Edge Function + custom tracking_events table

### External Services & Third-Party APIs

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| **Supabase** | Database, Auth, Storage, Edge Functions | Core backend |
| **Sepay** | Vietnamese bank transfer payment gateway | Webhook → `sepay-webhook` function |
| **Resend** | Transactional email delivery | `send-email`, `send-newsletter`, `approve-order` functions |
| **Facebook Graph API** | Server-side conversion tracking (CAPI v21.0) | `fb-conversions-api` function |
| **KIE AI API** | AI content generation (Claude-based), image generation | `auto-review-workflow` function |
| **YouTube oEmbed** | Video validation for auto-reviews | `auto-review-workflow` function |
| **Google Fonts** | Web font loading | `index.html` preload |
| **BigMan System** | Internal employee/withdrawal management | `bigman-revenue-api`, `create/approve-bigman-withdrawal` functions |
| **Lovable.dev** | Hosting platform & cloud auth | `@lovable.dev/cloud-auth-js` SDK |

### Authentication & Authorization

- **Authentication:** Supabase Auth with email/password and Google OAuth
- **Session Management:** JWT tokens stored in localStorage with auto-refresh
- **Role System:** PostgreSQL `user_roles` table with `app_role` enum
  - `user` — default role, can browse & purchase
  - `admin` — full platform management access
  - `staff` — content creation & order management
  - `sale_staff` — affiliate sales & commission tracking
- **Role Checking:** Server-side RPCs (`is_admin()`, `is_staff()`, `is_sale_staff()`) called on auth state change
- **Route Protection:** Frontend role checks in `useAuth()` context; backend via RLS policies and JWT claims
- **API Auth:** Edge Functions use mix of JWT verification and API key headers (`x-api-key`, `x-crm-secret`)

---

## 5. Core Modules & Features

### 5.1 Authentication Module
- **Files:** `src/hooks/useAuth.tsx`, `src/components/auth/AuthDialog.tsx`, `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx`
- **Responsibility:** User registration, login, logout, password reset, Google OAuth, role management
- **Key Functions:**
  - `AuthProvider` — React context providing `user`, `session`, `isAdmin`, `isStaff`, `isSaleStaff`
  - `signUp(email, password, fullName)` — Creates user with metadata
  - `signIn(email, password)` — Email/password authentication
  - `signOut()` — Clears session and role state
- **Dependencies:** Supabase Auth SDK, user_roles table RPCs

### 5.2 Gem (Chatbot Prompt) Module
- **Files:** `src/pages/Gems.tsx`, `src/pages/GemDetail.tsx`, `src/components/gem/GemCard.tsx`, `src/components/gem/GemsSection.tsx`, `src/components/gem/HotGemsSection.tsx`, `src/components/gem/FlashSaleGemsSection.tsx`, `src/types/gem.ts`
- **Responsibility:** Browse, search, filter, and purchase chatbot prompts/workflows
- **Key Features:**
  - Product listing with category/price/sort filtering
  - Rich detail page with gallery, demo videos, tutorial steps
  - Flash sale countdown timers
  - Combo pricing (gem + AI tool bundle)
  - Bookmark support
  - Copy-to-clipboard for prompt instructions
- **Key Types:** `Gem`, `GemCategory`, `GemPurchase`, `TutorialStep`, `LinkedAITool`
- **Dependencies:** Payment module, Flash sale module, Tracking module

### 5.3 AI Tools & Accounts Module
- **Files:** `src/pages/AITools.tsx`, `src/pages/AIToolDetail.tsx`, `src/pages/PurchasedAIAccounts.tsx`
- **Responsibility:** Browse AI tools, view reviews, purchase shared AI tool accounts
- **Key Features:**
  - Tool listing with featured sorting
  - Account inventory management (available/reserved/sold/expired statuses)
  - Account credential delivery via email
  - Validity tracking with expiry dates
- **Dependencies:** Payment module, Admin module for CRUD

### 5.4 Free Prompts Module
- **Files:** `src/pages/FreePrompts.tsx`, `src/pages/FreePromptDetail.tsx`, `src/components/free-prompt/FreePromptVideoCard.tsx`, `src/components/free-prompt/MediaRenderer.tsx`, `src/types/free-prompt.ts`
- **Responsibility:** Browse and copy free prompt templates
- **Key Features:**
  - Prompt listing with category and tag filtering
  - Copy-to-clipboard with copy count tracking
  - Image and video prompt type support
  - View count analytics

### 5.5 Payment Module
- **Files:** `src/pages/Pay.tsx`, `src/components/payment/PaymentModal.tsx`, `src/components/payment/ConfirmInfoDialog.tsx`
- **Edge Functions:** `create-payment`, `check-payment`, `sepay-webhook`
- **Responsibility:** Handle payment creation, bank transfer verification, order completion
- **Payment Flow:**
  1. Frontend calls `create-payment` → generates unique payment code (DH + 8 digits)
  2. Displays bank transfer info (BIDV account) + QR code + 15-minute countdown
  3. Frontend polls `check-payment` every 10 seconds
  4. Sepay webhook auto-confirms when bank transfer detected
  5. Creates purchase record + commissions + sends confirmation email
- **Key Features:**
  - Server-side price validation (prevents client-side manipulation)
  - Discount code system (percentage or fixed, with usage limits)
  - Invoice support (personal or company)
  - AI account reservation during payment window
  - Confetti animation on successful purchase
- **Dependencies:** Sepay integration, Resend email, Commission module

### 5.6 Flash Sale Module
- **Files:** `src/hooks/useFlashSalePrice.tsx`, `src/components/gem/FlashSaleGemsSection.tsx`
- **Responsibility:** Time-limited promotional pricing for gems and AI tools
- **Key Functions:**
  - `useFlashSalePrice(itemType, itemId, originalPrice)` — Real-time sale price calculation
  - Campaign management with start/end dates
  - Custom discount per item or campaign-wide default
- **Database:** `flash_sale_campaigns`, `flash_sale_items` tables

### 5.7 Referral & Affiliate Module
- **Files:** `src/hooks/useReferral.tsx`, `src/hooks/useSaleAffiliate.ts`, `src/pages/Referral.tsx`, `src/pages/AffiliateLanding.tsx`, `src/components/referral/WithdrawalForm.tsx`, `src/components/referral/WithdrawalHistory.tsx`
- **Responsibility:** Referral code generation, click tracking, commission calculation, withdrawal requests
- **Key Features:**
  - Unique referral code generation via RPC
  - Click tracking with source detection (Facebook, Zalo, TikTok, etc.)
  - Commission rates from `commission_settings` table (default: gem 20%, AI tool 10%, premium 10%)
  - 30-day rolling stats with daily breakdowns
  - Withdrawal request system with bank details
- **Database:** `referrals`, `referral_uses`, `referral_clicks` tables

### 5.8 Tracking & Analytics Module
- **Files:** `src/hooks/useConversionTracking.ts`, `src/hooks/usePixelTracking.tsx`, `src/hooks/usePageTracking.ts`, `src/hooks/useGemClickTracking.tsx`, `src/hooks/usePremiumTracking.ts`
- **Edge Function:** `fb-conversions-api`
- **Responsibility:** Multi-platform event tracking, attribution, and analytics
- **Key Features:**
  - **Client-side pixels:** Facebook, Google Tag Manager, TikTok — injected dynamically from DB config
  - **Server-side CAPI:** Facebook Conversions API with PII hashing (SHA-256)
  - **Attribution model:** First-touch (localStorage) + last-touch (sessionStorage)
  - **UTM parameter capture:** Source, medium, campaign, content, term + gclid, fbclid
  - **Event batching:** Non-critical events batch every 30 seconds; purchase events flush immediately
  - **Conversion events:** Configurable mapping table (`conversion_events`) for cross-platform event names
- **Database:** `tracking_events`, `tracking_pixels`, `conversion_events`, `conversion_logs`, `page_views`, `order_attributions`, `gem_clicks`

### 5.9 Commission & Withdrawal Module
- **Files:** `src/hooks/useWithdrawal.tsx`, `src/components/shared/WithdrawalFormShared.tsx`, `src/components/shared/WithdrawalHistoryShared.tsx`
- **Edge Functions:** `create-bigman-withdrawal`, `approve-bigman-withdrawal`, `mark-commissions-paid` (deprecated)
- **Responsibility:** Staff and sale staff commission tracking, withdrawal request processing
- **Commission Types:**
  - **Staff commissions:** Earned from content creation, paid per sale
  - **Sale staff commissions:** Earned from affiliate-driven sales, configurable rate
  - **Referral commissions:** Earned from referral program
- **Withdrawal Flow:** Staff submits → admin reviews → BigMan system processes → balance deducted

### 5.10 Email & Newsletter Module
- **Edge Functions:** `send-email`, `send-newsletter`
- **Responsibility:** Transactional and marketing emails
- **Email Types:**
  - `welcome` — New user registration
  - `purchase_confirmation` — Generic purchase
  - `gem_purchase_confirmation` — Gem-specific
  - `ai_account_delivery` — AI account credentials
  - `subscription_confirmation` — Premium subscription
  - `creator_sale_notification` — Notify creator of sale
  - `warranty_approved` / `warranty_rejected` — Warranty status
  - `partner_welcome` — New partner onboarding
- **Newsletter:** Bulk send to all active subscribers with campaign tracking

### 5.11 Admin Dashboard Module
- **Files:** 29 pages under `src/pages/admin/`, components under `src/components/admin/`
- **Layout:** `AdminLayout.tsx` with 8-group collapsible sidebar
- **Admin Features:**
  - Dashboard overview with stats
  - Product management (Gems, Free Prompts, AI Tools, AI Accounts, Categories)
  - Order management with manual approval
  - User management with bulk actions, filters, detail views
  - Revenue analytics with charts, top products, customer segments
  - Commission management (staff, sale staff)
  - Flash sale & discount code management
  - Email marketing campaigns
  - UTM campaign tracking & traffic analytics
  - Operating costs tracking
  - Application review (creator/staff/sale applications)
  - Warranty request processing
  - Site settings management

### 5.12 Staff Dashboard Module
- **Files:** 9 pages under `src/pages/staff/`, `src/components/staff/StaffLayout.tsx`
- **Features:** Stats, order management, gem/free prompt creation, AI tool/account management, warranty processing, earnings & withdrawal

### 5.13 Sale Staff Dashboard Module
- **Files:** 5 pages under `src/pages/sale/`, `src/components/sale/SaleLayout.tsx`
- **Features:** Sales dashboard, customer CRM notes, affiliate link management, commission tracking, profile management

### 5.14 SEO Module
- **Files:** `src/components/seo/SEOHead.tsx`, `public/robots.txt`, `public/sitemap.xml`
- **Responsibility:** Search engine optimization
- **Features:**
  - Dynamic meta tags (title, description, OG, Twitter Card)
  - JSON-LD structured data (Product, Website, Organization, Breadcrumb schemas)
  - Canonical URLs
  - robots.txt and sitemap
- **Site Name:** "Mẫu Làm Video"

### 5.15 Auto-Review Workflow
- **Edge Functions:** `auto-review-workflow`, `generate-tool-review`
- **Responsibility:** Automatically discover trending AI tools and generate reviews
- **Process:**
  1. Uses KIE AI (Claude) to discover trending tools
  2. Researches each tool via AI
  3. Generates logo & gallery images via KIE Image API
  4. Validates YouTube demo videos
  5. Uploads assets to Supabase Storage
  6. Publishes reviews automatically

### 5.16 Partner/Reseller Module
- **Files:** `src/hooks/usePartnerMode.tsx`
- **Database:** `partners`, `partner_orders`, `partner_products`, `partner_wallet_transactions`
- **Responsibility:** White-label reseller system with custom pricing, revenue sharing, and wallet management

---

## 6. Database / Data Layer

### Database
- **Engine:** PostgreSQL (via Supabase)
- **ORM/Query Tool:** Supabase JS Client (PostgREST REST API + direct SQL in Edge Functions)
- **Type Generation:** Auto-generated types in `src/integrations/supabase/types.ts`

### Schema Overview (40+ Tables)

#### Core Product Tables
| Table | Description | Key Columns |
|-------|-------------|-------------|
| `gems` | Chatbot prompts, workflows, apps | title, slug, price, cost_price, product_type, is_flash_sale, tutorial_steps, workflow_link |
| `prompts` | Legacy prompt records | title, slug, price, is_premium, category_id, ai_tool_id |
| `ai_tools` | AI tool listings & reviews | name, slug, account_price, features[], review_content, is_featured |
| `ai_tool_accounts` | Shared AI account inventory | credentials, status (available/reserved/sold/expired), max_quantity, expires_at |
| `free_prompts` | Free template prompts | title, slug, prompt_text, prompt_type, copy_count, view_count |
| `categories` | Product categories | name, slug, description, icon |
| `ai_reviews` | Auto-generated AI tool reviews | name, slug, review_content, features[], is_published |

#### User & Auth Tables
| Table | Description | Key Columns |
|-------|-------------|-------------|
| `profiles` | User profiles (extends auth.users) | email, full_name, phone_number, is_premium, premium_expires_at, bank info |
| `user_roles` | Role assignments | user_id, role (app_role enum: admin, user) |
| `user_subscriptions` | Subscription tracking | user_id, plan_id, status, current_period_start/end |
| `subscription_plans` | Available plans | name, price_monthly, price_yearly, features[] |
| `bookmarks` | User bookmarks | user_id, item_type, item_id |
| `ratings` | Product ratings | user_id, prompt_id, rating |
| `comments` | Product comments | user_id, prompt_id, content, is_approved |

#### Purchase & Payment Tables
| Table | Description | Key Columns |
|-------|-------------|-------------|
| `pending_payments` | Active payment sessions | type, amount, payment_content, status, expires_at, UTM/ad tracking fields |
| `gem_purchases` | Completed gem purchases | user_id, gem_id, amount, status, sale_code, delivery_email |
| `ai_account_purchases` | Completed AI account purchases | user_id, ai_tool_id, account_id, amount, expires_at |
| `purchases` | Legacy prompt purchases | user_id, prompt_id, amount, stripe_payment_intent_id |
| `discount_codes` | Promotional codes | code, discount_type, discount_value, max_uses, applies_to |
| `discount_code_uses` | Code usage tracking | discount_code_id, user_id, order_id, discount_amount |

#### Commission & Affiliate Tables
| Table | Description | Key Columns |
|-------|-------------|-------------|
| `staff_commissions` | Staff earnings per sale | staff_id, amount, commission_rate, status, purchase references |
| `sale_commissions` | Sale staff earnings | sale_staff_id, order_id, order_type, commission_amount |
| `sale_staff_profiles` | Sale staff settings | user_id, sale_code, commission_rate, available_balance, total_earnings |
| `sale_affiliate_clicks` | Affiliate click tracking | sale_code, session_id, product_id, converted |
| `sale_customer_notes` | CRM notes | sale_staff_id, customer_email, note, tag |
| `sale_withdrawal_requests` | Sale staff withdrawals | sale_staff_id, amount, status, bank details |
| `withdrawal_requests` | Staff withdrawals | user_id, amount, status, bank details, processed_by |
| `referrals` | Referral program records | referrer_id, referral_code, total_earnings, available_balance |
| `referral_uses` | Referral conversion tracking | referral_id, referred_user_id, commission_amount |
| `referral_clicks` | Referral click tracking | referral_code, source, device_type, converted |

#### Tracking & Analytics Tables
| Table | Description | Key Columns |
|-------|-------------|-------------|
| `tracking_events` | Funnel event log | session_id, event_type, page_path, product_*, revenue, UTM fields |
| `tracking_pixels` | Pixel configuration | pixel_type (facebook/google/tiktok), pixel_id, access_token |
| `conversion_events` | Cross-platform event mapping | event_name, fb/google/tiktok event names, trigger_config |
| `conversion_logs` | CAPI call logs | event_name, platform, status, request/response data |
| `page_views` | Page view analytics | session_id, path, duration, device_type, referrer data |
| `order_attributions` | Multi-touch attribution | first_touch + last_touch UTM fields, order details |
| `gem_clicks` | Product click tracking | gem_id, session_id, referrer, ip_hash |
| `utm_campaigns` | UTM campaign management | name, base_url, UTM params, ad_spend |

#### Other Tables
| Table | Description |
|-------|-------------|
| `flash_sale_campaigns` | Promotional campaign management |
| `flash_sale_items` | Items in flash sale campaigns |
| `email_logs` | Email delivery tracking |
| `email_campaigns` | Newsletter campaign management |
| `newsletter_subscribers` | Email subscriber list |
| `applications` | Creator/staff/sale applications |
| `custom_gem_requests` | Custom prompt requests |
| `warranty_requests` | Post-purchase warranty claims |
| `partners` | Reseller/partner accounts |
| `partner_orders` / `partner_products` / `partner_wallet_transactions` | Partner ecosystem |
| `site_settings` / `commission_settings` | System configuration |
| `operating_costs` / `ai_supplier_payments` | Financial tracking |
| `tool_updates` | AI tool version history |
| `webhook_configs` | External webhook configuration |

### Key Relationships
- `gems.category_id` → `categories.id`
- `gems.linked_ai_tool_id` → `ai_tools.id`
- `gem_purchases.gem_id` → `gems.id`
- `gem_purchases.user_id` → `profiles.id`
- `ai_tool_accounts.ai_tool_id` → `ai_tools.id`
- `ai_account_purchases.account_id` → `ai_tool_accounts.id`
- `staff_commissions.staff_id` → `profiles.id`
- `sale_commissions.sale_staff_id` → `sale_staff_profiles.id`
- `sale_staff_profiles.user_id` → `profiles.id` (1-to-1)
- `referral_uses.referral_id` → `referrals.id`
- `pending_payments.user_id` → `profiles.id`
- `bookmarks.user_id` → `profiles.id`
- `flash_sale_items.campaign_id` → `flash_sale_campaigns.id`

### Migrations Status
- **Total migrations:** 121 files
- **Date range:** January 5, 2026 → April 14, 2026
- **Latest migration:** `20260414095011_44c56fed-ad51-467c-a82e-1e17bb06c757.sql`
- **Status:** Actively evolving — frequent schema changes (sometimes multiple per day)

### Seed Data
- No explicit seed files found. Data appears to be managed through the admin dashboard UI.

---

## 7. API / Interface Layer

### Supabase Edge Functions (Serverless API)

#### Payment Functions

| Function | Method | Path | Auth | Description |
|----------|--------|------|------|-------------|
| `create-payment` | POST | `/functions/v1/create-payment` | Bearer token (user) | Create pending payment, validate price, reserve AI accounts, generate payment code |
| `check-payment` | POST | `/functions/v1/check-payment` | None | Check payment status, handle expiry cleanup |
| `sepay-webhook` | POST | `/functions/v1/sepay-webhook` | None (Sepay signature) | Process bank transfer webhook, create purchases, send emails, fire pixels |

#### Order Management

| Function | Method | Path | Auth | Description |
|----------|--------|------|------|-------------|
| `approve-order` | POST | `/functions/v1/approve-order` | Bearer token (admin) | Manually approve orders, send emails, create commissions |

#### Commission & Withdrawal (BigMan Integration)

| Function | Method | Path | Auth | Description |
|----------|--------|------|------|-------------|
| `bigman-revenue-api` | GET | `/functions/v1/bigman-revenue-api` | x-api-key | Revenue analytics: summary, chart, top products, commissions |
| `create-bigman-withdrawal` | POST | `/functions/v1/create-bigman-withdrawal` | x-api-key | Create or cancel withdrawal requests |
| `approve-bigman-withdrawal` | POST | `/functions/v1/approve-bigman-withdrawal` | x-api-key | Process withdrawal approvals |
| `mark-commissions-paid` | POST | `/functions/v1/mark-commissions-paid` | x-api-key | **DEPRECATED** — returns 410 Gone |

#### Email Functions

| Function | Method | Path | Auth | Description |
|----------|--------|------|------|-------------|
| `send-email` | POST | `/functions/v1/send-email` | None (internal) | Send transactional emails (welcome, purchase, warranty, etc.) |
| `send-newsletter` | POST | `/functions/v1/send-newsletter` | Bearer token (admin) | Bulk send newsletter to subscribers |

#### Analytics & Tracking

| Function | Method | Path | Auth | Description |
|----------|--------|------|------|-------------|
| `fb-conversions-api` | POST | `/functions/v1/fb-conversions-api` | None | Fire Facebook server-side conversion events (CAPI v21.0) |

#### Content Generation

| Function | Method | Path | Auth | Description |
|----------|--------|------|------|-------------|
| `auto-review-workflow` | POST | `/functions/v1/auto-review-workflow` | Service role | Discover trending AI tools, generate reviews with AI |
| `generate-tool-review` | POST | `/functions/v1/generate-tool-review` | Service role | Generate individual tool review |

#### Data Management

| Function | Method | Path | Auth | Description |
|----------|--------|------|------|-------------|
| `cleanup-expired-reservations` | POST | `/functions/v1/cleanup-expired-reservations` | Service role | Cron: expire pending payments & AI accounts |
| `crm-data-export` | GET | `/functions/v1/crm-data-export` | x-crm-secret | Export customers/orders for CRM systems |

### External Integrations

| Integration | Type | Purpose |
|-------------|------|---------|
| **Sepay** | Webhook (incoming) | Bank transfer payment confirmation |
| **Resend** | REST API (outgoing) | Transactional email delivery |
| **Facebook CAPI** | REST API (outgoing) | Server-side conversion tracking |
| **KIE AI API** | REST API (outgoing) | AI content & image generation |
| **CRM Webhook** | Webhook (outgoing) | Customer data push on purchase |
| **BigMan System** | REST API (bidirectional) | Staff/withdrawal management |

### Client-Side Data Access
All database reads from the frontend go through **Supabase PostgREST** (auto-generated REST API from PostgreSQL schema), using the Supabase JS client with RLS policies for access control.

---

## 8. Environment & Configuration

### Required Environment Variables

#### Frontend (Vite — `VITE_` prefix)
| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier |

#### Backend (Supabase Edge Functions — set via Supabase dashboard)
| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL (auto-injected) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (auto-injected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (elevated privileges) |
| `RESEND_API_KEY` | Resend email service API key |
| `BIGMAN_API_KEY` | BigMan internal system API key |
| `KIE_API_KEY` | KIE AI content generation API key |

#### Other (referenced in .env)
| Variable | Purpose |
|----------|---------|
| `SUPABASE_PUBLISHABLE_KEY` | Non-Vite prefixed duplicate of anon key |

### Config Files

| File | Structure / Purpose |
|------|---------------------|
| `vite.config.ts` | Dev server port (8080), path aliases, manual chunks for vendor splitting |
| `tailwind.config.ts` | Custom theme: fonts (DM Sans, Playfair Display), premium/success/sidebar colors, 10+ custom animations |
| `tsconfig.json` | Project references, path mapping (`@/` → `./src/`), relaxed strict mode |
| `components.json` | shadcn/ui: default style, slate base, CSS variables enabled |
| `supabase/config.toml` | Project ID, JWT verification per function (13 of 15 functions have `verify_jwt = false`) |

### Feature Flags / Toggles
- **Database-driven:** `site_settings` table (key-value pairs)
- **Flash sales:** `flash_sale_campaigns.is_active` flag
- **Conversion events:** `conversion_events.is_active` flag
- **Tracking pixels:** `tracking_pixels.is_active` flag
- **Discount codes:** `discount_codes.is_active` + date-based activation
- **Partner features:** `partners.features_config` JSON field
- **AI tool featuring:** `ai_tools.is_featured` flag

---

## 9. Known Issues & Bugs

### TODO Comments

| File | Line | Comment |
|------|------|---------|
| `src/components/admin/revenue/ExportButton.tsx` | 52 | `// TODO: Export real traffic data when page_views table exists` |
| `src/pages/admin/AdminRevenue.tsx` | 478 | `// TODO: connect to real data` |
| `src/pages/admin/AdminRevenue.tsx` | 479 | `// TODO: connect to real data` |

No FIXME, HACK, BUG, or TEMP comments were found.

### Code Smells & Anti-Patterns

1. **Committed `.env` file with secrets:** The `.env` file is tracked in git and contains Supabase anon keys and project URLs. While anon keys are public by design, committing `.env` files is a bad practice — it encourages accidental secret leakage. **Fix:** Add `.env` to `.gitignore`, create `.env.example` with placeholder values.

2. **Relaxed TypeScript strictness:** `noImplicitAny: false` and `strictNullChecks: false` in `tsconfig.json` — reduces type safety and can lead to runtime errors.

3. **13 of 15 Edge Functions have `verify_jwt = false`:** Most serverless functions do not verify JWT tokens, relying on custom auth (API keys or internal-only usage). This is acceptable for webhooks but concerning for functions like `send-email` and `fb-conversions-api` that could be called directly.

4. **Deprecated function still deployed:** `mark-commissions-paid` returns 410 Gone — should be removed from deployment.

5. **No `.env.example` file:** New developers have no template for required environment variables.

6. **Large component files:** `GemDetail.tsx` is 600+ lines — could benefit from decomposition into sub-components.

7. **Inconsistent naming conventions:** Mix of `kebab-case` (hooks like `use-mobile.tsx`) and `camelCase` (`useAuth.tsx`) for hook files.

8. **`unused-vars` ESLint rule disabled:** `@typescript-eslint/no-unused-vars` is turned off, allowing dead code to accumulate.

### Error Handling Gaps

1. **Payment webhook (`sepay-webhook`):** Extremely complex function handling multiple entity types — a failure in commission creation could leave the purchase record created but commissions missing.
2. **No retry mechanism** for failed email sends or failed Facebook CAPI calls.
3. **`send-email` function has no auth:** Any caller can send arbitrary emails — should be restricted to internal calls.

---

## 10. Test Coverage

### Test Files
**None found.** No `*.test.*`, `*.spec.*`, or `__tests__/` directories exist anywhere in the project.

### Testing Strategy
**No testing strategy is implemented.** The project has:
- No test framework dependency (no Jest, Vitest, Cypress, Playwright, etc.)
- No test scripts in `package.json`
- No test configuration files

### Approximate Coverage
**0%** — No automated tests exist.

### Missing Test Areas (Critical)
1. **Payment flow** — `create-payment` → `sepay-webhook` → purchase creation is the most critical business logic with zero test coverage
2. **Commission calculations** — Staff, sale staff, and referral commissions involve complex rate calculations
3. **Discount code validation** — Edge cases (expired codes, usage limits, minimum amounts)
4. **Flash sale pricing** — Time-based price calculations
5. **Authentication & authorization** — Role-based access control
6. **Edge Functions** — Server-side business logic
7. **Component rendering** — No component tests for any of the 109 components

---

## 11. Dependencies & Security

### Production Dependencies (34 packages)

| Package | Version | Status |
|---------|---------|--------|
| `@hookform/resolvers` | ^3.10.0 | Current |
| `@lovable.dev/cloud-auth-js` | ^1.0.0 | Platform-specific |
| `@radix-ui/react-*` (20 packages) | Various | Current |
| `@supabase/supabase-js` | ^2.89.0 | Current |
| `@tanstack/react-query` | ^5.83.0 | Current |
| `canvas-confetti` | ^1.9.4 | Current |
| `class-variance-authority` | ^0.7.1 | Current |
| `clsx` | ^2.1.1 | Current |
| `cmdk` | ^1.1.1 | Current |
| `date-fns` | ^3.6.0 | Current |
| `embla-carousel-react` | ^8.6.0 | Current |
| `framer-motion` | ^12.27.1 | Current |
| `gsap` | ^3.14.2 | Current |
| `input-otp` | ^1.4.2 | Current |
| `lucide-react` | ^0.462.0 | Current |
| `next-themes` | ^0.3.0 | Current |
| `react` | ^18.3.1 | Current |
| `react-dom` | ^18.3.1 | Current |
| `react-day-picker` | ^8.10.1 | Current |
| `react-helmet-async` | ^2.0.5 | Current |
| `react-hook-form` | ^7.61.1 | Current |
| `react-markdown` | ^10.1.0 | Current |
| `react-resizable-panels` | ^2.1.9 | Current |
| `react-router-dom` | ^6.30.1 | Current |
| `recharts` | ^2.15.4 | Current |
| `sonner` | ^1.7.4 | Current |
| `tailwind-merge` | ^2.6.0 | Current |
| `tailwindcss-animate` | ^1.0.7 | Current |
| `vaul` | ^0.9.9 | Current |
| `zod` | ^3.25.76 | Current |

### Dev Dependencies (12 packages)

| Package | Version |
|---------|---------|
| `@eslint/js` | ^9.32.0 |
| `@tailwindcss/typography` | ^0.5.16 |
| `@types/node` | ^22.16.5 |
| `@types/react` | ^18.3.23 |
| `@types/react-dom` | ^18.3.7 |
| `@vitejs/plugin-react-swc` | ^3.11.0 |
| `autoprefixer` | ^10.4.21 |
| `eslint` | ^9.32.0 |
| `eslint-plugin-react-hooks` | ^5.2.0 |
| `eslint-plugin-react-refresh` | ^0.4.20 |
| `globals` | ^15.15.0 |
| `lovable-tagger` | ^1.1.13 |
| `postcss` | ^8.5.6 |
| `tailwindcss` | ^3.4.17 |
| `typescript` | ^5.8.3 |
| `typescript-eslint` | ^8.38.0 |
| `vite` | ^5.4.19 |

### Security Concerns

1. **`.env` file committed to git** — Contains Supabase anon keys and project URLs. While anon keys are designed to be public, this practice risks accidental leakage of future secrets. **Severity: Medium**

2. **Most Edge Functions lack JWT verification** — 13 of 15 functions have `verify_jwt = false`. Functions like `send-email` can be called by anyone who knows the endpoint URL. **Severity: High**

3. **`crm-data-export` uses hardcoded secret** — The CRM export function validates against a static `x-crm-secret` header rather than proper auth. **Severity: Medium**

4. **No rate limiting** — `send-newsletter` sends to all subscribers in parallel with no rate limiting, risking email service quota exhaustion. **Severity: Low-Medium**

5. **No CSP headers configured** — No Content Security Policy headers detected, increasing XSS risk. **Severity: Low**

6. **Sensitive data in payment flow** — `ai_tool_accounts.credentials` column stores AI account credentials. Access control relies entirely on RLS policies. **Severity: Medium**

7. **IP address fetched from public API** — `usePixelTracking.tsx` calls `https://api.ipify.org` to get client IP for Facebook CAPI, exposing user IPs to a third-party service. **Severity: Low**

---

## 12. Performance Considerations

### Optimizations Already In Place

1. **Code splitting (Vite manual chunks):**
   - `vendor-supabase` — Supabase SDK isolated
   - `vendor-gsap` — GSAP animation library isolated
   - `vendor-framer` — Framer Motion isolated
   - `vendor-recharts` — Recharts library isolated
   - `vendor-markdown` — React Markdown isolated

2. **Font preloading:** Critical fonts (Inter, DM Sans) preloaded in `index.html` with `font-display: swap` and fallback `size-adjust` definitions to prevent CLS.

3. **Lazy loading:** Homepage sections use `React.lazy()` with custom skeleton fallbacks.

4. **React Query caching:** Home data uses 5-minute staleTime and 10-minute garbage collection.

5. **Event batching:** Tracking events batch every 30 seconds instead of firing per-event.

6. **Intersection Observer:** `GemCard` uses intersection observer for video autoplay.

7. **Memoization:** `GemCard` wrapped in `React.memo()` for render optimization.

### Potential Bottlenecks

1. **`useHomeGems()` client-side filtering:** Fetches 20 gems then filters into 3 categories client-side. This could be done server-side to reduce payload when the catalog grows.

2. **No pagination on admin tables:** Several admin pages may load large datasets without server-side pagination.

3. **Newsletter bulk send:** `send-newsletter` sends to all subscribers in parallel — could timeout or exhaust Resend API limits for large subscriber lists.

4. **`sepay-webhook` complexity:** Single function handles purchase creation, commission creation, email sending, CRM webhook, and pixel firing — a slow email send blocks the entire webhook response.

5. **No image optimization pipeline:** Images are uploaded directly to Supabase Storage without resizing, compression, or WebP conversion.

### Caching Strategies
- **React Query:** Server state caching with configurable stale times (1-10 minutes)
- **sessionStorage:** Pixel configs and attribution data cached per session
- **localStorage:** First-touch attribution data persisted across sessions

### Database Query Concerns
- Client uses Supabase PostgREST — queries are translated to SQL automatically. No obvious N+1 issues in the codebase, but complex admin analytics pages may generate heavy aggregation queries.

---

## 13. Deployment & Infrastructure

### Build Process
```bash
npm run build     # Production build (vite build)
npm run build:dev # Development build (vite build --mode development)
```

### Hosting Platform
- **Frontend:** Lovable.dev platform (detected from README, `@lovable.dev/cloud-auth-js`, and `lovable-tagger`)
- **Backend:** Supabase Cloud (project ID: `hsoltwjmhpkvixiwilso`)
- **Edge Functions:** Supabase Edge Functions (Deno runtime, deployed via Supabase CLI)

### Docker / Container Setup
**N/A** — No Docker or container configuration exists. The app is deployed directly to Lovable.dev (frontend) and Supabase Cloud (backend).

### Environment Differences
- **Development:** `npm run dev` starts Vite dev server on port 8080 with `componentTagger()` plugin enabled
- **Production:** `npm run build` creates optimized bundle; `lovable-tagger` is disabled
- No staging environment detected

### Infrastructure Diagram
```
┌──────────────────┐    ┌─────────────────────┐
│   Lovable.dev    │    │   Supabase Cloud     │
│   (Frontend CDN) │    │                      │
│                  │◄──►│ - PostgreSQL          │
│  - Static SPA   │    │ - Auth                │
│  - Auto-deploy  │    │ - Edge Functions (15) │
│    from git push │    │ - Storage (images)    │
└──────────────────┘    └─────────────────────┘
```

---

## 14. Recent Changes

### Git History
**Unable to retrieve** — Git CLI not available in the current environment. The `.git` directory is present, indicating the project is under version control.

### Migration History (Latest Changes)
Based on migration file dates, recent database changes include:

| Date | Migration |
|------|-----------|
| Apr 14, 2026 | `20260414095011` — Latest migration |
| Apr 7, 2026 | `20260407084249` |
| Apr 6, 2026 | `20260406100104` |
| Apr 4, 2026 | `20260404023239`, `20260404023700` |
| Apr 3, 2026 | `20260403042848`, `20260403095115` |
| Apr 2, 2026 | `20260402000001` — Added bulk account and click count functions |
| Mar 31, 2026 | `20260331141200` — Added `sort_order` to `ai_tools` |

### Current Branch
Unknown (Git CLI not available).

---

## 15. Quick Start Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **Bun** or **npm** package manager (project uses `bun.lockb`)

### Install Dependencies
```bash
# Using npm
npm install

# Using Bun (preferred based on lockfile)
bun install
```

### Run in Development Mode
```bash
npm run dev
# or
bun run dev
```
The dev server starts at `http://localhost:8080` with hot module replacement.

### Environment Setup
Create a `.env` file with the following variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Run Linter
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```
Output is generated in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Run Tests
**N/A** — No test framework is configured. No test scripts exist.

### Supabase Edge Functions (Local Development)
```bash
# Install Supabase CLI
npx supabase start           # Start local Supabase
npx supabase functions serve  # Serve edge functions locally
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total source files | ~200+ |
| React components | 109 |
| Page components | 67 |
| Routes | 66 |
| Custom hooks | 17 |
| Supabase Edge Functions | 15 (1 deprecated) |
| Database tables | 40+ |
| Database migrations | 121 |
| Production dependencies | 34 |
| Dev dependencies | 12 |
| Test files | 0 |
| TODO comments | 3 |
| Lines of code (estimated) | ~30,000+ |

---

*Report generated by automated codebase analysis on April 16, 2026.*
