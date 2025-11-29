# LeaveFlow - Employee Leave Management System

A modern, full-stack Employee Leave Management System built with Next.js, featuring role-based access control, leave workflows, and comprehensive dashboards.

## Features

### Employee Features
- Register and login with email verification
- Apply for leave (Sick, Casual, Vacation)
- View leave balance and history
- Cancel pending leave requests
- Personal dashboard with statistics and charts
- Profile management

### Manager Features
- Review pending leave requests
- Approve or reject leaves with comments
- View all employee leave history
- Team-level dashboard with analytics
- Filter and search capabilities

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand with persistence
- **Charts**: Recharts
- **Authentication**: JWT-based with HTTP-only cookies
- **Backend**: Next.js API Routes
- **Database**: MongoDB (with Mongoose schemas provided)

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (optional - demo uses in-memory storage)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | john@company.com | any 6+ chars |
| Manager | sarah@company.com | any 6+ chars |

## Environment Variables

\`\`\`env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key

# MongoDB (optional)
MONGODB_URI=mongodb://localhost:27017/leave-management

# Email Service (optional)
RESEND_API_KEY=your-resend-api-key
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/me\` - Get current user
- \`POST /api/auth/verify-email\` - Verify email
- \`POST /api/auth/logout\` - Logout

### Leaves (Employee)
- \`POST /api/leaves\` - Apply for leave
- \`GET /api/leaves/my-requests\` - Get my leave requests
- \`DELETE /api/leaves/:id\` - Cancel pending request
- \`GET /api/leaves/balance\` - Get leave balance

### Leaves (Manager)
- \`GET /api/leaves/all\` - Get all requests (with filters)
- \`GET /api/leaves/pending\` - Get pending requests
- \`PUT /api/leaves/:id/approve\` - Approve request
- \`PUT /api/leaves/:id/reject\` - Reject request

### Dashboard
- \`GET /api/dashboard/employee\` - Employee stats
- \`GET /api/dashboard/manager\` - Manager/team stats

## Database Schema

### Users
- id, name, email, password (hashed)
- role (employee | manager)
- isEmailVerified
- leaveBalance (sickLeave, casualLeave, vacation)
- timestamps

### LeaveRequests
- id, userId (FK)
- leaveType (sick | casual | vacation)
- startDate, endDate, totalDays
- reason, status, managerComment
- timestamps

### Notifications
- id, userId (FK)
- title, message, type, isRead
- timestamps

## Leave Policies

- **Sick Leave**: 10 days/year
- **Casual Leave**: 5 days/year  
- **Vacation**: 5 days/year
- Half-day leaves supported (0.5 days)
- Same-day and future-dated leaves allowed

## Project Structure

\`\`\`
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Auth pages
│   ├── employee/         # Employee pages
│   └── manager/          # Manager pages
├── components/
│   ├── auth/             # Auth components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/
│   ├── auth.ts           # JWT utilities
│   ├── email.ts          # Email utilities
│   ├── store.ts          # Zustand stores
│   └── types.ts          # TypeScript types
└── scripts/
    └── mongodb-schema.js # Database setup
\`\`\`

## License

MIT
