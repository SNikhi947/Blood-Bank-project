#  Blood Bank Management System

A full-stack **Blood Bank Management System** designed to connect donors, hospitals, and users through a secure and efficient platform. The system provides real-time blood availability management, donor registration, hospital inventory tracking, authentication, and request management.

The project is built using modern web technologies with a **React frontend, FastAPI backend, and PostgreSQL database**.

---

# 🚀 Live Demo

## Frontend
🔗 https://blood-link-lime-chi.vercel.app

## Backend API
🔗 https://bloodbank-backend-zkp0.onrender.com

## API Documentation (Swagger)
🔗 https://bloodbank-backend-zkp0.onrender.com/docs

---

# 📌 Features

## 👤 User Management
- User registration and login
- Secure password hashing
- JWT-based authentication
- Role-based access control

## 🩸 Donor Management
- Donor registration
- Blood group information
- Donor availability tracking
- Donor data management

## 🏥 Hospital Management
- Hospital registration
- Hospital profile management
- Blood inventory tracking
- Blood request handling

## 📦 Blood Inventory Management
- Add available blood units
- Track blood groups
- Manage stock availability
- Update inventory records

## 🔐 Security Features
- Password encryption using bcrypt
- JWT authentication
- Protected API routes
- Secure database operations

## 🌐 Deployment
- Frontend deployed on Vercel
- Backend deployed on Render
- PostgreSQL database hosted on Render

---

# 🏗️ System Architecture

```
                User
                 |
                 |
        React + Vite Frontend
                 |
                 |
          FastAPI REST API
                 |
                 |
          PostgreSQL Database
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- JavaScript
- Axios
- HTML5
- CSS3

## Backend

- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- Passlib
- Pydantic

## Database

- PostgreSQL

## Deployment

- Vercel (Frontend)
- Render (Backend + Database)

---

# 📂 Project Structure

```
Blood-Bank-project

│
├── Frontend
│   │
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── .env
│
│
└── Backend
    │
    ├── main.py
    ├── Database.py
    ├── requirements.txt
    │
    ├── Models
    │   ├── User.py
    │   ├── Donors.py
    │   ├── Hospital.py
    │   └── BloodRequest.py
    │
    └── utils
        ├── jwt.py
        └── hashing.py
```

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/SNikhi947/Blood-Bank-project.git

cd Blood-Bank-project
```

---

# 🔹 Backend Setup

Navigate to backend:

```bash
cd Backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` file:

```
DATABASE_URL=your_postgresql_database_url
SECRET_KEY=your_secret_key
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

Swagger Documentation:

```
http://localhost:8000/docs
```

---

# 🔹 Frontend Setup

Navigate to frontend:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```
VITE_API_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔑 Authentication Flow

```
User Registration
        |
        ↓
Password Hashing
        |
        ↓
Database Storage
        |
        ↓
Login Verification
        |
        ↓
JWT Token Generated
        |
        ↓
Protected API Access
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create new user |
| POST | `/login` | User login |

---

## Donor

| Method | Endpoint | Description |
|---|---|---|
| GET | `/donors` | Get donors |
| POST | `/donors` | Add donor |

---

## Hospital

| Method | Endpoint | Description |
|---|---|---|
| GET | `/hospitals` | Get hospitals |
| POST | `/hospitals` | Add hospital |

---

# 🧪 Testing

Backend API testing can be performed using:

- Swagger UI
- Postman
- Thunder Client

---

# 📸 Screenshots

Add screenshots here:

```
Frontend Home Page

Login Page

Dashboard

Blood Inventory

Swagger API Documentation
```

---

# 🔮 Future Enhancements

- Real-time blood availability notifications
- SMS/email alerts for urgent requests
- Location-based donor search
- AI-based blood demand prediction
- Mobile application support
- Admin dashboard analytics

---

# 👨‍💻 Developer

**Nikhil Kumar**

B.Tech Computer Science Engineering

GitHub:
https://github.com/SNikhi947

---

# 📜 License

This project is developed for educational and learning purposes.

---

⭐ If you find this project useful, consider giving it a star!
