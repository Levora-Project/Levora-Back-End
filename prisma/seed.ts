/**
 * Prisma seed script.
 * Run with: npx prisma db seed
 *
 * Seeds default roles (user, content_admin, system_admin) and initial admin user.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
  { id: 1, name: 'user', description: 'Standard user access' },
  {
    id: 2,
    name: 'content_admin',
    description: 'Content Administrator for managing opportunities',
  },
  {
    id: 3,
    name: 'system_admin',
    description: 'Full system administrator access',
  },
];

const DEFAULT_ADMIN = {
  email: 'admin@levora.app',
  password: 'AdminPassword123!',
  firstName: 'System',
  lastName: 'Admin',
};

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Roles ──────────────────────────────────
  for (const role of DEFAULT_ROLES) {
    await prisma.roles.upsert({
      where: { id: role.id },
      update: { name: role.name, description: role.description },
      create: role,
    });
    console.log(`  ✔ Role: ${role.name} (ID: ${role.id})`);
  }

  // ── Admin user ─────────────────────────────
  const existing = await prisma.users.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  });

  if (existing) {
    console.log(
      `\n  ⏭ Admin "${DEFAULT_ADMIN.email}" already exists — skipping`,
    );
  } else {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    const user = await prisma.users.create({
      data: {
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        firstName: DEFAULT_ADMIN.firstName,
        lastName: DEFAULT_ADMIN.lastName,
        isEmailVerified: true,
        userProfile: {
          create: {
            fullName: `${DEFAULT_ADMIN.firstName} ${DEFAULT_ADMIN.lastName}`,
            isDraft: false,
            completionPct: 100,
          },
        },
      },
      select: { id: true, email: true },
    });

    await prisma.userRoles.create({
      data: { userId: user.id, roleId: 3 }, // system_admin
    });

    console.log(`\n  ✔ Admin created: ${user.email} (${user.id})`);
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
