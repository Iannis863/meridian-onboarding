# Decisions Document

This document records key product, technical, and UX design decisions made during the development of the Meridian Onboarding Portal.

---

## 1. Product Decisions

* **Included Features**:
  * **Weekly Schedule Matrix**: Essential for finding coworker locations across the whole week.
  * **Daily Office Locator**: Instantly groups colleagues into "Office" or "Remote" columns for the current day. Highly prioritized because a new hire's primary daily question is: *"Who is in the office today that I can go talk to?"*
  * **Onboarding Checklist**: Provides guidance in the first weeks, directly reducing onboarding chaos.
  * **Interactive Schedule Editor**: Allows updating schedules while programmatically enforcing the 3 office / 2 remote day rule.
* **Prioritization**:
  1. Base database and explicit schedule models (Phase 1 core).
  2. Data seeding to represent real company operations.
  3. Interactive UI linking schedule management and locator tools.
  4. Checklist to support immediate task guidance.
* **Out of Scope (Intentional)**:
  * **User Authentication**: Left out of the initial MVP to maximize ease of local execution, though CORS settings allow integrating OAuth or cookie-based Auth easily later.
  * **Real-time Slack/Google Calendar Integrations**: Postponed for future phases to focus on core scheduling and database rules.

---

## 2. Technical Decisions

* **Database Choice (SQLite)**:
  * Chosen for ease of distribution, setup, and portability. It requires no separate local server setup for the evaluator.
* **Framework Choices**:
  * **ASP.NET Core 10 (Minimal APIs)**: Extremely fast, lightweight, and modern. Perfect for microservices or single-focus APIs.
  * **Vite + React (TypeScript)**: Standard modern pairing with incredibly fast HMR (Hot Module Replacement) and strong typing.
  * **Vanilla CSS**: Used instead of Tailwind to provide full layout control, direct optimization, and clean style separations.
* **Database Modeling (Explicit Weekdays)**:
  * We chose to store Monday–Friday locations directly as strings (`Office`, `Remote`) on the `Employee` model. This structure makes queries extremely fast and fits nicely inside the simple SQLite table without needing complex relationship joins.
* **Future Refactoring**:
  * If given more time, we would move to a separate `WeeklySchedule` entity linked via foreign key to the `Employee` model to allow historical tracking of schedules over multiple weeks.

---

## 3. UX Decisions

* **Tabbed Navigation**:
  * Keeps the workspace tidy and groups features logically (Schedule, Locator, Checklist).
* **Schedule Policy Validator UI**:
  * Real-time warning feedback in the modal guides the user instantly to configure a valid 3-day office / 2-day remote schedule before they click "Save".
* **Visual Styling**:
  * Used deep, premium violet tones (`--accent`) alongside clear blue and brown status badges.
  * Integrated a clean, responsive layout that works on desktop screens and adjusts comfortably to smaller devices.
