# Future Roadmap: What I Would Do Next

If given two additional weeks of development, the following features would be implemented to transition the Meridian Onboarding Portal from an MVP to a fully featured enterprise application.

---

## Priority 1: Core Experience Fundamentals

* **User Authentication & Profiles**:
  * Implement corporate SSO (Google Workspace or Microsoft Entra ID) to secure the application.
  * Restrict editing permissions so employees can only edit their *own* weekly schedule, while HR retains administrative access to add/remove profiles.
* **Database Migration to Postgres/SQL Server**:
  * Swap SQLite for PostgreSQL or SQL Server to support concurrent write requests as the organization grows towards 200+ active users.

---

## Priority 2: High Value Additions

* **Integration with Communication Tools**:
  * **Slack Integration**: Automatically update employees' Slack status emojis (🏢 vs. 🏠) based on their daily location in the Meridian portal.
  * **Google Calendar Integration**: Sync the weekly office schedule directly as recurring all-day calendar events.
* **Onboarding Buddy Assignments**:
  * Match new hires with an onboarding "buddy" from their department.
  * Show the buddy's contact details and schedule explicitly on the dashboard to ease the first days of communication.

---

## Priority 3: Nice-to-Have Polish & Quality of Life

* **Meeting Coordination Optimizer**:
  * Introduce a "Schedule Matcher" that suggests the best day for an in-person meeting by analyzing when all selected participants are simultaneously scheduled to be in the office.
* **Interactive Floor Maps**:
  * Visual floor plans of the office building showing desk bookings or seating zones corresponding to the department tag.
