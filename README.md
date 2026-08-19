# 📅 Shared Collaborative Calendar Web App

A modern, real-time, production-ready shared collaborative calendar built with **React 18**, **Vite**, **TypeScript**, **FullCalendar**, **Tailwind CSS**, and **Firebase** (Firestore + Anonymous/Google Auth).

Designed to serve as a **single source of truth** across all browsers, mobile devices, and computers with instant real-time synchronization.

---

## ✨ Features

- 📆 **FullCalendar Month, Week & Day Views**: Interactive grid layout powered by `@fullcalendar/react`.
- ⚡ **Instant Real-Time Sync**: Powered by Firestore `onSnapshot` listeners. Changes made by any user reflect live on all open screens.
- 🎨 **Category-Coded Events**: Work (Blue), Personal (Emerald), Meeting (Purple), Other (Amber) with instant filtering.
- ➕ **Full Event CRUD**: Click any date/time slot to create an event; click an existing event to view, edit, or delete it.
- 🖐️ **Drag-and-Drop & Resizing**: Drag events across dates or drag time boundaries to update Firestore timestamps live.
- 👤 **Anonymous & Google Authentication**: Automatic anonymous user session with optional Google Sign-In and customizable display names.
- 📱 **Mobile & Touch Friendly**: Fluid responsive layout with backdrop glassmorphism and touch controls.
- 🧪 **One-Click Data Seeding**: Built-in seed helper to inject sample events for testing.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Calendar Engine**: FullCalendar v6 (`dayGridMonth`, `timeGridWeek`, `timeGridDay`, `interaction`)
- **Backend / Real-time DB**: Firebase Firestore (`events` collection)
- **Authentication**: Firebase Authentication (Anonymous + Google Auth)
- **Deployment**: Firebase Hosting (`firebase.json`, `.firebaserc`)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/eveamram/calender.github.io.git
cd calender.github.io
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔥 Firebase Setup Guide (Step-by-Step)

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and give your project a name (e.g., `shared-calendar`).
3. Click **Continue** and create the project.

### Step 2: Enable Firestore Database
1. In the left sidebar, navigate to **Build** -> **Firestore Database**.
2. Click **Create Database**.
3. Choose your database location and select **Start in test mode** for initial development.
4. Click **Enable**.

### Step 3: Enable Authentication
1. Navigation to **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**:
   - Enable **Anonymous** auth (required for instant guest participation).
   - Enable **Google** auth (optional for verified identity).

### Step 4: Register Web App & Get Config
1. In Project Settings (gear icon top left) -> **General**, scroll to **Your apps**.
2. Click the **Web (`</>`)** icon.
3. Register app name `Shared Calendar` and copy the configuration keys into your local `.env` file.

---

## 🌐 Deploying to Firebase Hosting

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Build & Deploy
```bash
npm run build
firebase deploy --only hosting
```

Your web application will be live at `https://your-project-id.web.app`!

---

## 🔒 Recommended Firestore Security Rules

### Development / Test Rules (Open Access):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if true;
    }
  }
}
```

### Production Locked-Down Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      // Any authenticated user (Anonymous or Google) can read & write
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.title is string
                    && request.resource.data.start is string;
      allow update, delete: if request.auth != null;
    }
  }
}
```

---

## 📄 Data Schema (Firestore `events` Collection)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Firestore Auto Document ID |
| `title` | String | Event Title |
| `start` | String / Timestamp | Start DateTime (ISO 8601 string) |
| `end` | String / Timestamp | End DateTime (ISO 8601 string) |
| `category` | String | `'Work'` \| `'Personal'` \| `'Meeting'` \| `'Other'` |
| `color` | String | Category HEX Color Code |
| `description` | String | Optional Notes / Details |
| `createdBy` | String | Author Display Name / Anonymous |
| `createdAt` | Timestamp | Server creation timestamp |
| `updatedAt` | Timestamp | Server update timestamp |
