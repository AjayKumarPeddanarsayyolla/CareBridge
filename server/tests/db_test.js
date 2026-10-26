import { prisma } from '../config/prisma.js';

async function testConnection() {
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log(`[DB Test] Success: Connected to PostgreSQL via Prisma. Total Users in DB: ${count}`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[DB Test] Error:', err);
    process.exit(1);
  }
}

testConnection();
