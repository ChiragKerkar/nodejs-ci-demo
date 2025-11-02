import { PrismaClient } from '../generated/client/index.js';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  await prisma.user.createMany({
    data: [
      {
        name: 'Chirag',
        email: 'chirag@example.com',
        password: await bcrypt.hash("password123", 10),
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash("password123", 10),
      },
    ],
  });

  console.log('✅ Users seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
