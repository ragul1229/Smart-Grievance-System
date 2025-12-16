# Smart Grievance System - Frontend (Prototype)

This is a minimal Vite + React frontend for the Smart Public Grievance prototype.

Quick start:

1. Install dependencies: `npm install`.
2. Run dev server: `npm run dev`.
3. The frontend expects the backend API at `http://localhost:5000/api` (configurable via `VITE_API_URL`).

What's included:

- Basic pages: Submit, Officer Dashboard, Admin Dashboard, Login (placeholders)
- Simple API helper (`src/services/api.js`) to call backend

Roles and responsibilities (prototype):

- Department Officer (operational):
  - Purpose: executor responsible for resolving grievances assigned to their department.
  - Can: log in and view grievances assigned to them or their department, read details and attachments, update status (in progress, resolved), add resolution notes, ensure SLA compliance.
  - Cannot: view grievances from other departments, modify categories or system-wide rules, delete grievances, or access system analytics.

- Admin (system & governance):
  - Purpose: oversight and governance, ensures transparency and SLA compliance.
  - Can: view all grievances across departments, monitor SLA and analytics, assign/reassign to departments or officers, manage departments and officers (basic), view performance charts.
  - Cannot (prototype): resolve grievances directly, modify historical records, perform real-world enforcement actions.

Next steps:

- Add authentication (JWT), role-aware routing and protected pages
- Implement grievance list and update flows
- Add charts for admin monitoring
- Implemented frontend auth (register/login) and connected Submit, Officer and Admin pages to backend API
- To run: ensure backend is running and seeded, then run `npm install` and `npm run dev` in `frontend/`.
