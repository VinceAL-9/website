# PSSE Organization Website

Welcome to the Philippine Society of Software Engineers (PSSE) website repository! This is a monorepo containing both the React frontend and the NestJS backend.

This guide will help you set up the project on your local machine for development in under 30 minutes.

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (or a cloud provider like [Neon.tech](https://neon.tech/))
- A **Cloudinary** account (for image uploads)
- A **Resend** account (for sending emails, optional for basic local dev but needed for full auth flow)

---

## 🚀 Quick Start Guide

Follow these steps to get both the backend and frontend running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/PSSE-Website.git
cd PSSE-Website
```

### 2. Backend Setup (`/psse-backend`)

The backend is built with NestJS and uses Prisma ORM with PostgreSQL.

**Step 2.1: Install Dependencies**
```bash
cd psse-backend
npm install
```

**Step 2.2: Environment Variables**
Copy the example environment file and update the values.
```bash
cp .env.example .env
```
Open `.env` and fill in the following crucial details:
- `DATABASE_URL` and `DIRECT_URL`: Your PostgreSQL connection string.
- `JWT_SECRET` and `JWT_REFRESH_SECRET`: Generate some random strings for your local dev.
- `CLOUDINARY_*`: Your Cloudinary API keys.
- `MAIL_*`: Your Resend SMTP credentials (if you need to test email sending).

**Step 2.3: Database Setup**
Run Prisma migrations to set up your database schema.
```bash
npx prisma migrate dev
```
*(Optional) If you have a seed script defined in `prisma/seed.ts`, run `npx prisma db seed` to populate initial data.*

**Step 2.4: Start the Backend Server**
```bash
npm run start:dev
```
The backend should now be running at `http://localhost:3000`. You can view the Swagger API documentation at `http://localhost:3000/api`.

---

### 3. Frontend Setup (`/psse-react`)

The frontend is a modern React application built with Vite and Tailwind CSS.

Open a **new terminal tab/window** from the root of the repository.

**Step 3.1: Install Dependencies**
```bash
cd psse-react
npm install
```

**Step 3.2: Environment Variables**
Copy the example environment file.
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` in your `.env` points to your local backend (it defaults to `http://localhost:3000/`).

**Step 3.3: Start the Frontend Server**
```bash
npm run dev
```
The frontend should now be running at `http://localhost:5173`.

---

## 🎉 You're all set!

You now have the PSSE website running locally. 

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api
- **Prisma Studio (DB GUI):** Run `npx prisma studio` inside `psse-backend`

---

## 🧪 Testing

The project uses robust testing frameworks to ensure code quality across the stack.

### Backend Testing
The backend utilizes **Jest** for testing.
- **Unit Tests:** Focus on isolated business logic.
- **Integration Tests:** Test full controller-to-database flows with mocked external dependencies.

### Frontend Testing
The frontend utilizes **Storybook** for component-driven development and visual testing, coupled with **Vitest** and **Playwright** for component testing, and **MSW** (Mock Service Worker) for mocking API requests.

---

## 📚 Useful Commands

### Backend (`/psse-backend`)
- `npm run start:dev` - Start development server with hot-reload
- `npm run format` - Format code using Prettier
- `npm run lint` - Run ESLint
- `npm run test:unit` - Run unit tests (Jest)
- `npm run test:integration` - Run integration tests (Jest)
- `npx prisma migrate dev` - Create and apply a new migration
- `npx prisma studio` - Open the Prisma visual database browser

### Frontend (`/psse-react`)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run storybook` - Start Storybook for UI component testing
- `npm run all-prechecks` - Run linting, Storybook build, and application build
