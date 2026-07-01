# Reflection Document

This document reflects on the development process, engineering choices, challenges faced, and lessons learned during the construction of the Meridian Onboarding Portal.

---

## 1. What turned out to be harder than expected?

* **Granular Day-by-Day Constraint Validation**:
  * Translating the "3-day office / 2-day remote" policy rule into logic that runs fluidly both in the C# backend and as live feedback in the React frontend required careful mapping. It was essential to ensure that any change in the schedule dynamically computed remaining days and gave immediate feedback without spamming the API.

---

## 2. What would I do differently if starting over?

* **Use a Structured Weekday Type in C#**:
  * Instead of mapping Monday through Friday directly as five individual string properties on the `Employee` model, I would model the schedule as a collection of `ScheduleDay` objects. This would allow cleaner validation loops (e.g., `ScheduleDays.Count(d => d.Location == Location.Office)`) and simplify expanding the system to cover weekends or variable schedules.
* **Component Decomposition**:
  * For a larger codebase, the React `App.tsx` file would be split into smaller standalone files (e.g., `<WeeklyMatrix />`, `<DailyLocator />`, `<OnboardingChecklist />`, and `<ScheduleModal />`) to improve testability and division of labor.

---

## 3. What did I learn during this project?

* **UX for Technical Rules**:
  * I learned how much a proactive UI improves user experience. Instead of letting the user submit a form and get a generic "400 Bad Request" from the backend, showing them a live countdown badge in the modal (e.g. `Office: 2/3 days`) turns an error case into a clear visual guide.
* **Vanilla CSS Layout Efficiency**:
  * Developing the UI design with Vanilla CSS (utilizing custom properties/variables and modern layout tools like Flexbox and CSS Grid) was a reminder of how powerful and clean native web standards have become. It kept build sizes tiny and loaded instantly without any of the heavy build configurations associated with utility class compilers.
