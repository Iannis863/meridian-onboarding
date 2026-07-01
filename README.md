# Meridian Onboarding Portal

Welcome to the **Meridian Onboarding Portal**, a hybrid scheduling and onboarding assistant built to coordinate teams and ease the transition for new hires.

---

## Technical Stack
* **Backend**: ASP.NET Core 10 Minimal APIs, EF Core, SQLite database.
* **Frontend**: React 19 (TypeScript), Vite dev server, Vanilla CSS.

---

## Local Execution Instructions

Follow these steps to run the application locally:

### 1. Run the Backend API
The backend handles data access and enforces the 3-day office / 2-day remote hybrid work schedule policy.

1. Open a terminal and navigate to the API project directory:
   ```bash
   cd backend/Meridian.API
   ```
2. Run the application:
   ```bash
   dotnet run
   ```
3. The server will start and listen on **`http://localhost:5077`**.
   * On first run, it will automatically generate the local SQLite database file `meridian.db` and seed it with 8 template employees.
   * You can test the endpoints at `http://localhost:5077/api/employees`.

---

### 2. Run the Frontend UI
The frontend client fetches employee data and displays the schedule matrix, daily office locator, and onboarding checklist.

1. Open a new terminal window and navigate to the UI project directory:
   ```bash
   cd frontend/meridian-ui
   ```
2. (Optional) If package dependencies are not installed, run:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:5173`** to access the portal.

---

## Features
* **Interactive Weekly Matrix**: View and filter schedules by department and name.
* **Hybrid Schedule Policy Validator**: Built-in client-side and server-side rules preventing schedules violating the 3 office/2 remote day policy.
* **Daily Office Locator**: Instantly find who is in the office vs. remote on any given weekday.
* **Onboarding Checklist**: A customizable first-month checklist persisted locally.
