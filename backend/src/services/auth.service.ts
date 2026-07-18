import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { AppError } from '../errors/app-error.js';
import { prisma } from '../lib/prisma.js';
import { createAccessToken, createRefreshToken, hashToken } from './token.service.js';
import { env } from '../config/env.js';

type LoginInput = {
  email: string;
  password: string;
  userAgent: string | null;
  ipAddress: string | null;
};

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'Email atau password salah', 'INVALID_CREDENTIALS');
  }

  const passwordIsValid = await argon2.verify(user.passwordHash, input.password);

  if (!passwordIsValid) {
    throw new AppError(401, 'Email atau password salah', 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError(403, 'Akun Anda tidak aktif. Silakan hubungi administrator.', 'ACCOUNT_INACTIVE');
  }

  const sessionId = randomUUID();

  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken({
      userId: user.id,
      role: user.role,
      sessionId: sessionId,
    }),
    createRefreshToken({
      userId: user.id,
      sessionId,
    }),
  ]);

  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + envRefreshDurationInMilliseconds());

  await prisma.authSessions.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}

function envRefreshDurationInMilliseconds(): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return env.jwtRefreshExpiresInDays * millisecondsPerDay;
}
