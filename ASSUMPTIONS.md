# Assumptions Document

This document outlines key assumptions made about the users, data management, and operational context of the Meridian Onboarding Portal.

---

## 1. About the Users

* **Target Audience**: Primarily new hires on their first day or week, HR managers, and existing employees coordinating hybrid schedules.
* **Onboarding Experience**:
  * The user is assumed to know their own login or basic details, but doesn't know their team members, departments, or office schedules.
  * Opening the application for the first time, a new hire should immediately see:
    * Who is on their team.
    * Where team members are located (Office vs. Remote) today.
    * A clear checklist of tasks they need to complete (IT setup, HR 1-on-1s, Slack setups).
* **Technical Literacy**: Users are comfortable with web browsers, communication tools (Slack, Google Meet), and basic interface interactions.

---

## 2. About the Data

* **Data Entry**:
  * **Initial Templates**: Standard employee schedules are seeded by the system (8 template employees across Engineering, HR, Sales, Finance, Marketing).
  * **Additions & Edits**: HR or employees can edit schedules. New employee entries would be added on hire.
* **Frequency of Updates**: Schedules are typically set once during onboarding or adjusted weekly depending on team needs.
* **Data Quality & Validation**:
  * If a user inputs an invalid schedule, the system prevents saving and requires exactly **3 days in the office / 2 days remote**.
  * Missing email/name validation is handled to prevent incomplete database profiles.

---

## 3. About the Context

* **First-Day Devices**: New hires are assumed to use corporate-issued laptops or desktop systems set up by IT.
* **Pre-employment Access**: New hires generally do not have corporate VPN or network access before Day 1, meaning the application is first opened locally on their first official working day.
* **Communication Access**: Slack is the primary channel for remote days, while office days focus on in-person onboarding meetings.
