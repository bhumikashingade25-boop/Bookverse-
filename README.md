# 📚 BookVerse — Community Peer-to-Peer Physical Book Exchange

> **"Give Every Book a Second Life. Read. Share. Exchange. Repeat."**

**BookVerse** is a modern full-stack social reading and physical book exchange web application. It connects local readers to discover books in their city, swap physical copies, track reading streaks & milestones, chat in private exchange rooms, find nearby readers via OpenStreetMap geolocation, join reading clubs, and connect in a LinkedIn-style reader network.

---

## 🌟 Key Features

1. **LinkedIn-Style Reader Network (`/network`)**:
   - Search readers by name, city (*Mumbai, Delhi, Bangalore, etc.*), and favorite genres.
   - Send, accept, and decline connection invitations with real-time notifications.
2. **End-to-End Physical Book Swap Engine (`/exchanges`)**:
   - Express interest with a single tap or propose a 1-for-1 book swap.
   - Complete status transitions: `REQUESTED` → `ACCEPTED` → `CHAT ENABLED` → `ADDRESS SHARED` → `DELIVERED` → `COMPLETED`.
3. **Hyperlocal Reader Radar Map (`/map`)**:
   - Powered by **OpenStreetMap** with real-time browser GPS geolocation.
   - Shows nearby books, distance calculations (km), and integrated online delivery agent support.
4. **Distinct Multi-User Profiles (`/profile/:id`)**:
   - Each reader has their own public bookshelf, reading streaks 🔥, bio, and favorite genres.
   - Secure account and data separation powered by JWT authentication.
5. **Private Chat & Courier Integration (`/chat`)**:
   - Direct 1-on-1 messaging upon exchange acceptance.
   - Coordinates meetup or hyperlocal courier pickup/delivery.
6. **Reading Clubs & Discussions (`/clubs`)**:
   - Create, join, and discuss in genre-based reading circles.
7. **Gamified Achievements & Reading Progress (`/progress`, `/achievements`)**:
   - Daily reading streak counter, annual reading targets, and milestone badges.
8. **Admin Control Panel (`/admin`)**:
   - Moderation analytics, platform statistics, and community management (exclusively for Bhumika).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Vanilla/Tailwind CSS, Lucide React, Framer Motion, Axios, React Router v6
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), REST APIs
- **Database**: In-Memory Zero-Latency Document Database / MongoDB Mongoose
- **Mapping**: OpenStreetMap & Leaflet Geolocation
- **Automations**: Webhook Dispatcher & Event System

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bookverse.git
   cd bookverse
   ```

2. **Install dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   cd ..
   ```

3. **Start the Application**:
   ```bash
   # Terminal 1 - Start Express Backend (Port 5000)
   cd server
   node server.js

   # Terminal 2 - Start Vite Frontend (Port 5173)
   cd client
   npm run dev
   ```

4. **Open in Browser**:
   Visit [http://localhost:5173](http://localhost:5173)

---

## 📜 REST API Endpoints Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Users & Network**: `GET /api/users`, `GET /api/users/:id`, `POST /api/users/:id/connect`, `POST /api/users/requests/:id/accept`, `POST /api/users/requests/:id/decline`
- **Books**: `GET /api/books`, `GET /api/books/:id`, `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id`
- **Exchanges**: `GET /api/exchanges`, `POST /api/exchanges`, `POST /api/exchanges/interest/:bookId`, `PUT /api/exchanges/:id/accept`, `PUT /api/exchanges/:id/reject`, `PUT /api/exchanges/:id/complete`
- **Notifications**: `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
- **Clubs**: `GET /api/clubs`, `POST /api/clubs`, `POST /api/clubs/:id/join`, `POST /api/clubs/:id/discussions`
- **Wishlist**: `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/:id`
- **Admin**: `GET /api/admin/stats`

---

## 📄 License
MIT License © 2026 BookVerse
