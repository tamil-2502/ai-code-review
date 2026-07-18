# AI Code Review Assistant

Full-stack internship project using React, Node.js, Express.js, PostgreSQL and Prisma.

## Features
- JWT authentication
- Register / Login
- Paste code and upload source files
- Static JavaScript analysis
- AI review integration through OpenAI-compatible API
- Complexity analysis
- Review history
- Search, filter, delete and detailed reports
- Clean dashboard UI

## Setup

### 1. Backend
```bash
cd backend
npm install
```

Create `.env` from `.env.example`.

Create PostgreSQL database and update:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_code_review"
```

Then:
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
