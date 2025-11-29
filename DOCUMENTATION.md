# LeaveFlow - Employee Leave Management System

## Complete Technical Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [How It Works (Demo Mode vs Production)](#3-how-it-works)
4. [Database Design](#4-database-design)
5. [Authentication System](#5-authentication-system)
6. [API Reference](#6-api-reference)
7. [Frontend Structure](#7-frontend-structure)
8. [State Management](#8-state-management)
9. [Deployment Guide](#9-deployment-guide)
10. [Switching to Production MongoDB](#10-switching-to-production-mongodb)

---

## 1. Project Overview

### What is LeaveFlow?

LeaveFlow is a full-stack Employee Leave Management System that enables:
- **Employees** to apply for leaves, track their requests, and manage their leave balance
- **Managers** to approve/reject leave requests and monitor team leave usage

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| State Management | Zustand (with persistence) |
| Charts | Recharts |
| Authentication | JWT (JSON Web Tokens) |
| Database (Production) | MongoDB with Mongoose |
| Database (Demo) | In-memory Zustand stores |

---

## 2. Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Next.js)                  │
├─────────────────────────────────────────────────────────────────┤
│  Pages                    │  Components                          │
│  ├── /login              │  ├── auth/ (login-form, register)    │
│  ├── /employee/*         │  ├── layout/ (sidebar, header)       │
│  │   ├── dashboard       │  ├── ui/ (status-badge, stat-card)   │
│  │   ├── apply-leave     │  └── charts/ (leave-chart)           │
│  │   ├── my-requests     │                                       │
│  │   ├── profile         │  State (Zustand)                      │
│  │   └── notifications   │  ├── useAuthStore                     │
│  └── /manager/*          │  ├── useLeaveStore                    │
│      ├── dashboard       │  └── useNotificationStore             │
│      ├── pending-requests│                                       │
│      └── all-requests    │                                       │
├─────────────────────────────────────────────────────────────────┤
│                        API ROUTES (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  /api/auth/*             │  /api/leaves/*      │  /api/dashboard/*│
│  ├── register            │  ├── POST (apply)   │  ├── employee    │
│  ├── login               │  ├── my-requests    │  └── manager     │
│  ├── logout              │  ├── all                              │
│  ├── verify-email        │  ├── pending        │  /api/notifications│
│  └── me                  │  ├── balance        │  └── /api/profile │
│                          │  └── [id]/approve   │                   │
│                          │  └── [id]/reject    │                   │
├─────────────────────────────────────────────────────────────────┤
│                        DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Demo Mode: Zustand in-memory storage with localStorage persist  │
│  Production: MongoDB with Mongoose ODM                           │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 3. How It Works

### Current Mode: DEMO (In-Memory Storage)

The application is currently running in **Demo Mode**, which means:

#### How Data is Stored

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client-Side)                     │
├─────────────────────────────────────────────────────────────┤
│  localStorage                                                │
│  ├── "auth-storage"     → User session data                 │
│  ├── "leave-storage"    → All leave requests                │
│  └── "notification-storage" → All notifications             │
├─────────────────────────────────────────────────────────────┤
│  Zustand Stores (React State)                               │
│  ├── useAuthStore       → Login/logout, user profile        │
│  ├── useLeaveStore      → CRUD for leave requests           │
│  └── useNotificationStore → Notification management         │
└─────────────────────────────────────────────────────────────┘
\`\`\`

#### Demo Mode Characteristics

| Feature | Behavior |
|---------|----------|
| Data Persistence | Stored in browser's localStorage |
| Data Sharing | Data is per-browser (not shared between users) |
| API Routes | Exist but return mock responses |
| Server State | All state managed client-side via Zustand |
| Best For | Testing, demos, development |

#### Pre-loaded Demo Data

The system comes with pre-configured demo data:

**Demo Users:**
| Name | Email | Role | Email Verified |
|------|-------|------|----------------|
| John Employee | john@company.com | employee | Yes |
| Sarah Manager | sarah@company.com | manager | Yes |
| Mike Developer | mike@company.com | employee | Yes |
| Emily Designer | emily@company.com | employee | No |

**Demo Leave Requests:**
- John's approved sick leave (Dec 10-11)
- John's pending vacation request (Dec 24-26)
- Mike's pending half-day casual leave (Dec 15)
- Mike's approved sick leave (Nov 20-22)
- John's rejected casual leave (Oct 5)

### When Published to Vercel

When you click "Publish" in v0:

1. **Frontend** is deployed as static/server-rendered pages
2. **API Routes** are deployed as serverless functions
3. **State** still uses Zustand with localStorage (demo mode)
4. **No database** is connected by default

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL DEPLOYMENT                        │
├─────────────────────────────────────────────────────────────┤
│  Edge Network (CDN)                                          │
│  └── Static assets, pre-rendered pages                       │
├─────────────────────────────────────────────────────────────┤
│  Serverless Functions                                        │
│  └── /api/* routes (currently returning mock data)           │
├─────────────────────────────────────────────────────────────┤
│  Client-Side State                                           │
│  └── Zustand stores with localStorage persistence            │
│                                                              │
│  ⚠️ Each user has their own isolated localStorage            │
│  ⚠️ Data doesn't sync between different browsers/users       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 4. Database Design

### Schema Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
├─────────────────────────────────────────────────────────────┤
│ _id            │ ObjectId (auto)                            │
│ name           │ String, required                           │
│ email          │ String, unique, required                   │
│ password       │ String, hashed (bcrypt)                    │
│ role           │ "employee" | "manager"                     │
│ isEmailVerified│ Boolean                                    │
│ verificationToken │ String (for email verification)        │
│ leaveBalance   │ {                                          │
│                │   sickLeave: Number (default: 10)          │
│                │   casualLeave: Number (default: 5)         │
│                │   vacation: Number (default: 5)            │
│                │ }                                          │
│ createdAt      │ Date (auto)                                │
│ updatedAt      │ Date (auto)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ userId (FK)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     LEAVE_REQUESTS                           │
├─────────────────────────────────────────────────────────────┤
│ _id            │ ObjectId (auto)                            │
│ userId         │ ObjectId (ref: Users)                      │
│ leaveType      │ "sick" | "casual" | "vacation"             │
│ startDate      │ Date                                       │
│ endDate        │ Date                                       │
│ totalDays      │ Number (min: 0.5 for half-days)            │
│ reason         │ String                                     │
│ status         │ "pending" | "approved" | "rejected"        │
│ managerComment │ String (optional)                          │
│ createdAt      │ Date (auto)                                │
│ updatedAt      │ Date (auto)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ userId (FK)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     NOTIFICATIONS                            │
├─────────────────────────────────────────────────────────────┤
│ _id            │ ObjectId (auto)                            │
│ userId         │ ObjectId (ref: Users)                      │
│ title          │ String                                     │
│ message        │ String                                     │
│ type           │ "leave_applied" | "leave_approved" |       │
│                │ "leave_rejected" | "info"                  │
│ isRead         │ Boolean                                    │
│ createdAt      │ Date (auto)                                │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### TypeScript Types (lib/types.ts)

\`\`\`typescript
type UserRole = "employee" | "manager"
type LeaveType = "sick" | "casual" | "vacation"
type LeaveStatus = "pending" | "approved" | "rejected"

interface LeaveBalance {
  sickLeave: number   // Default: 10 days
  casualLeave: number // Default: 5 days
  vacation: number    // Default: 5 days
}

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isEmailVerified: boolean
  leaveBalance: LeaveBalance
  createdAt: string
  updatedAt: string
}

interface LeaveRequest {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  managerComment?: string
  createdAt: string
  updatedAt: string
}
\`\`\`

---

## 5. Authentication System

### JWT Flow

\`\`\`
┌──────────┐     1. Login Request      ┌──────────┐
│  Client  │ ─────────────────────────▶│  Server  │
│ (Browser)│  { email, password }      │ (API)    │
└──────────┘                           └──────────┘
     │                                      │
     │                                      │ 2. Validate credentials
     │                                      │    Generate JWT
     │                                      ▼
     │         3. Set HTTP-only Cookie  ┌──────────┐
     │◀─────────────────────────────────│   JWT    │
     │         auth-token=<jwt>         │  Token   │
     │                                  └──────────┘
     │
     │  4. Subsequent requests include cookie
     │─────────────────────────────────────────────▶
     │     Cookie: auth-token=<jwt>
\`\`\`

### JWT Token Structure

\`\`\`javascript
// Payload (lib/auth.ts)
{
  userId: string,
  email: string,
  role: "employee" | "manager",
  isEmailVerified: boolean,
  iat: number,  // Issued at
  exp: number   // Expires (7 days)
}

// Signed with HS256 algorithm
// Secret: JWT_SECRET environment variable
\`\`\`

### Authentication in Demo Mode

In demo mode, authentication is simulated:

\`\`\`javascript
// lib/store.ts - Simplified auth
login: async (email, password) => {
  const user = demoUsers.find(u => u.email === email)
  if (user && password.length >= 6) {
    set({ user, token: "demo-jwt-token", isAuthenticated: true })
    return { success: true }
  }
  return { success: false, error: "Invalid credentials" }
}
\`\`\`

### Role-Based Access Control (RBAC)

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    PERMISSION MATRIX                         │
├─────────────────────────────────────────────────────────────┤
│  Action                    │ Employee │ Manager │           │
├────────────────────────────┼──────────┼─────────┤           │
│  View own dashboard        │    ✓     │    ✓    │           │
│  Apply for leave           │    ✓     │    ✓    │           │
│  View own requests         │    ✓     │    ✓    │           │
│  Cancel pending request    │    ✓     │    ✓    │           │
│  Update profile            │    ✓     │    ✓    │           │
├────────────────────────────┼──────────┼─────────┤           │
│  View all requests         │    ✗     │    ✓    │           │
│  Approve/reject requests   │    ✗     │    ✓    │           │
│  View team dashboard       │    ✗     │    ✓    │           │
│  View employee history     │    ✗     │    ✓    │           │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 6. API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-email` | Verify email |

### Leave Management Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/leaves` | All | Apply for leave |
| GET | `/api/leaves/my-requests` | All | Get user's requests |
| GET | `/api/leaves/balance` | All | Get leave balance |
| DELETE | `/api/leaves/[id]` | Owner | Cancel pending request |
| GET | `/api/leaves/all` | Manager | Get all requests |
| GET | `/api/leaves/pending` | Manager | Get pending requests |
| PUT | `/api/leaves/[id]/approve` | Manager | Approve request |
| PUT | `/api/leaves/[id]/reject` | Manager | Reject request |

### Dashboard Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/employee` | Employee | Employee stats |
| GET | `/api/dashboard/manager` | Manager | Team stats |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user's notifications |
| PUT | `/api/notifications/[id]/read` | Mark as read |
| PUT | `/api/notifications/mark-all-read` | Mark all as read |

---

## 7. Frontend Structure

\`\`\`
app/
├── page.tsx                    # Root redirect to /login
├── login/
│   └── page.tsx               # Login/Register page
├── employee/
│   ├── dashboard/
│   │   └── page.tsx           # Employee dashboard with charts
│   ├── apply-leave/
│   │   └── page.tsx           # Leave application form
│   ├── my-requests/
│   │   └── page.tsx           # Request history table
│   ├── profile/
│   │   └── page.tsx           # Profile management
│   └── notifications/
│       └── page.tsx           # Notification center
└── manager/
    ├── dashboard/
    │   └── page.tsx           # Team dashboard with charts
    ├── pending-requests/
    │   └── page.tsx           # Approve/reject interface
    └── all-requests/
        └── page.tsx           # Full request history

components/
├── auth/
│   ├── login-form.tsx         # Login component
│   └── register-form.tsx      # Registration component
├── layout/
│   ├── sidebar.tsx            # Navigation sidebar
│   ├── header.tsx             # Top header with notifications
│   └── dashboard-layout.tsx   # Main layout wrapper
├── ui/
│   ├── status-badge.tsx       # Pending/Approved/Rejected badge
│   ├── stat-card.tsx          # Dashboard statistic card
│   └── ... (shadcn components)
└── charts/
    └── leave-chart.tsx        # Recharts wrapper
\`\`\`

---

## 8. State Management

### Zustand Stores

\`\`\`javascript
// Three main stores in lib/store.ts

useAuthStore
├── user: User | null
├── token: string | null
├── isAuthenticated: boolean
├── login(email, password)
├── register(name, email, password)
├── logout()
├── verifyEmail(token)
└── updateProfile(data)

useLeaveStore
├── requests: LeaveRequest[]
├── applyLeave(data)
├── cancelLeave(id)
├── approveLeave(id, comment)
├── rejectLeave(id, comment)
├── getMyRequests(userId)
├── getAllRequests()
└── getPendingRequests()

useNotificationStore
├── notifications: Notification[]
├── addNotification(notification)
├── markAsRead(id)
├── markAllAsRead(userId)
└── getUnreadCount(userId)
\`\`\`

### Persistence

All stores use Zustand's `persist` middleware:

\`\`\`javascript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... store logic
    }),
    { name: "auth-storage" }  // localStorage key
  )
)
\`\`\`

---

## 9. Deployment Guide

### Publishing to Vercel (v0)

1. Click the **"Publish"** button in v0
2. The app will be deployed to a `.vercel.app` URL
3. Demo mode will work out of the box

### Manual Deployment

\`\`\`bash
# 1. Clone/download the project
git clone <your-repo>
cd employee-leave-system

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env.local

# 4. Run development server
npm run dev

# 5. Build for production
npm run build

# 6. Deploy to Vercel
vercel --prod
\`\`\`

### Environment Variables

\`\`\`env
# .env.local

# Required
JWT_SECRET=your-super-secret-key-min-32-chars

# Optional (for production database)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/leave-db

# Optional (for email notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Auto-set
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
\`\`\`

---

## 10. Switching to Production MongoDB

### Step 1: Set Up MongoDB Atlas

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://...`
4. Add to environment variables

### Step 2: Install Dependencies

\`\`\`bash
npm install mongoose bcryptjs
npm install -D @types/bcryptjs
\`\`\`

### Step 3: Create Database Models

\`\`\`typescript
// lib/models/User.ts
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
  isEmailVerified: { type: Boolean, default: false },
  leaveBalance: {
    sickLeave: { type: Number, default: 10 },
    casualLeave: { type: Number, default: 5 },
    vacation: { type: Number, default: 5 }
  }
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
\`\`\`

### Step 4: Update API Routes

\`\`\`typescript
// app/api/auth/login/route.ts
import { connectDB } from '@/lib/mongoose'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  await connectDB()
  
  const { email, password } = await req.json()
  
  const user = await User.findOne({ email })
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
  // Generate JWT and set cookie...
}
\`\`\`

### Step 5: Run Schema Setup

\`\`\`bash
# Set MONGODB_URI in .env.local first
node scripts/mongodb-schema.js
\`\`\`

---

## Summary

| Mode | Database | Data Persistence | Multi-User |
|------|----------|------------------|------------|
| **Demo (Current)** | localStorage | Per-browser | No |
| **Production** | MongoDB Atlas | Server-side | Yes |

The application is fully functional in demo mode for testing and demonstrations. To make it production-ready with real multi-user support, connect MongoDB by following Section 10.
