# Star Jyotish Documentation

Welcome to the Star Jyotish documentation.

This documentation is intentionally organized into layers so that long-term vision remains separate from day-to-day implementation. As the product grows, this structure helps maintain consistency in architecture, user experience, and AI behavior.

---

# Documentation Philosophy

The documentation is divided into three levels:

## 1. Constitution (Rarely Changes)

These documents define the identity of Star Jyotish.

If a future feature conflicts with these documents, the feature should be reconsidered.

These are the highest level of documentation.

| Document | Purpose |
|----------|---------|
| `vision/PRODUCT_ARCHITECTURE.md` | Defines what Star Jyotish is building and why. |
| `design/DESIGN_PHILOSOPHY.md` | Defines how the product should feel to users. |
| `engineering/ENGINEERING_PRINCIPLES.md` | Defines engineering standards, architecture, and development philosophy. |
| `ai/PERSONAL_AI_ASTROLOGER.md` | Defines the personality, behavior, and long-term vision of the Personal AI Astrologer. |

---

## 2. Product Strategy (Changes Occasionally)

These documents describe the evolution of the product.

They help product planning without changing the core philosophy.

| Document | Purpose |
|----------|---------|
| `vision/USER_JOURNEY.md` | End-to-end user experience from first visit to long-term engagement. |
| `vision/PRODUCT_HOME.md` | Vision for the user's personal workspace after login. |
| `vision/PRODUCT_ACTION_REGISTER.md` | Prioritized backlog of product improvements and future initiatives. |

---

## 3. Execution (Changes Frequently)

These documents support active development.

They include sprint plans, technical specifications, implementation notes, audits, and experiments.

### Superpowers

Internal planning documents used during implementation.

```
superpowers/
    plans/
    specs/
```

Examples include:

- Sprint plans
- Claude implementation prompts
- Technical specifications
- Design notes
- Feature execution plans

These documents evolve rapidly and may eventually become obsolete once features are completed.

---

# Documentation Structure

```
docs/

├── README.md
│
├── vision/
│   ├── PRODUCT_ARCHITECTURE.md
│   ├── PRODUCT_ACTION_REGISTER.md
│   ├── PRODUCT_HOME.md
│   └── USER_JOURNEY.md
│
├── design/
│   └── DESIGN_PHILOSOPHY.md
│
├── engineering/
│   └── ENGINEERING_PRINCIPLES.md
│
├── ai/
│   └── PERSONAL_AI_ASTROLOGER.md
│
└── superpowers/
    ├── plans/
    └── specs/
```

---

# How to Use These Documents

## New Engineers

Start reading in this order:

1. PRODUCT_ARCHITECTURE.md
2. DESIGN_PHILOSOPHY.md
3. ENGINEERING_PRINCIPLES.md
4. PERSONAL_AI_ASTROLOGER.md
5. USER_JOURNEY.md

Only after understanding these should implementation documents be consulted.

---

## AI Assistants (Claude / ChatGPT / Copilot)

Before implementing a new feature:

1. Understand the product philosophy.
2. Review the relevant architecture documents.
3. Review any existing product vision.
4. Finally, review the implementation specification.

AI should never optimize implementation at the cost of product consistency.

---

## Contributors

Before proposing a feature, ask:

- Does this align with the Product Architecture?
- Does it improve the User Journey?
- Does it strengthen the Personal AI Astrologer?
- Does it respect the Design Philosophy?
- Does it follow Engineering Principles?

If the answer to any of these is "No", reconsider the proposal before implementation.

---

# Guiding Principles

Every decision should move Star Jyotish closer to its long-term vision.

The goal is not to build another astrology website.

The goal is to build a trusted Personal AI Astrologer that helps people better understand themselves and make thoughtful life decisions using the timeless wisdom of Vedic astrology, enhanced by modern AI.

Features are temporary.

Architecture evolves.

Technology changes.

The product philosophy should endure.

---

# Living Documentation

This documentation is intended to evolve alongside the product.

- Constitution documents should change rarely.
- Strategy documents should evolve as the product matures.
- Execution documents should be updated continuously during development.

When in doubt, prioritize clarity, simplicity, and long-term maintainability over short-term convenience.