// lib/prisma.ts
//
// WHY THIS FILE EXISTS:
// In development, Next.js hot-reloads your code on every save.
// Without this, every reload would create a NEW database connection,
// and you'd quickly run out of connections. This pattern stores one
// PrismaClient on the global object so hot-reloads reuse it.
//
// NOTE: PrismaClient is only available after running `npx prisma generate`.
// The require() call here avoids TypeScript errors before generation.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClientType = any;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

const prisma: PrismaClientType = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
