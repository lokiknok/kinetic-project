# KINETIC | Web Engineering Platform

A modern full-stack web engineering platform built with a Python Flask REST API backend, JWT authentication, role-based admin controls, and a custom interactive client proposal configurator.

---

## 🎨 Brand Design System

* **Primary Background:** `#000000` (Pure Black)
* **Secondary Surface:** `#141414` / `#181818` (Dark Charcoal)
* **Brand Accent:** `#ff5500` (Kinetic Orange)
* **Text / Base Elements:** `#ffffff` (White) & `#aaaaaa` (Muted Gray)
* **Icons:** Font Awesome Graphical Web Icons

---

## 📁 Project Structure

```text
kinetic-project/
├── .gitignore
├── README.md
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   └── script.js
│   ├── admin.html
│   ├── index.html
│   └── signin.html
└── backend/
    ├── app.py
    ├── requirements.txt
    ├── Procfile
    ├── proposals.json
    └── users.json
Features
JWT Authentication: Secure user registration, login, and session persistence in localStorage.

Role-Based Access Control (RBAC): Admin-only endpoints and UI controls.

Interactive Scope Configurator: Allows clients to build custom project requirements and submit proposals directly.

Admin Dashboard: Full management interface to view/delete registered users and project proposals.

Auto Admin Seeding: Generates standard default administrator credentials automatically on application launch.

🔑 Default Admin Credentials
Upon launching the backend for the first time, a default administrator account is initialized automatically:

Email: admin@kinetic.com

Password: admin123

🚀 Local Development Setup
Prerequisites
Python 3.9+

Git

1. Clone the Repository
Bash
git clone [https://github.com/YOUR_USERNAME/kinetic-project.git](https://github.com/YOUR_USERNAME/kinetic-project.git)
cd kinetic-project
2. Set Up the Backend
Bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the Flask development server
python app.py
3. Open in Browser
Visit http://localhost:5000 in your browser.

🌐 Free Deployment Guide (Render)
This repository is configured for zero-configuration hosting on Render with either Blueprint or Web Service deployment.

### Option 1: Automatic Blueprint (Recommended)
1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New +** > **Blueprint**.
3. Select your repository. Render will automatically read `render.yaml` and configure everything.
4. Click **Apply**.

### Option 2: Manual Web Service Setup
1. On Render, click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --chdir backend app:app` (or if Root Directory is set to `backend`, use `gunicorn app:app`)
4. Click **Create Web Service**.

🛡️ API Endpoints
Public Routes
POST /api/signup — Register a new account

POST /api/signin — Login and retrieve JWT token

Authenticated User Routes
POST /api/proposals — Submit a project scope proposal

Admin Routes (Requires Bearer Token + Admin Role)
GET /api/admin/users — Fetch all users

DELETE /api/admin/users/:id — Delete a specific user

GET /api/admin/proposals — Fetch all client proposals

DELETE /api/admin/proposals/:id — Delete a specific proposal

📄 License
© 2026 Kinetic Web Engineering. All rights reserved.