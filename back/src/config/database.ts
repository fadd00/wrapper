/**
 * Prisma database client
 */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Disconnect from database
 */
export async function disconnect() {
  await prisma.$disconnect();
}
