# Engineering Principles

> **Project:** Star Jyotish
>
> **Version:** 1.0
>
> **Status:** Living Document
>
> **Audience:** Engineers, AI Agents, Contributors
>
> **Prerequisite:** PRODUCT_ARCHITECTURE.md

---

# Purpose

This document defines the engineering philosophy, architectural boundaries, and implementation principles that govern the development of Star Jyotish.

Its objective is to ensure that every contribution—whether made by a human engineer or an AI coding assistant—maintains consistency, scalability, maintainability, and alignment with the long-term product vision.

Engineering decisions should always support the principles described in **PRODUCT_ARCHITECTURE.md**.

---

# Engineering Philosophy

The codebase should be easy to understand, easy to extend, and difficult to break.

We optimize for:

- Clarity over cleverness
- Consistency over individual preference
- Scalability over short-term convenience
- Maintainability over premature optimization
- Simplicity over unnecessary abstraction

A feature that works today but makes the future more difficult is considered incomplete.

---

# Core Architectural Principles

## 1. Backend Owns Business Logic

The backend is the single source of truth.

The backend owns:

- Astrology calculations
- Report generation
- AI orchestration
- User permissions
- Subscription entitlements
- Recommendations
- Daily guidance
- Notification rules
- Personalization
- Security decisions

The frontend should never duplicate these rules.

---

## 2. Frontend Owns User Experience

The frontend is responsible for presenting information clearly and consistently.

It owns:

- Rendering
- Navigation
- User interaction
- Accessibility
- Animations
- Progressive disclosure
- Local UI state
- Visual feedback

The frontend should remain lightweight and avoid embedding business logic.

---

## 3. API-First Development

Every new capability should be designed as an API before it is implemented in the UI.

Benefits:

- Mobile-ready architecture
- Consistent business rules
- Easier testing
- Easier future integrations
- Simpler frontend implementation

---

## 4. Single Source of Truth

Every piece of business information must have one authoritative owner.

Examples:

| Information | Owner |
|-------------|-------|
| Subscription Status | Backend |
| Astrology Profile | Backend |
| Recommendations | Backend |
| Kundli Calculations | Backend |
| Knowledge Metadata | Configuration |
| Authentication | Backend |
| Theme | Frontend |

Business information must never exist in multiple places.

---

## 5. Configuration Over Hardcoding

Whenever possible, use configuration instead of code.

Examples:

- Learning paths
- Knowledge graph
- Navigation metadata
- Subscription capabilities
- Zodiac metadata
- Feature availability

Adding new content should rarely require changing React components.

---

# Layer Responsibilities

## Presentation Layer

Responsible for:

- Layout
- Components
- Accessibility
- User interaction
- Client-side validation
- Loading states
- Error presentation

Must never implement business rules.

---

## API Layer

Responsible for:

- Authentication
- Validation
- Request parsing
- Response formatting

Must remain thin.

---

## Service Layer

Responsible for:

- Business workflows
- Personalization
- Recommendations
- AI orchestration
- Domain logic

This is where most application intelligence belongs.

---

## Repository Layer

Responsible only for persistence.

Repositories:

- save
- update
- delete
- retrieve

Repositories should never contain business workflows.

---

# Frontend Principles

## Pages

Pages compose experiences.

Pages should:

- Fetch data
- Compose components
- Manage page-level state
- Handle routing

Pages should avoid large amounts of business logic.

---

## Components

Components should be:

- Reusable
- Focused
- Composable
- Stateless whenever possible

Avoid page-specific components unless reuse is unlikely.

---

## State Management

Choose the smallest appropriate scope.

Order of preference:

1. Component State
2. Page State
3. Context
4. Backend Persistence

Avoid unnecessary global state.

---

## Routing

Routes should represent meaningful destinations.

Avoid:

- Temporary routes
- Dead-end pages
- Hidden pages without navigation

URLs should remain stable over time.

---

# Backend Principles

## Service-Oriented Design

Business logic belongs inside services.

Routers coordinate.

Repositories persist.

Models represent data.

Each layer should have a single responsibility.

---

## Deterministic Astrology

Swiss Ephemeris performs calculations.

AI performs interpretation.

Never allow AI to calculate astrology.

Never hardcode planetary positions.

---

## Aggregation APIs

The frontend should avoid assembling dashboards from numerous API calls.

Create aggregation endpoints where appropriate.

Example:

```
GET /api/home
```

Returns:

- Daily snapshot
- Current dasha
- Active transit
- Recommendations
- Recent reports
- Continue learning
- Notifications

One request.

One response.

---

# Data Architecture

## User

Represents authentication and account information.

Contains:

- Identity
- Contact information
- Preferences
- Subscription

Does NOT contain astrology data.

---

## Astrology Profile

Represents an individual's birth details.

Future capabilities:

- Multiple profiles
- Family members
- Profile switching
- Archived profiles

Astrology Profile is a first-class domain object.

---

## Reports

Reports are snapshots in time.

They should be reproducible.

Avoid storing derived calculations that can be regenerated.

---

# AI Engineering Principles

AI is an interpreter.

Not a calculator.

Whenever possible:

Deterministic engine

↓

Structured context

↓

Prompt assembly

↓

AI interpretation

↓

Response normalization

Maintain a clear separation between:

Facts

Interpretation

Recommendations

---

## Prompt Engineering

Prompt templates should remain separate from API routes.

Prompt construction should be modular.

Reference material (astro-skills) should be versioned.

Prompts should evolve independently of application code.

---

## Personalization

Personalization should be driven by structured data.

Examples:

- Birth chart
- Current dasha
- Transit
- Goals
- Previous reports
- Learning progress
- Subscription tier

Avoid relying on conversational memory alone.

---

# Performance Principles

Optimize for perceived performance.

Preferred techniques:

- Lazy loading
- Code splitting
- Skeleton loading
- API aggregation
- Intelligent caching

Avoid optimization that significantly reduces readability.

---

# Security Principles

Security is a default.

Not an enhancement.

Always:

- Validate input
- Sanitize output
- Authenticate requests
- Authorize actions
- Protect secrets
- Apply rate limiting
- Log critical actions

Never trust client-side validation.

---

# Testing Philosophy

Priority order:

1. Astrology calculations
2. Business services
3. API endpoints
4. AI orchestration
5. UI behaviour
6. Visual polish

Critical business rules should always have automated tests.

---

# Documentation Standards

Every major module should explain:

- Purpose
- Responsibilities
- Dependencies
- Extension points

Complex architecture deserves documentation.

Documentation is part of the implementation.

---

# AI-Assisted Development

Star Jyotish intentionally embraces AI-assisted software development.

AI-generated code should:

- Respect existing architecture
- Reuse established patterns
- Avoid unnecessary abstractions
- Follow repository conventions
- Explain significant design decisions

AI should accelerate development—not fragment the codebase.

---

# Feature Development Checklist

Before implementing any feature, verify:

- Does it align with PRODUCT_ARCHITECTURE.md?
- Does the business logic belong in the backend?
- Is any logic duplicated?
- Can configuration replace hardcoding?
- Is the component reusable?
- Will it support future subscription tiers?
- Does it improve the Personal Astrology Companion experience?
- Has the documentation been updated?

If any answer is "No", reconsider the implementation.

---

# Definition of Done

A feature is complete only when it includes:

- Functional implementation
- Appropriate automated tests
- Responsive behaviour
- Accessibility review
- Error handling
- Documentation updates
- Analytics hooks (where appropriate)
- Security review
- Architectural alignment

Shipping code is not the goal.

Improving the product is.

---

# Engineering North Star

Every engineering decision should reinforce this principle:

> **Build a platform that remains understandable, scalable, and maintainable while enabling Star Jyotish to become the world's most trusted Personal Astrology Companion.**

If a solution introduces unnecessary complexity or compromises the long-term architecture for short-term convenience, it should be reconsidered before implementation.