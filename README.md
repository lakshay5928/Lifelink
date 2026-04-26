# 🩸 LifeLink — Smart Blood Donor Management System

A full-stack web application that connects blood donors with patients during medical emergencies. Built with Node.js, Express, MongoDB, and HTML/CSS/JavaScript.

---

## 🚀 Features

- Donor Registration (blood group, location, last donation date)
- JWT Authentication (secure login with token)
- Auto Eligibility Check (90 days male, 120 days female)
- Search & Filter (blood group, state, city)
- Emergency Alert System (top 10 nearest donors + SMS simulation)
- Availability Toggle (donor dashboard)
- Direct Contact (Call & WhatsApp)
- Admin Panel (Full CRUD operations)
- Role-Based Access Control (admin only routes)
- Auto Seeding (200 donors + 1 admin)

---

## 👨‍💼 Admin Panel

- Single Admin Account (auto-created)
- Create, Read, Update, Delete donors
- View all donor details
- Edit donor availability
- Delete donors securely
- Dashboard statistics (total, available, unavailable)
- Protected using JWT + admin middleware

### 🔐 Admin Credentials
Email: admin@lifelink.com  
Password: Admin@1234

---

## 🛠 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Authorization | Role-Based Access |

---

## 📁 Project Structure


```
lifelink/
├── backend/
│ ├── server.js
│ ├── seedData.js
│ ├── models/
│ │ └── Donor.js
│ ├── middleware/
│ │ ├── auth.js
│ │ └── admin.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── donorController.js
│ │ └── adminController.js
│ └── routes/
│ ├── authRoutes.js
│ ├── donorRoutes.js
│ └── adminRoutes.js
│
└── frontend/
├── index.html
├── register.html
├── search.html
├── emergency.html
├── dashboard.html
├── admin.html
├── css/
│ └── style.css
└── js/
└── app.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB running locally

### 1. Clone Repository
```bash
git clone https://github.com/yourrepo/lifelink.git
cd lifelink
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Start the server
```bash
npm start
```

You should see:
```
🚀 Server → http://localhost:5000
✅ MongoDB Connected
🌱 Seeded 200 donors (password: Demo@1234)
```

### 4. Open the frontend
Open `frontend/index.html` directly in your browser.

> No need to run a separate frontend server.

---

## 🔌 API Endpoints

| Method | Route | Description | Access |
|-------|------|------------|--------|
| POST | /api/auth/register | Register donor | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/me | Get profile | Protected |
| GET | /api/donors | Get all donors | Public |
| GET | /api/donors/search | Filter donors | Public |
| POST | /api/donors/emergency | Emergency request | Public |
| PATCH | /api/donors/availability | Toggle availability | Protected |
| GET | /api/admin/donors | Get all donors | Admin |
| POST | /api/admin/donors | Create donor | Admin |
| PUT | /api/admin/donors/:id | Update donor | Admin |
| DELETE | /api/admin/donors/:id | Delete donor | Admin |

---

## 🧠 Eligibility Logic

| Gender | Minimum Gap |
|---|---|
| Male | 90 days |
| Female | 120 days |

Eligibility is calculated as a virtual field in Mongoose on every query — not stored separately.

---

## 🚨 Emergency Alert Flow

1. User submits blood group + state + city
2. System queries MongoDB for available + eligible donors
3. City-first sorting → then state-level (approximates proximity without GPS)
4. Top 10 donors selected
5. SMS simulated via console log + displayed on screen with Call/WhatsApp buttons

> To enable real SMS: replace the simulate function in `donorController.js` with Fast2SMS API call.

---

## 🔐 Demo Login

All seeded donors use:
```
Email: donor1@lifelink.demo  
Password: Demo@1234    (donor1 to donor200)
```

---

## 📄 License

MIT — Free to use for educational purposes.

---

## ⭐ Author

Lakshay Verma
