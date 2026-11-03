import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Determine database type from environment or fallback to PostgreSQL
const dbUrl = process.env.DATABASE_URL || '';
const isMysql = dbUrl.startsWith('mysql://');

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Database connectivity healthcheck helper
export async function testDbConnection() {
  try {
    if (isMysql) {
      await prisma.$queryRaw`SELECT 1 as connected;`;
    } else {
      await prisma.$queryRaw`SELECT 1 as connected;`;
    }
    return { success: true, dialect: isMysql ? 'MySQL' : 'PostgreSQL' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default prisma;
