
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './config/prisma.js';

const accounts = [
    { email: 'admin@carebridge.com', password: 'Admin_CB#2026!' },
    { email: 'dr.sarah@carebridge.com', password: 'Doctor_CB#2026!' },
    { email: 'john.doe@carebridge.com', password: 'Patient_CB#2026!' },
    { email: 'mary.doe@carebridge.com', password: 'Family_CB#2026!' },
];

async function main() {
    for (const account of accounts) {
        const user = await prisma.user.findUnique({
            where: { email: account.email },
            select: { id: true, email: true },
        });

        if (!user) {
            console.log(`NOT FOUND: ${account.email}`);
            continue;
        }

        const passwordHash = await bcrypt.hash(account.password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        console.log(`PASSWORD UPDATED: ${account.email}`);
    }

    console.log('Finished processing existing demo accounts.');
}

main()
    .catch((error) => {
        console.error('Password update failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
