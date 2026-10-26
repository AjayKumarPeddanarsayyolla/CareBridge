
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
    try {
        await prisma.$connect();
        console.log('SUCCESS: PostgreSQL connection established.');

        await prisma.$queryRaw`SELECT 1`;
        console.log('SUCCESS: Database query executed.');
    } catch (error) {
        console.error('FAILED: PostgreSQL connection or query failed.');
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();
