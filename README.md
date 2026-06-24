# Interview Experience Portal

A full-stack web application where students can share and browse interview experiences to help peers prepare for placements and internships.

---

## Features

- User registration and login with session-based authentication
- Public feed of all shared experiences (no login required)
- Post your interview experience with company, role, details, and result
- Personal dashboard to view, edit, and delete your own posts
- Profile page showing account information
- Posts tagged with status: Selected, Rejected, or Waiting for Results
- Edit and delete restricted to the post owner

---

## Tech Stack

**Backend**

| Package | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| PostgreSQL + pg | Database |
| bcrypt | Password hashing |
| express-session | Session management |
| dotenv | Environment variables |
| nodemon | Dev auto-reload |

**Frontend**

| Package | Purpose |
|---|---|
| React 19 + Vite | UI and build tool |
| React Router v7 | Client-side routing |
| Axios | HTTP requests |
| Bootstrap 5 | Base styling |

---

## Project Structure

```
interview-experience-portal/
├── server.js
├── package.json
├── .env                   # Local secrets — not committed
├── .env.example           # Template for environment setup
├── .gitignore
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── LandingPage.jsx
    │   │   ├── Auth.jsx
    │   │   ├── Feed.jsx
    │   │   ├── CreatePost.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   └── Navbar.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Setup

### Prerequisites

- Node.js v18+
- PostgreSQL installed and running

---

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/interview-experience-portal.git
cd interview-experience-portal
```

### 2. Set up the database

Run the following in psql or pgAdmin:

```sql
CREATE DATABASE interview_portal;

\c interview_portal

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255),
    branch VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your values:

```
PORT=4000

PG_USER=your_postgres_username
PG_PASSWORD=your_postgres_password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=interview_portal

SESSION_SECRET=your_random_secret_string
```

### 4. Run the backend

```bash
npm install
npm start
```

Runs at `http://localhost:4000`

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /register | No | Register a new user |
| POST | /login | No | Log in |
| POST | /logout | Yes | Log out |
| GET | /api/check-auth | No | Check current session |
| GET | /api/me | Yes | Get logged-in user profile |
| GET | /api/experiences | No | Fetch all posts |
| GET | /api/my-posts | Yes | Fetch current user's posts |
| POST | /api/experiences | Yes | Create a post |
| PUT | /api/experiences/:id | Yes (owner) | Edit a post |
| DELETE | /api/experiences/:id | Yes (owner) | Delete a post |

---

## Routes

| Route | Access | Description |
|---|---|---|
| / | Public | Landing page |
| /login | Guest only | Login form |
| /register | Guest only | Registration form |
| /feed | Public | All shared experiences |
| /create | Login required | Share a new experience |
| /dashboard | Login required | Manage your posts |
| /profile | Login required | View your profile |

---

## Security

- Passwords are hashed with bcrypt (10 salt rounds)
- Sessions use a secret key defined in `.env`
- Edit and delete operations are owner-verified on the server side
- `.env` is listed in `.gitignore` and is never committed

---

## License

ISC
