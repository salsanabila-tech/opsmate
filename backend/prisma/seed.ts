import "dotenv/config";
import * as argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client.js";

function getRequiredEnv(variableName: string): string {
  const value = process.env[variableName];

  if (!value || value.trim() === "") {
    throw new Error(`${variableName} wajib tersedia`);
  }

  return value.trim();
}

const databaseUrl = getRequiredEnv("DATABASE_URL");
const adminName = getRequiredEnv("SEED_ADMIN_NAME");
const adminEmail = getRequiredEnv("SEED_ADMIN_EMAIL");
const adminPassword = getRequiredEnv("SEED_ADMIN_PASSWORD");

if (adminPassword.length < 8) {
  throw new Error("SEED_ADMIN_PASSWORD minimal 8 karakter");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  const normalizedEmail = adminEmail.toLowerCase();
  const passwordHash = await argon2.hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: {
      email: normalizedEmail,
    },

    update: {
      name: adminName,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },

    create: {
      name: adminName,
      email: normalizedEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  console.log("Admin seed berhasil dibuat atau diperbarui:");
  console.table(admin);
}

try {
  await main();
} catch (error: unknown) {
  console.error("Admin seed gagal:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}