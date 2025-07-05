# Personal Finance Tracker

A modern web application built with Next.js 13+ that helps you track your personal finances, including income, expenses, payables, and receivables. The application features Google Authentication to ensure your financial data remains private and secure.

## Getting Started

## Features

- 🔐 Secure Google Authentication
- 📊 Dashboard with financial overview
- 💰 Track income and expenses
- 📅 Manage payables and receivables
- 📱 Responsive design for all devices

## Prerequisites

- Node.js 16.8 or later
- MongoDB database
- Google OAuth credentials

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd personal-finance-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

- Copy `.env.example` to `.env`
- Update the following variables in `.env`:
  - `DATABASE_URL`: Your MongoDB connection string
  - `NEXTAUTH_URL`: Your application URL (use `http://localhost:3000` for development)
  - `NEXTAUTH_SECRET`: Generate a random string for session encryption
  - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
  - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

4. Set up Google OAuth:

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project or select an existing one
- Enable the Google OAuth API
- Configure the OAuth consent screen
- Create OAuth 2.0 credentials (Web application type)
- Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://your-domain.com/api/auth/callback/google` (production)

5. Initialize the database:

```bash
npx prisma generate
npx prisma db push
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technologies Used

- [Next.js 13+](https://nextjs.org) - React framework
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [MongoDB](https://mongodb.com) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling

## Deployment

This application can be deployed to any platform that supports Next.js applications. We recommend using [Vercel](https://vercel.com) for the easiest deployment experience.

1. Push your code to a Git repository
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

## Security

This application implements several security measures:

- All routes are protected and require authentication
- Google OAuth for secure authentication
- Database credentials and secrets are properly encrypted
- Session management with NextAuth.js
- CSRF protection
- Secure HTTP headers
