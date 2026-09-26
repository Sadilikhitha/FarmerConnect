# 🌾 Farmer Connect

## 1. Project Title
Farmer Connect — Agricultural Equipment Rental Platform

## 2. Project Description
Farmer Connect is a full-stack web application that connects farmers who need
agricultural equipment (tractors, harvesters, cultivators, etc.) with
equipment owners who want to rent it out. Owners list their equipment,
farmers browse and send rental requests, and owners approve or reject
those requests.

This project is built to be simple, clean, and easy for a B.Tech final-year
student to understand, run, and explain in a viva.

## 3. Features
- User registration and login (Farmer or Owner role) with JWT authentication
- Owners can add, edit, and delete their equipment listings
- Farmers can browse, search, and filter equipment by name, category, and location
- Farmers can send rental (booking) requests for available equipment
- Owners can approve or reject rental requests
- Farmer dashboard: view all rental requests and their status
- Owner dashboard: view own equipment and incoming rental requests
- Simple, clean, agricultural-themed responsive UI (green/white color scheme)

## 4. Technologies Used

**Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios

**Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn, JWT (python-jose), Passlib (bcrypt)

**Database:** MySQL

## 5. Folder Structure

```
FarmerConnect/
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, EquipmentCard, PrivateRoute
│   │   ├── pages/           # Home, Login, Register, Equipment, etc.
│   │   ├── services/        # api.js (Axios instance)
│   │   ├── context/          # AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── dependencies.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── equipment.py
│   │       └── bookings.py
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

## 6. Database Setup

1. Install MySQL locally (or use a cloud MySQL instance).
2. Create the database only — tables are created automatically:

```sql
CREATE DATABASE farmer_connect;
```

3. Copy `backend/.env.example` to `backend/.env` and fill in your MySQL
   credentials:

```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/farmer_connect
SECRET_KEY=your_secret_key
```

When the FastAPI app starts, SQLAlchemy automatically creates the `users`,
`equipment`, and `bookings` tables if they don't already exist — you never
need to write `CREATE TABLE` statements yourself.

## 7. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then edit .env with your MySQL password/secret key
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`.

## 8. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env          # defaults to http://localhost:8000, edit if needed
npm run dev
```

The site will be available at `http://localhost:5173`.

## 9. Environment Variables

**backend/.env**
| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SECRET_KEY` | Secret used to sign JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default 1440 = 24h) |

**frontend/.env**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

Never commit your real `.env` files — only `.env.example` is tracked in Git.

## 10. How to Run Locally

1. Start MySQL and create the `farmer_connect` database (see step 6).
2. In one terminal: run the backend (`uvicorn app.main:app --reload`).
3. In another terminal: run the frontend (`npm run dev`).
4. Open `http://localhost:5173` in your browser.
5. Register as an Owner to add equipment, and as a Farmer (in another
   browser/incognito tab) to browse and rent it.

## 11. API Overview

**Auth**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user (farmer or owner) |
| POST | `/auth/login` | Log in, returns a JWT token |
| GET | `/auth/me` | Get the currently logged-in user (requires token) |

**Equipment**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/equipment` | List all equipment (supports `search`, `category`, `location` query params) |
| GET | `/equipment/owner/mine` | List the logged-in owner's own equipment |
| GET | `/equipment/{id}` | Get one equipment item's details |
| POST | `/equipment` | Add new equipment (owner only) |
| PUT | `/equipment/{id}` | Update equipment (owner only, own listing) |
| DELETE | `/equipment/{id}` | Delete equipment (owner only, own listing) |

**Bookings**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings` | Create a rental request (farmer only) |
| GET | `/bookings/my` | List the logged-in farmer's rental requests |
| GET | `/bookings/owner` | List rental requests received by the logged-in owner |
| PUT | `/bookings/{id}/approve` | Approve a rental request (owner only) |
| PUT | `/bookings/{id}/reject` | Reject a rental request (owner only) |

## 12. Deployment Instructions

**Frontend → Vercel**
1. Push the `frontend/` folder to a GitHub repo (or the whole project, setting
   the Vercel "Root Directory" to `frontend`).
2. In Vercel, import the project, framework preset "Vite".
3. Add environment variable: `VITE_API_URL` = your deployed backend URL
   (e.g. `https://farmer-connect-api.onrender.com`).
4. Deploy. Build command: `npm run build`, output directory: `dist`.

**Backend → Render**
1. Push the `backend/` folder to GitHub (or set Render's "Root Directory" to
   `backend`).
2. Create a new Web Service on Render, environment "Python 3".
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `DATABASE_URL` and `SECRET_KEY` (matching your
   `.env` values, pointing to your cloud MySQL database).

**Database → MySQL-compatible cloud database**
Use any MySQL-compatible host (e.g. PlanetScale, Railway, AWS RDS,
Clever Cloud). Create a `farmer_connect` database there, and set
`DATABASE_URL` in Render to point to it, e.g.:

```
mysql+pymysql://<user>:<password>@<host>:<port>/farmer_connect
```

Tables are created automatically the first time the backend starts against
the new database, so no manual SQL is required beyond creating the database
itself.

---

### Quick Reference Flow

```
Register → Login → Browse Equipment → View Equipment →
Send Rental Request → Owner Approves/Rejects → Farmer sees Booking Status
```
