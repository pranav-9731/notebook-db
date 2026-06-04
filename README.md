# Notice Board

A full-stack notice board application built with **Next.js (Pages Router)**, **Prisma**, **MySQL (TiDB Cloud)**, and **Tailwind CSS**. Supports full CRUD — create, read, update, and delete notices — with server-side validation, Urgent-first sorting, and a responsive UI.

---

## Live Demo

**Vercel URL:** 

---

## Features

-  **List all notices** — responsive card grid, phone and desktop
- **Create & edit** — single form used for both, pre-fills on edit
- **Delete with confirmation** — modal prompt before any deletion
- **Urgent-first ordering** — sorted in the database via `Prisma orderBy`, never in the browser
- **Urgent badge** — red visual indicator on urgent notices
- **Server-side validation** — API routes validate all required fields
- **Deployed on Vercel** with a hosted MySQL database (TiDB Cloud)

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 14, Pages Router |
| Language | TypeScript |
| Database ORM | Prisma |
| Database | TiDB Cloud (MySQL-compatible, free tier) |
| Styling | Tailwind CSS |
| Hosting | Vercel (Hobby tier) |

---

## Project Structure

```
noticeboard/
├── components/
│   ├── NoticeCard.tsx      # Single notice card with Edit / Delete
│   ├── NoticeForm.tsx      # Create & edit form (shared)
│   ├── ConfirmDialog.tsx   # Delete confirmation modal
│   └── Modal.tsx           # Generic modal wrapper
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   └── types.ts            # Shared TypeScript types
├── pages/
│   ├── api/
│   │   └── notices/
│   │       ├── index.ts    # GET (list) · POST (create)
│   │       └── [id].ts     # GET (one) · PUT (update) · DELETE
│   ├── _app.tsx
│   └── index.tsx           # Main notice board page
├── prisma/
│   └── schema.prisma       # Database schema
├── .env.local.example      # Environment variable template
└── README.md
```

---

## How to Run Locally

### 1. Prerequisites

- Node.js 18+
- A free [TiDB Cloud](https://tidbcloud.com) account (or Neon / Supabase)

### 2. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/noticeboard.git
cd noticeboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your DATABASE_URL from TiDB Cloud:

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/noticeboard?ssl-mode=VERIFY_IDENTITY"
```

### 5. Generate Prisma client and push schema to database

```bash
npx prisma generate
npx prisma db push
```

### 6. Start the development server

```bash
npm run dev
```

Open http://localhost:3000

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | /api/notices | Fetch all notices (urgent first) |
| POST | /api/notices | Create a new notice |
| GET | /api/notices/:id | Fetch a single notice |
| PUT | /api/notices/:id | Update an existing notice |
| DELETE | /api/notices/:id | Delete a notice |

All mutation routes run server-side validation. Invalid requests return 422 with an errors map.

---

## One Thing I Would Improve With More Time

**Image upload instead of image URL input.** Currently the form accepts an image URL. With more time, I would add direct file upload to Cloudinary or Vercel Blob — much better UX since users don't need to host images themselves. I would also add pagination to handle large notice volumes.

---

## Lisence: 

**MIT**
