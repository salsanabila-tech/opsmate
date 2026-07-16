import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);
const nodeEnv = process.env.NODE_ENV ?? 'development';
const databaseUrl = process.env.DATABASE_URL;
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const jwtRefreshExpiresInDays = Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? 7);

if (!jwtAccessSecret) {
  throw new Error('JWT_ACCESS_SECRET wajib tersedia');
}

if (!jwtRefreshSecret) {
  throw new Error('JWT_REFRESH_SECRET wajib tersedia');
}

if (jwtAccessSecret === jwtRefreshSecret) {
  throw new Error('JWT_ACCESS_SECRET dan JWT_REFRESH_SECRET harus berbeda');
}

if (Number.isNaN(port)) {
  throw new Error('PORT harus berupa angka');
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL wajib tersedia');
}

export const env = {
  port,
  nodeEnv,
  databaseUrl,
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn,
  jwtRefreshExpiresInDays,
};