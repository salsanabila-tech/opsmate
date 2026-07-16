import dotenv from 'dotenv';
 
dotenv.config();

const port = Number(process.env.PORT ?? 3000);
const nodeEnv = process.env.NODE_ENV ?? 'development';
const databaseUrl = process.env.DATABASE_URL;

if (Number.isNaN(port)) {
  throw new Error("PORT harus berupa angka");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL wajib tersedia");
}

export const env = {
  port,
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL,
};