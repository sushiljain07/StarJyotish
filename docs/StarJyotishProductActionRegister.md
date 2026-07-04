# Star Jyotish Product Action Register

> **Version:** 1.0
>
> **Status:** Living Document
>
> **Owner:** Product Team
>
> **Last Updated:** July 2026

---

# Purpose

This document is the single source of truth for the future direction of Star Jyotish.

It captures:

- Product vision
- Architectural decisions
- Pending work
- Technical debt
- Product roadmap
- UX improvements
- Future ideas
- Lessons learned

Every significant product discussion should result in updating this document.

The objective is to ensure that important ideas never get lost in conversations and that implementation always aligns with the long-term vision.

---

# Product Vision

## Mission

Build the world's most trusted **Personal AI-enabled Vedic Astrologer**.

Not a Kundli generator.

Not an astrology content website.

Not merely an AI chatbot.

The birth chart is only the beginning.

The real product is an intelligent guide that grows with the user throughout their life.

---

# Product Philosophy

Star Jyotish should feel like a wise astrologer who knows you personally.

The application should help users:

- understand themselves
- make better life decisions
- continue learning
- discover patterns
- return every day for meaningful guidance

Everything else exists to support this mission.

---

# Guiding Principles

## Product Principles

- Relationship over Reports
- Guidance over Predictions
- Simplicity over Feature Count
- Trust over Marketing
- Personalization over Generic Content

---

## Engineering Principles

- Backend owns business rules.
- Frontend owns presentation.
- Avoid duplicate logic.
- Reuse components.
- Prefer configuration over hardcoding.
- Build reusable foundations before features.
- Design for multiple subscription tiers from Day One.
- Never build premium as a separate application.

---

## UX Principles

Every screen should answer one question:

> "What should this user do next?"

No dead ends.

No isolated pages.

No disconnected experiences.

---

# Current Product Status

## Completed

### Core Platform

- Authentication
- AI Report Generation
- Kundli Generation
- Chart Reading
- Ask AI
- Career Reports
- Relationship Reports
- Wealth Reports

---

### Knowledge Center

Completed

- Knowledge Center Framework
- Learn Landing Page
- Zodiac Landing Page
- Aries Guide
- Learning Path Framework
- Knowledge Graph
- Concept Linking
- Reusable Knowledge Components

---

### Personal Workspace

Completed

- Personal Home
- Login Redirect
- Workspace Navigation
- Profile Onboarding
- Placeholder Home Components

---

### Navigation

Completed

- Header improvements
- Route cleanup
- Dead-end removal
- Auth-aware logo
- Improved breadcrumbs

---

# Long-Term Product Architecture

```
Visitor

↓

Create Account

↓

Create Astrology Profile

↓

Personal Home

↓

Daily Guidance

↓

AI Conversations

↓

Life Journey

↓

Premium Guidance

↓

Lifetime Relationship
```

---

# Priority Levels

## P0

Critical

Must be completed before major feature expansion.

---

## P1

High Priority

Directly improves user experience.

---

## P2

Core Features

---

## P3

Premium Experience

---

## P4

Future Vision

---

# P0 — Product Architecture

---

# SJ-001

## Product Experience Unification

Priority

P0

Status

Planned

### Problem

Landing page and Home feel like two different products.

The product story breaks after login.

### Goal

Create one seamless experience.

### Deliverables

- Unified messaging
- Unified visual language
- Unified onboarding
- Unified navigation philosophy

### Success Criteria

Users should never feel they entered another application after login.

---

# SJ-002

## Information Architecture

Priority

P0

### Current Issues

- Footer disappears after login.
- Knowledge Center becomes inaccessible.
- Navigation changes completely.
- Public and authenticated experiences are disconnected.

### Deliverables

Design one navigation model covering:

- Visitor
- Logged-in User
- Premium User
- Admin

### Principle

Authentication should ADD capabilities.

Never REMOVE navigation.

---

# SJ-003

## Capability Matrix

Priority

P0

Subscription should unlock capabilities.

NOT pages.

Future tiers

Visitor

Free

Basic

Premium

Enterprise (future)

Every feature should define:

- Available
- Limited
- Premium
- Hidden (rare)

---

# SJ-004

## Backend Ownership

Move business intelligence to backend.

Includes

- Recommendations
- Daily Guidance
- Journey Progress
- Entitlements
- Home Aggregation
- Subscription Logic

Frontend should never decide business rules.

---

# SJ-005

## Product Architecture Documentation

Create permanent documentation describing:

- Information Architecture
- User Journey
- Navigation Model
- Capability Matrix
- Frontend Responsibilities
- Backend Responsibilities

This becomes the architectural foundation for future development.

---

# P1 — User Experience

---

# SJ-101

## Landing Page Evolution

Current

Generate My Free Kundli

Future

Meet Your Personal AI Astrologer

### Objective

Shift the message from

Tool

to

Relationship.

---

# SJ-102

## Unified Navigation

Create one navigation system.

Available before and after login.

Suggested primary navigation

- Home
- Learn
- Generate
- Ask Jyoti
- Reports

Secondary

- Profile
- Settings
- Logout

---

# SJ-103

## Footer Redesign

Footer should remain visible after login.

Links

- Knowledge Center
- About
- Contact
- FAQ
- Privacy
- Terms
- Refund

---

# SJ-104

## Astrology Profile

Separate Astrology Profile from User Profile.

Support

- Primary Profile
- Multiple Profiles
- Family Members
- Switch Profile
- Archive Profile

Future backend entity

BirthProfile

---

# SJ-105

## Home Experience

Continue evolving Home.

Avoid creating a dashboard.

Instead build

"My Personal Astrologer"

Features eventually include

- Daily Insight
- Current Dasha
- Active Transits
- Continue Learning
- AI Suggestions
- Recent Activity
- Saved Reports

---

# SJ-106

## First-Time User Journey

Design onboarding.

Flow

Landing

↓

Account

↓

Astrology Profile

↓

Chart Generation

↓

Welcome Home

↓

Daily Guidance

Instead of

Landing

↓

Generate

↓

Result

↓

Login

↓

Home

---

# P2 — Core Product

---

# SJ-201

## Recommendation Engine

Personalized recommendations for

- Reports
- Learning
- Questions
- Features

Based on

- Birth Chart
- Activity
- Subscription

---

# SJ-202

## Home Backend API

Single endpoint returning

- Daily Snapshot
- Journey
- Recommendations
- Recent Reports
- Continue Learning
- Notifications

Avoid many frontend API calls.

---

# SJ-203

## Daily Guidance

Generate personalized daily guidance.

Factors

- Dasha
- Transit
- Planetary Strength
- Current Goals

---

# SJ-204

## Ask Jyoti Evolution

Make AI conversation the center of the product.

Instead of reports being primary.

---

# SJ-205

## Notification Framework

Future

- Daily Insight
- Important Transit
- Dasha Change
- Report Reminder

---

# P3 — Premium Experience

---

# SJ-301

## Subscription Architecture

Support

- Free
- Basic
- Premium

Without changing navigation.

---

# SJ-302

## Entitlement Service

Backend driven.

Frontend consumes capabilities.

---

# SJ-303

## Payment Integration

Future

- Razorpay
- Stripe

Subscription lifecycle.

---

# SJ-304

## Premium Experience

Premium should provide

More depth.

Not a different application.

---

# P4 — Knowledge

---

# SJ-401

Complete remaining Zodiac Guides.

---

# SJ-402

Nakshatra Learning.

---

# SJ-403

Planets.

---

# SJ-404

Houses.

---

# SJ-405

Dasha Learning.

---

# SJ-406

Yoga Learning.

---

# Technical Debt

Current

- Replace temporary localStorage usage.
- Backend persistence for Astrology Profile.
- Standardize API responses.
- Shared route constants.
- Feature flag framework.
- Remove placeholder Home data.
- Replace mock recommendations.
- Connect Home to backend.

---

# Future Ideas

Not scheduled.

- AI Memory
- Timeline
- Family Sharing
- Consultation Booking
- Voice Conversations
- Wearables
- Health Insights
- Community
- Marketplace

---

# Completed Milestones

## M1

Platform Foundation

Completed

---

## M2

Knowledge Center Framework

Completed

---

## M3

Personal Workspace

Completed

---

## M4

Astrology Profile Onboarding

Completed

---

Future milestones will continue here.

---

# Product North Star

Every decision should support this statement:

> **Star Jyotish is your Personal AI-enabled Vedic Astrologer that grows with you throughout your life.**

If a feature does not strengthen this relationship, it should be questioned before implementation.