/**
 * Prisma seed script.
 * Run with: yarn prisma:seed
 *
 * Seeds default roles and an admin user.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
  { id: 1, name: 'ADMIN', description: 'Full system access' },
  { id: 2, name: 'USER', description: 'Standard user access' },
];

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password123',
  firstName: 'Admin',
  lastName: 'User',
};

async function main() {
  console.log('🌱 Seeding...\n');

  // ── Roles ──────────────────────────────────
  for (const role of DEFAULT_ROLES) {
    await prisma.roles.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
    console.log(`  ✔ Role: ${role.name}`);
  }

  // ── Admin user ─────────────────────────────
  const existing = await prisma.users.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  });

  if (existing) {
    console.log(`\n  ⏭ Admin "${DEFAULT_ADMIN.email}" already exists — skipping`);
  } else {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    const user = await prisma.users.create({
      data: {
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        firstName: DEFAULT_ADMIN.firstName,
        lastName: DEFAULT_ADMIN.lastName,
      },
      select: { id: true, email: true },
    });

    await prisma.userRoles.create({
      data: { userId: user.id, roleId: 1 },
    });

    console.log(`\n  ✔ Admin created: ${user.email} (${user.id})`);
    console.log(`    Password: ${DEFAULT_ADMIN.password}`);
  }

  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
