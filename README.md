# ThreadBlog — A Fullstack Blogging Platform

## Live Demo
- **Frontend:** https://your-app.vercel.app *(update after deployment)*
- **Backend API:** https://threadblog-api.onrender.com *(update after deployment)*

---

## Project Description

ThreadBlog is a fullstack blogging platform where users can write rich posts with optional images or GIFs, browse a community feed, and search content by keyword. It demonstrates a complete CRUD application with JWT-based authentication, Google OAuth, Cloudinary media uploads, PostgreSQL full-text search, and per-user API rate limiting.

---

## Database Schema

```
┌─────────────────────────────────┐       ┌──────────────────────────────────────┐
│             users               │       │               posts                  │
├─────────────────────────────────┤       ├──────────────────────────────────────┤
│ id           SERIAL PK          │──┐    │ id           SERIAL PK               │
│ name         VARCHAR(100)       │  └───►│ user_id      INTEGER FK → users.id   │
│ email        VARCHAR(255) UNIQUE│       │ title        VARCHAR(255)            │
│ password_hash TEXT              │       │ content      TEXT                    │
│ google_id    VARCHAR(255) UNIQUE│       │ media_url    TEXT (Cloudinary URL)   │
│ avatar_url   TEXT               │       │ created_at   TIMESTAMPTZ             │
│ created_at   TIMESTAMPTZ        │       │ updated_at   TIMESTAMPTZ             │
└─────────────────────────────────┘       └──────────────────────────────────────┘
```

### DDL

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  google_id     VARCHAR(255) UNIQUE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  content    TEXT        NOT NULL,
  media_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for full-text search performance
CREATE INDEX posts_fts_idx
  ON posts USING GIN (to_tsvector('english', title || ' ' || content));
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/google` | No | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/posts` | No | Get all posts (newest first) |
| GET | `/api/posts/search?q=keyword` | No | Search posts by keyword |
| GET | `/api/posts/:id` | No | Get a single post |
| POST | `/api/posts` | Yes | Create a new post |
| PUT | `/api/posts/:id` | Yes | Edit a post (owner only) |
| DELETE | `/api/posts/:id` | Yes | Delete a post (owner only) |
| GET | `/api/users/:id` | No | Get user profile + their posts |

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- A Supabase project (or any PostgreSQL database)
- A Cloudinary account (free tier)
- Google Cloud Console project with OAuth 2.0 credentials

### 1. Clone the repo

```bash
git clone https://github.com/your-username/threadblog.git
cd threadblog
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `JWT_SECRET` | Any long random string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `http://localhost:5000/api/auth/google/callback` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `PORT` | `5000` (default) |
| `CLIENT_URL` | `http://localhost:5173` (dev) |

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Run the seed file

From inside the `backend/` folder:

```bash
cd backend
node seed.js
```

This creates the `users` and `posts` tables and inserts 3 seed users and 12 posts.

Seed credentials (all use the password `password123`):
- `alice@example.com`
- `bob@example.com`
- `clara@example.com`

### 5. Start the backend

```bash
cd backend
npm run dev      # development (nodemon)
# or
npm start        # production
```

The API will be available at `http://localhost:5000`.

### 6. Install and start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

### Backend → Render

1. Create a free account at [render.com](https://render.com)
2. New → Web Service → connect your GitHub repo
3. **Root directory:** `backend`
4. **Build command:** `npm install`
5. **Start command:** `node index.js`
6. Add all `.env` variables in the **Environment** tab
7. Copy your Render URL (e.g. `https://threadblog-api.onrender.com`)

### Frontend → Vercel

1. Create a free account at [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. **Root directory:** `frontend`
4. Add environment variable: `VITE_API_URL` = your Render URL
5. Deploy

### CORS

Update `backend/index.js` to add your Vercel URL to the allowed origins:

```js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app'   // ← your actual Vercel URL
  ],
  credentials: true
}));
```

### Google OAuth callback URL

In Google Cloud Console → Credentials → your OAuth client, add:
- `http://localhost:5000/api/auth/google/callback` (development)
- `https://threadblog-api.onrender.com/api/auth/google/callback` (production)

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST `/api/auth/register` | 10 per hour per IP |
| POST `/api/auth/login` | 10 per 15 minutes per IP |
| POST `/api/posts` | 20 per hour per user |
| All other routes | 100 per 15 minutes per IP |

---

## Known Limitations / Future Improvements

- Comments on posts are not yet implemented
- No pagination on the feed (all posts are loaded at once)
- No image deletion from Cloudinary when a post is deleted
- No email verification on registration
- Post editing does not allow removing existing media without replacing it
