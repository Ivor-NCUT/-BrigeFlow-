# Supabase Migration Guide

To complete the setup, please follow these steps:

1.  **Update Password**: Open `backend/.env` and replace `[YOUR-PASSWORD]` with your actual Supabase database password in the `DATABASE_URL`.
2.  **Run Migration**:
    *   Go to your Supabase Project Dashboard -> SQL Editor.
    *   Open `backend/migration.sql` from this project.
    *   Copy the content and paste it into the SQL Editor.
    *   Click "Run" to create the tables.
3.  **Start Backend**:
    *   Run `cd backend && npm run dev` to start the backend server.
4.  **Start Frontend**:
    *   Run `npm run dev` in the root folder to start the frontend.

You should now be able to register/login and use the app with Supabase!
