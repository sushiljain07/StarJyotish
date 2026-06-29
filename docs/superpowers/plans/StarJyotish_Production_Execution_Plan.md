# Star Jyotish Production Execution Plan

## Phase 0 -- Project Audit & Stabilization (2--3 days)

**Goal:** Ensure the project is clean before adding features.

### Tasks

-   Review entire codebase
-   Detect dead code
-   Remove unused components
-   Identify duplicate logic
-   Review folder structure
-   Review API endpoints
-   Review environment variables
-   Review dependencies
-   Run security audit
-   Run npm audit
-   Run pip audit
-   Create technical debt report

### Claude Prompt

> Review the entire Star Jyotish project as a Senior Software Architect.
> Do not add any new features yet. Audit the complete codebase for
> architecture, maintainability, code duplication, security issues,
> dependency problems, unused components, dead code, API
> inconsistencies, naming conventions, environment configuration,
> performance bottlenecks, and technical debt. Produce a categorized
> report with High, Medium, and Low priority findings. Then refactor
> only the safe issues without changing application behavior. Ensure the
> project builds successfully after every change. Document every
> modified file and explain why it was changed.

## Phase 1 -- Production Readiness (Week 1)

Tasks: Privacy Policy, Terms, Refund Policy, About, Contact, FAQ,
Footer, SEO, robots.txt, sitemap.xml, Open Graph, Mobile responsiveness.

### Claude Prompt

> Implement every Phase 1 recommendation from the Product Audit
> document. Treat these as production-ready requirements. Review the
> existing implementation before making changes. Reuse components
> wherever possible. Maintain the existing UI and design language.
> Implement legal pages, footer links, SEO using react-helmet-async,
> robots.txt, sitemap.xml, canonical URLs, Open Graph metadata,
> standalone About, Contact and FAQ pages, and fix all responsive layout
> issues without redesigning the application. Verify responsiveness on
> 320px, 375px, 768px, 1024px and desktop. Produce a deployment
> checklist and regression test report before marking the phase
> complete.

## Phase 2 -- Database Foundation

Tasks: PostgreSQL, SQLAlchemy, Alembic, User model, Birth chart model,
Reports, Transactions, Settings.

### Claude Prompt

> Design and implement a production-grade PostgreSQL database
> architecture for Star Jyotish using SQLAlchemy and Alembic. Create
> normalized schemas for Users, Birth Profiles, AI Reports,
> Transactions, Purchases, Notifications, Sessions, Astrologers,
> Bookings, Wallets, Reviews, and Application Settings. Generate
> migrations, indexes, foreign keys, constraints, seed data, and
> repository patterns. Refactor the backend to use the new persistence
> layer while preserving existing API behavior.

## Phase 3 -- Authentication

Tasks: Login, Signup, OTP, Google Login, Session Management.

### Claude Prompt

> Implement a secure authentication system for Star Jyotish using phone
> OTP as the primary login method and Google OAuth as an optional login
> method. Build production-ready authentication with JWT, refresh
> tokens, session expiration, account management, passwordless login,
> user profile management, logout, protected routes, backend
> authorization middleware, and frontend authentication context.

## Phase 4 -- User Dashboard

Tasks: Saved Kundlis, Saved Reports, History, Profile, Preferences.

### Claude Prompt

> Build a complete authenticated customer dashboard that allows users to
> manage their saved birth charts, AI reports, consultation history,
> account settings, language preferences, purchases, notifications, and
> subscriptions.

## Phase 5 -- Payments

Tasks: Razorpay, Webhooks, Premium Access, Subscription, Invoice,
Payment History.

### Claude Prompt

> Replace the existing placeholder payment flow with a production-ready
> Razorpay integration. Implement secure checkout, payment verification,
> webhook handling, purchase records, premium entitlement management,
> subscription support, invoice generation, payment history, refund
> handling, and graceful failure recovery. Refactor hasPremiumAccess()
> to use database-driven entitlements.

## Phase 6 -- WhatsApp Integration

Tasks: Meta Business API, Templates, Report Delivery, Notifications.

### Claude Prompt

> Integrate the Meta WhatsApp Business Cloud API into Star Jyotish.
> Implement WhatsApp-based OTP delivery, AI report delivery,
> consultation reminders, booking confirmations, payment notifications,
> and user engagement campaigns.

## Phase 7 -- AI Improvements

Tasks: AI Memory, Explain Like I'm 5, Sources Used, Confidence Score,
Better Prompt Engineering.

### Claude Prompt

> Enhance the AI experience by implementing explainability,
> transparency, and personalization. Display knowledge sources used for
> AI responses, introduce confidence scores, add an Explain Like I'm 5
> mode, personalize follow-up conversations, and improve prompt
> engineering.

## Phase 8 -- Astrologer Marketplace

Tasks: Onboarding, KYC, Dashboard, Pricing, Availability.

### Claude Prompt

> Build a production-grade astrologer marketplace including onboarding,
> KYC verification, profile management, pricing, scheduling, ratings,
> earnings dashboard, payout management, appointment booking, and
> approval workflows.

## Phase 9 -- Chat / Audio / Video

Tasks: Chat, Voice, Video, Session Notes.

### Claude Prompt

> Implement secure real-time chat, audio, and video consultations using
> 100ms or Agora with appointment scheduling, chat history, timers,
> quality monitoring, and feedback.

## Phase 10 -- Admin Portal

Tasks: User Management, Reports, Analytics, Refunds, Astrologer
Approval.

### Claude Prompt

> Build a complete administrator portal with dashboards for users,
> astrologers, bookings, payments, refunds, analytics, moderation, and
> role-based access.

## Phase 11 -- E-Commerce

Tasks: Gemstone Store, Rudraksha, Cart, Orders, Shipping.

### Claude Prompt

> Build a complete e-commerce module for gemstones and spiritual
> products with inventory, recommendations, shopping cart, checkout,
> shipping, orders, and reviews.

## Phase 12 -- SEO & Content

Tasks: Blog, Dynamic Sitemap, Schema.org, JSON-LD.

### Claude Prompt

> Transform Star Jyotish into an SEO-first platform by implementing a
> blog engine, dynamic sitemap, structured data, FAQ schema,
> Organization schema, Article schema, breadcrumb schema, and optimized
> metadata.

## Phase 13 -- Growth

Tasks: Referral, Coupons, Wallet, Rewards.

### Claude Prompt

> Build referral programs, coupons, wallet credits, loyalty rewards,
> affiliate tracking, promotional campaigns, onboarding incentives, and
> engagement automation.

## Phase 14 -- Production Hardening

Tasks: Redis, Logging, Monitoring, Caching, CI/CD.

### Claude Prompt

> Prepare the application for production at scale with Redis caching,
> distributed rate limiting, centralized logging, monitoring, analytics,
> Docker optimization, CI/CD, backups, disaster recovery, and security
> hardening.

## Phase 15 -- Launch Readiness

Tasks: Play Store, App Store, Legal, Branding, Documentation.

### Claude Prompt

> Conduct a complete production readiness review and prepare Google Play
> Store and Apple App Store assets, legal documentation, deployment
> guides, monitoring dashboards, rollback procedures, and a final launch
> checklist.

# Recommended Execution Order

1.  Project Audit
2.  Production Readiness
3.  Database
4.  Authentication
5.  User Dashboard
6.  Payments
7.  WhatsApp Integration
8.  AI Improvements
9.  Astrologer Marketplace
10. Chat / Audio / Video
11. Admin Portal
12. E-Commerce
13. SEO & Content
14. Growth Features
15. Production Hardening
16. Launch Readiness
