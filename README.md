# AI Code Review Assistant

A full-stack AI-powered code review platform built using React.js, Node.js, Express.js, PostgreSQL, and Prisma.

## Features

* JWT-based authentication
* User registration and login
* Paste code for review
* Upload source code files
* Static JavaScript code analysis using ESLint
* AI-powered code review integration
* Complexity analysis
* Review history
* Search and filter reviews
* Delete reviews
* Detailed code review reports
* Clean and responsive dashboard UI

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT
* ESLint

### Database

* PostgreSQL
* Prisma ORM

## Project Structure

```text
ai-code-review/
├── frontend/
└── backend/
```

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/tamil-2502/ai-code-review.git
cd ai-code-review
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Update the database connection:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the backend server:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Future Enhancements

* GitHub repository integration
* Advanced AI code suggestions
* Support for multiple programming languages
* Code quality score improvements
* Cloud deployment
* Enhanced analytics dashboard
