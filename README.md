# 🌾 FarmerConnect

FarmerConnect is a full-stack web platform where farmers can list agricultural equipment for rent and rent equipment listed by other farmers. Every registered user can both list and rent equipment. There is no Farmer/Owner role selection.

## Stack
- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: FastAPI, SQLAlchemy, MySQL, JWT authentication
- Email verification: Resend

## Run locally

### Backend
1. Create a Python 3.12 virtual environment.
2. Install dependencies:
   `pip install -r requirements.txt`
3. Copy `backend/.env.example` to `backend/.env` and fill in your MySQL, JWT, and Resend values.
4. Start the API from `backend`:
   `uvicorn app.main:app --reload`

### Frontend
1. From `frontend`, run `npm install`.
2. Optionally set `VITE_API_URL=http://localhost:8000` in `frontend/.env`.
3. Run `npm run dev`.

## Authentication
The login and verification routes use the same JWT helper in `backend/app/auth.py`. Do not hard-code a JWT secret in the router.

## Main flow
- Browse equipment publicly.
- Register and verify Gmail.
- Log in.
- List equipment with a required photo.
- Rent equipment from another user.
- A user cannot rent their own equipment.
- Manage profile and password from Profile.
