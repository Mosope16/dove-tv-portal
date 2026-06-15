# Dove TV IT Portal

A full-scale broadcast network Operations Management System featuring studio booking, equipment checkout, and shift management.

## 🚀 Features

- **Studio Booking**: Manage studio availability and reservations.
- **Inventory Management**: Track and checkout broadcast equipment.
- **Roster & Shift Management**: Manage staff schedules, rosters, and shifts.
- **Faults & Requests**: Log equipment faults and handle internal IT requests.
- **Role-Based Access Control**: Secure authentication and user role management.
- **Automated Printing**: Print request forms, inventory logs, and more.

## 💻 Tech Stack

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router)
- **Frontend**: React, [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Emails**: [Resend](https://resend.com/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Clerk Account (for authentication)
- Resend API Key (for emails)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mosope16/dove-tv-portal.git
   cd dove-tv-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   Create a `.env` file in the root directory and add the following keys:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dove_tv_portal?schema=public"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Resend Email
   RESEND_API_KEY=your_resend_api_key
   ```

4. Run database migrations:
   ```bash
   npx prisma db push
   # or 
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

- `/src/app` - Next.js App Router (pages, layouts, API routes).
- `/src/components` - Reusable UI components.
- `/src/lib` - Utility functions, Prisma client, and external service configurations.
- `/prisma` - Prisma schema definitions for the PostgreSQL database.
