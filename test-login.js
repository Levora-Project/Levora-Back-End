const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.users.findUnique({ where: { email: 'test1@example.com' } });
  console.log(user);
}
main();
