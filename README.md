
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
BookVerse is a social reading platform inspired by the familiarity of Instagram, reimagined to solve real challenges in the reading community. Instead of scrolling through photos, users explore books, ideas, and stories — bridging the gap between unused books and readers who want them, making book sharing simple, trusted, and accessible.

**Core user flow:**
1. **Create Profile** – Build your reading profile and tell us what you love.
2. **Review Books** – Rate, review, and discover books shared by readers.
3. **Exchange Books** – Exchange books safely and easily with other readers.
4. **Find Nearby Readers** – Discover and connect with readers near you for exchanges.
5. **Earn Streaks** – Keep reading, complete goals, and earn streaks, badges & rewards.
6. **Show Bookshelf** – Showcase your bookshelf and inspire others.

**Key Features:**
- Book reviews & ratings
- Book exchange with owner approval flow
- Nearby reader matching (location-based)
- AI-powered book recommendations
- Eco rewards / eco points & trust score
- Active reading community & discussions

## PPT Link


## Live Demonstration Link

## Technology Stack

**Frontend**
- React.js

**Backend**
- Node.js
- Express.js

**Database & Auth**
- MongoDB
- Firebase Authentication

**APIs & Automation**
- Google Maps API (nearby reader matching)
- AI Recommendation Engine
- n8n (workflow automation)
- ElevenLabs (11 Labs)

## Team Members
| 1 | Akruti Kumari | Team Leader |
| 2 | Insiyah Lokhandwala | Member |
| 3 | Mudra Tandel | Member |
| 4 | Bhumika Shingade | Member |

**Institution:** Madhav Institute of Technology & Science, Gwalior (M.P.), India
**Chapter:** IEEE Computer Society – MITS Student Branch Chapter

## Setup Instructions

### Prerequisites
- Node.js (v18 or later) and npm installed
- MongoDB instance (local or MongoDB Atlas)
- Firebase project (for Authentication)
- Google Maps API key
- n8n instance (for workflow automation, optional for local dev)
- ElevenLabs API key (if voice/audio features are used)

### 1. Clone the Repository
```bash
git clone <repository-url>
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
```

### 3. Configure Environment Variables
Create a `.env` file in the `server` directory with:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

Create a `.env` file in the `client` directory with:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run the Application
```bash
# Start the backend server (from /server)
npm start

# Start the frontend (from /client, in a new terminal)
npm start
```

### 5. Access the App
Open your browser and navigate to:
```

*"A book changes one reader. Shared books can change an entire community."*
