<div align="center">

# 🌾 FarmerConnect

**A peer-to-peer agricultural equipment rental platform where farmers list, discover, and rent machinery from each other.**

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[🌐 Live Demo](https://farmerconnect-eight.vercel.app/)

</div>

---

##  About

Buying heavy farm equipment such as tractors, harvesters, and ploughs is expensive, and much of it sits idle for most of the year. **FarmerConnect** connects farmers who own equipment with farmers who need it, so owners earn extra income and renters get machinery at an affordable daily rate.

Every registered user can **both list and rent** equipment. There are no separate "Farmer" or "Owner" roles.

---

##  Features

-  **Secure authentication**: JWT-based login with bcrypt-hashed passwords
-  **Email OTP verification**: 6-digit OTP sent via Resend, with resend support
-  **List equipment**: add name, category, description, price per day, location, and a required photo
-  **Browse and filter**: public equipment browsing with category filtering
-  **Booking system**: choose start and end dates, with total price calculated automatically
-  **Booking management**: owners can approve or reject requests, and renters can cancel
-  **Self-rent protection**: users cannot rent their own equipment
-  **Dashboard**: manage your listings and track bookings (as renter and as owner)
-  **Settings**: update profile details and change password
-  **Image uploads**: equipment photos stored and served by the backend

---

## 📸 Screenshots

### Home Page
![Home Page](https://github.com/user-attachments/assets/ce796972-a546-466e-9c47-ae9c0195ffb9)

### Register 
![Register](https://github.com/user-attachments/assets/2e753dcc-18e5-4334-b67e-c6360c0584fd)

### Login
![Login](https://github.com/user-attachments/assets/8edb6c60-3514-46e3-9d7d-0b8243e31b86)

### Browse Equipment
![Browse Equipment](https://github.com/user-attachments/assets/8e14a70b-4672-4651-b315-808a0524d519)

### Rent Equipment
<img width="1917" height="912" alt="image" src="https://github.com/user-attachments/assets/21d6652a-64fb-4d16-b926-e5252fd483cf" />

### Equipment Details & Booking
![Add Equipment](https://github.com/user-attachments/assets/3945e351-7ee8-45d5-a4d0-74464e0c5907)
<img width="1917" height="906" alt="image" src="https://github.com/user-attachments/assets/5165af96-113f-4bed-87fb-e850bf51c662" />

### Dashboard
<img width="1917" height="906" alt="image" src="https://github.com/user-attachments/assets/343f91be-e0ce-43a6-a8f2-ceb9554f9932" />

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/2aa08413-16d6-45a4-bb24-1c3d687f884f)

### Profile
<img width="1917" height="906" alt="image" src="https://github.com/user-attachments/assets/c828902a-abd7-4373-a597-c7de3999400d" />

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| **Database** | MySQL (PyMySQL) |
| **Auth** | JWT (python-jose), passlib + bcrypt |
| **Email** | Resend |
| **Deployment** | Render |

---

## 📁 Project Structure

```
FarmerConnect/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py          # Register, login, OTP, profile
│   │   │   ├── equipment.py     # Equipment CRUD
│   │   │   └── bookings.py      # Booking workflow
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── auth.py              # JWT helpers
│   │   ├── dependencies.py      # Auth dependencies
│   │   ├── database.py          # DB connection
│   │   └── email_service.py     # Resend OTP emails
│   ├── uploads/                 # Equipment images
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, EquipmentCard, PrivateRoute
│   │   ├── context/             # AuthContext
│   │   ├── pages/               # Home, Login, Register, Dashboard, etc.
│   │   ├── services/api.js      # Axios API client
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

##  Getting Started

### Prerequisites

- Python 3.12 or higher
- Node.js 18 or higher
- MySQL server
- A [Resend](https://resend.com/) API key

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/FarmerConnect.git
cd FarmerConnect
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a MySQL database:

```sql
CREATE DATABASE farmer_connect;
```

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/farmer_connect
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
RESEND_API_KEY_1=your_resend_api_key
RESEND_API_KEY_2=your_backup_resend_api_key
```

Start the API (tables are created automatically on first run):

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` and interactive docs are at `http://localhost:8000/docs`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/verify-email` | Verify email with OTP |
| POST | `/auth/resend-otp` | Resend verification OTP |
| POST | `/auth/login` | Log in and receive a JWT |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/change-password` | Change password |

### Equipment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/equipment` | List all equipment (supports filters) |
| GET | `/equipment/mine` | List your own equipment |
| GET | `/equipment/{id}` | Get equipment details |
| POST | `/equipment` | Add equipment (with image) |
| PUT | `/equipment/{id}` | Update equipment |
| DELETE | `/equipment/{id}` | Delete equipment |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create a booking |
| GET | `/bookings/my` | Bookings you made |
| GET | `/bookings/owner` | Bookings for your equipment |
| PUT | `/bookings/{id}/approve` | Approve a booking |
| PUT | `/bookings/{id}/reject` | Reject a booking |
| PUT | `/bookings/{id}/cancel` | Cancel a booking |

> Route prefixes may differ slightly depending on your router configuration. Check `/docs` for the exact paths.

---

## 🔄 How It Works

1. **Browse**: anyone can view available equipment.
2. **Register**: sign up with a Gmail address and verify it using the emailed OTP.
3. **Log in**: authenticate and get a JWT.
4. **List equipment**: add your machinery with a photo, price, and location.
5. **Rent**: pick equipment from another user and request a booking for your dates.
6. **Manage**: owners approve or reject requests, and renters can cancel.

---

## 🗄️ Database Schema

- **User**: name, email, phone, password hash, verification status
- **Equipment**: name, category, description, price/day, location, image, availability, owner
- **Booking**: equipment, renter, owner, start and end date, total price, status (`Pending`, `Approved`, `Rejected`, `Cancelled`)

---

## 🔮 Future Improvements

- Online payments integration
- Ratings and reviews
- In-app chat between renter and owner
- Map-based equipment search
- Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Fork the repo, create a feature branch, and open a pull request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

