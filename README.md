# Booklon — Full-Stack Book Reading Platform

Better Books, Bigger Dreams. An Apple-inspired, mobile-first book reading platform built with React 19, TypeScript, Tailwind CSS, Google OAuth authentication, and Firestore.

## 🚀 Key Features

- **Google-Only Authentication**: Zero traditional email/password forms. Real Google OAuth popup account selection (`signInWithPopup`) automatically syncing user profile, photo, and display name.
- **Distraction-Free Mobile Reader**:
  - Full-text reading for public-domain classics and live preview excerpts for searched books.
  - Light, Dark, and Sepia reading themes.
  - Adjustable typography: font sizes, line heights, font families (Serif, Sans, Monospace), and margin sizes.
  - Interactive Table of Contents & chapter navigation.
  - Real-time reading position auto-syncing to Firestore.
  - In-reader Bookmarking and Note-Taking with text highlight capture.
  - Active session timer tracking real reading seconds and pages, automatically pausing when inactive or switching tabs.
- **My Library**:
  - Filter by All, Currently Reading, Want to Read, and Finished.
  - Custom user collections (create, rename, customize color, delete, add/remove books).
  - Search and filter within saved books.
  - Switch between responsive grid and list views.
  - Zero fabricated demo data — genuine empty states for newly authenticated users.
- **Book Discovery & Catalog**:
  - Live search integration via Google Books API with debouncing and error handling.
  - Browse and filter by category (Fiction, Classic, Science Fiction, Mystery, Romance, Philosophy, etc.).
  - Sort by relevance, title, and release date.
- **Reading Statistics & Streaks**:
  - Consecutive day reading streaks calculated from real recorded sessions.
  - Total minutes read and books finished.
  - Weekly 7-day reading trend bar graph.
  - User-configurable Reading Goals (books/year, pages/day, minutes/day) with real progress calculation.
- **Settings & Privacy**:
  - Theme switcher (Dark / Light).
  - Full data export (download complete JSON archive of all personal records).
  - Account deletion with instant database cleanup and secure sign-out.
  - Native Web Share API integration with clipboard fallback.

---

## 🏗️ Architecture & Database Blueprint

```
/users/{userId}              -> User profile & reader typography preferences
/library/{libraryItemId}     -> Saved user library items with reading progress
/collections/{collectionId}  -> Custom user shelves and book mappings
/bookmarks/{bookmarkId}      -> Chapter locations and page markers
/notes/{noteId}              -> Highlighted quotes and personal reflections
/readingSessions/{sessionId} -> Logged active reading time & pages
/readingGoals/{goalId}       -> Reading targets and tracking metrics
```

### Security
Protected by Zero-Trust ABAC Firestore Security Rules (`firestore.rules`):
- All private resources are constrained to `request.auth.uid == resource.data.userId`.
- No blanket reads; list operations enforce relational filtering on `resource.data.userId`.
- Strict volumetric constraints on all string payloads to prevent denial-of-wallet resource attacks.
- Immutable identity keys (`id`, `userId`, `bookId`, `createdAt`).

---

## 🛠️ Local Development & Setup

### 1. Prerequisites
- Node.js 20+
- Google Cloud Project with Firebase Authentication and Firestore enabled

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

### 3. Installation & Run
```bash
npm install
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Google OAuth Configuration & Troubleshooting

### Authorized Domains
In the Firebase Console (Authentication > Settings > Authorized domains), add:
1. `localhost`
2. Your AI Studio App URL domain: `ais-dev-ubet4ddu5uvftrt5kxicgj-258099085911.asia-southeast1.run.app`
3. Your production domain: `ais-pre-ubet4ddu5uvftrt5kxicgj-258099085911.asia-southeast1.run.app`

### Common OAuth Errors & Solutions
- **`auth/popup-blocked`**: The browser blocked the sign-in popup. Enable popups for the application domain in browser site settings.
- **`auth/popup-closed-by-user`**: The user dismissed the Google account chooser before selecting an account. Tap **CONTINUE WITH GOOGLE** again.
- **`auth/unauthorized-domain`**: The host domain is not listed in Authorized Domains under Firebase Console Authentication settings.
