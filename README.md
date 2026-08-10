
# 📚 BookVerse

### Read More. Spend Less. Waste Nothing.

## Team Name
**Coding Gurus**

## Problem Statement
**Track:** Open Innovation

Millions of books remain unused after being read once, while many readers cannot afford new books or easily discover trusted second-hand options. Existing platforms focus mainly on buying books but lack an integrated ecosystem for exchange, sharing, and connection between book lovers. This leads to:

- **Limited Access** – Affordable books remain out of reach for many readers.
- **Book Wastage** – Reusable books sit idle instead of circulating further.
- **No Active Community** – Readers lack a space built around genuine reading culture.
- **Fewer Discussions** – Limited scope for recommendations and shared insight.

## Solution Overview
BookVerse is a social reading platform inspired by the familiarity of modern social networks, reimagined to solve real challenges in the reading community. Instead of scrolling through photos, users explore books, ideas, and stories — bridging the gap between unused books and readers who want them, making book sharing simple, trusted, and accessible.

**Core user flow:**
1. **Create Profile** – Build your reading profile and tell us what you love.
2. **Review Books** – Rate, review, and discover books shared by readers.
3. **Exchange Books** – Exchange books safely and easily with other readers via an owner approval flow.
4. **Find Nearby Readers** – Discover and connect with readers near you for exchanges using interactive maps.
5. **Earn Streaks** – Keep reading, complete goals, and earn streaks, badges & rewards.
6. **Show Bookshelf** – Showcase your bookshelf and inspire others.

**Key Features:**
- Book reviews & ratings feed
- Book exchange with interactive Accept/Decline owner approval flow
- LinkedIn-style reader search & connection network (`/network`)
- Nearby reader matching using OpenStreetMap GPS geolocation (`/map`)
- AI-powered book recommendation engine (`/recommendations`)
- Reading streak tracking, yearly goals & gamified badges (`/progress`, `/achievements`)
- Reading clubs & community group discussions (`/clubs`)
- Admin moderation dashboard for platform governance (`/admin` - Exclusive to Bhumika)

## Technology Stack

**Frontend**
- React.js 18
- Vite
- Tailwind CSS & Custom Glassmorphism UI
- Lucide React & Framer Motion
- Axios & React Router v6

**Backend**
- Node.js
- Express.js
- JSON Web Token (JWT) Session Authentication & Google 1-Click Sign-In

**Database & Storage**
- MongoDB / Mongoose (with In-Memory zero-latency engine fallback)

**APIs & Automation**
- OpenStreetMap & Leaflet (Nearby reader radar & real-time GPS matching)
- AI Book Recommendation Engine
- n8n Event Webhook Automation

## Team Members
| No. | Name | Role |
| :--- | :--- | :--- |
| 1 | **Akruti Kumari** | Team Leader |
| 2 | **Insiyah Lokhandwala** | Member |
| 3 | **Mudra Tandel** | Member |
| 4 | **Bhumika Shingade** | Member (Platform Admin) |

## Setup Instructions

### Prerequisites
- Node.js (v18 or later) and npm installed
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/bookverse.git
cd bookverse
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install
# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 3. Configure Environment Variables (Optional)
Create a `.env` file in the `server` directory with:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=bookverse_super_secret_jwt_key_2026
N8N_WEBHOOK_URL=your_n8n_webhook_url
```
Create a `.env` file in the `client` directory with:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Application

```bash
# Terminal 1: Start the Backend Server (from /server)
cd server
node server.js

# Terminal 2: Start the Frontend App (from /client, in a new terminal)
cd client
npm run dev
```

### 5. Access the App

Open your web browser and navigate to:


---

> *"A book changes one reader. Shared books can change an entire community."*

