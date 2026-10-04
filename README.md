# Rozgar Seva (रोजगार सेवा) - Daily Wage Worker Marketplace

Rozgar Seva is a full-stack production-style mobile application connecting daily-wage workers with job providers and employers across India. It features a Django REST Framework backend with PostgreSQL/SQLite, SimpleJWT authentication, a simulated Escrow payment state machine with 5% platform fee logic, GPS-based work verification, ratings/reviews, and a React Native (Expo) mobile frontend.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC):**
   - **Daily Wage Worker:** Discover jobs near GPS location, view daily wages, apply with cover notes, verify presence at site via GPS, track net earnings & Escrow release.
   - **Job Provider / Employer:** Post daily job openings, deposit/hold payment into Escrow, review worker profiles & ratings, accept workers, verify completion & release funds.
   - **Platform Admin:** View platform metrics, total users, active jobs, total escrow held, and total escrow released.

2. **Simulated Escrow Payment System:**
   - `PENDING` -> Created upon job posting.
   - `HELD` -> Locked when employer accepts a worker.
   - `RELEASED` -> Released to worker (minus 5% platform fee) upon job completion confirmation.
   - `CANCELLED` -> Refunded if job is cancelled.

3. **Geo-Tagged Work Verification:**
   - Calculates real-time distance using Haversine formula between worker's GPS coordinates and job site.
   - Requires worker to be within **5.0 km** radius to switch job status to `IN_PROGRESS`.

---

## 🚀 Quick Start Instructions

### 1. Backend Setup (Django REST Framework)

```bash
cd backend

# 1. Install Dependencies
python -m pip install "Django>=4.2,<5.0" djangorestframework djangorestframework-simplejwt django-cors-headers django-filter drf-spectacular Pillow

# 2. Run Database Migrations
python manage.py makemigrations accounts jobs applications payments verification ratings notifications
python manage.py migrate

# 3. Seed Initial Demo Data (Admin, Employers, Workers, Categories, Jobs)
python manage.py seed_data

# 4. Run Backend Tests
python manage.py test jobs

# 5. Start Development Server
python manage.py runserver 0.0.0.0:8000
```

- **OpenAPI Interactive Documentation (Swagger UI):** `http://127.0.0.1:8000/api/docs/`
- **ReDoc Documentation:** `http://127.0.0.1:8000/api/schema/redoc/`

### 2. Frontend Setup (React Native Expo)

```bash
cd mobile

# 1. Install NPM Dependencies
npm install

# 2. Start Expo Dev Server
npm start
```

---

## 🔐 Pre-Seeded Demo Credentials

| Role | Phone Number | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Worker** | `9123456780` | `worker123` | Electrician & Plumber (Sunil Kumar) |
| **Worker** | `9123456781` | `worker123` | Construction Helper (Raju Verma) |
| **Employer** | `9876543210` | `emp123` | Ramesh Construction |
| **Employer** | `9876543211` | `emp123` | Priya Homes |
| **Admin** | `9999999999` | `admin123` | Rozgar System Admin |
