import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default user…');

  const hashed = await bcrypt.hash('changeme', 10);

  await prisma.user.upsert({
    where: { email: 'john@foo.com' },
    update: {},
    create: {
      email: 'john@foo.com',
      name: 'John Foo',
      hashedPassword: hashed,
      role: 'MANAGER', // matches the Role enum in your schema
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
