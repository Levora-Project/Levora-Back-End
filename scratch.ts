import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.time('connect');
  await prisma.$connect();
  console.timeEnd('connect');

  console.time('query 1');
  await prisma.$queryRaw`SELECT 1`;
  console.timeEnd('query 1');

  console.time('query 2');
  await prisma.$queryRaw`SELECT 1`;
  console.timeEnd('query 2');
}
main();
