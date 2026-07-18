import { createHash } from 'node:crypto';
import { SignJWT } from 'jose';
import type { UserRole } from '../generated/prisma/client.js';
import { env } from '../config/env.js';

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'opsmate-api';
const JWT_AUDIENCE = 'opsmate-mobile';

const accessSecret = new TextEncoder().encode(env.jwtAccessSecret);

const refreshSecret = new TextEncoder().encode(env.jwtRefreshSecret);

type AccessTokenInput = {
  userId: string;
  role: UserRole;
  sessionId: string;
};

type RefreshTokenInput = {
  userId: string;
  sessionId: string;
};

export async function createAccessToken(input: AccessTokenInput): Promise<string> {
  return new SignJWT({
    role: input.role,
    sessionId: input.sessionId,
    tokenType: 'access',
  })
    .setProtectedHeader({
      alg: JWT_ALGORITHM,
      typ: 'JWT',
    })
    .setSubject(input.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(env.jwtAccessExpiresIn)
    .sign(accessSecret);
}

export async function createRefreshToken(input: RefreshTokenInput): Promise<string> {
  return new SignJWT({
    sessionId: input.sessionId,
    tokenType: 'refresh',
  })
    .setProtectedHeader({
      alg: JWT_ALGORITHM,
      typ: 'JWT',
    })
    .setSubject(input.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setJti(input.sessionId)
    .setExpirationTime(`${env.jwtRefreshExpiresInDays}d`)
    .sign(refreshSecret);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
