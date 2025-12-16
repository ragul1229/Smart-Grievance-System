# Smart Grievance System - Backend (Prototype)

This is a simple Express + MongoDB backend for the Smart Public Grievance Redressal prototype.

Quick start:

1. Copy `.env.example` to `.env` and fill values (MONGO_URI, PORT, JWT_SECRET).
2. Install dependencies: `npm install`.
3. Run in dev mode: `npm run dev` (requires nodemon) or `npm start`.

What's included:

- Express server with a health route
- Mongoose connection helper
- Basic models: User, Grievance, and Department (added for department-level assignment)
- Sample routes for health and grievances

Next steps:

- Add authentication and role-based middleware
- Implement full CRUD and filtering for grievances
- Add the explainable AI module for category/priority tagging
- Implemented: JWT auth (`/api/auth`), grievance classification (`/api/grievances`), SLA worker (escalation), analytics (`/api/analytics`)
- Use `node scripts/seed.js` to create sample users (admin/officer/citizen) and sample departments; update `.env` before running.
- New endpoints: `/api/departments` (GET, POST, PATCH, DELETE) for admin-managed departments; `/api/departments/:id/categories` to set category → officers assignments; `/api/grievances` now supports category-based auto-assignment to configured officers as well as department-level assignment and officer visibility is restricted to their department or assigned grievances.
- Note: the server includes a JSON body size increase to support small base64 image uploads in the prototype (`express.json({ limit: '5mb' })`).
- A global JSON error handler is registered to return consistent error responses from the API.
