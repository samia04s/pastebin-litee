# Pastebin-Lite

A lightweight Pastebin-like web application where users can create text pastes and share a link to view them.  
Pastes can optionally expire based on time (TTL) or number of views.

This project was built as part of a take-home assignment and is evaluated primarily using automated tests.

---

## 🚀 Deployed URL

👉 https://pastebin-litee.vercel.app

---

## 🧰 Tech Stack

- **Framework:** Next.js (App Router)
- **Runtime:** Node.js
- **Database:** MongoDB Atlas
- **Deployment:** Vercel

---

## ✨ Features

- Create a paste with arbitrary text
- Get a shareable URL for the paste
- View paste via API or browser
- Optional constraints:
  - ⏱ Time-based expiry (TTL)
  - 👀 View-count limit
- Secure HTML rendering (no script execution)
- Deterministic time support for automated testing

---

## 📡 API Endpoints

### Health Check
GET /api/healthz

Response:
```json
{ "ok": true }

Create Paste
POST /api/pastes

Request body:
{
  "content": "Hello world",
  "ttl_seconds": 60,
  "max_views": 3
}

Response:
{
  "id": "abc123",
  "url": "https://pastebin-litee.vercel.app/p/abc123"
}

Fetch Paste (API)
GET /api/pastes/:id

Response:
{
  "content": "Hello world",
  "remaining_views": 2,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
Each successful fetch counts as a view
Returns 404 if:
1.Paste does not exist
2.Paste has expired
3.View limit is exceeded

View Paste (HTML)
GET /p/:id

Returns an HTML page containing the paste
Content is rendered safely (no script execution)
Returns 404 if the paste is unavailable

🗄 Persistence Layer

This project uses MongoDB Atlas as the persistence layer.

Reasoning:

Serverless-safe (works reliably on Vercel)

Survives across requests and deployments

Supports atomic updates (used for view-count decrement)

No in-memory or global mutable state is used.

🧑‍💻 Run Locally

1️⃣ Clone the repository
git clone https://github.com/samia04s/Pastebin-lite.git
cd Pastebin-lite

2️⃣ Install dependencies
npm install

3️⃣ Configure environment variables

Create a .env.local file:

MONGODB_URI=your_mongodb_atlas_connection_string

(Optional for testing)

TEST_MODE=1

4️⃣ Start the development server:npm run dev


The app will run at:http://localhost:3000

⚠️ Notes & Design Decisions

1.No hardcoded localhost URLs are used in production code
2.All API responses return valid JSON
3.HTML rendering escapes content to prevent XSS
4.View counts never go negative
5.TTL and view limits are enforced atomically
6.Designed to pass automated tests under light concurrent load

Assignment Checklist

 ✅Health check endpoint

 ✅Paste creation

 ✅Paste retrieval (API & HTML)

 ✅TTL support

 ✅View-count limit

 ✅Deterministic time testing

 ✅Persistent storage

 ✅Deployed on Vercel
