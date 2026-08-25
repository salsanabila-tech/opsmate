import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { AppError } from '../errors/app-error.js';
import { prisma } from '../lib/prisma.js';
import { Prisma, UserRole } from '../generated/prisma/client.js';
import { createAccessToken, createRefreshToken, hashToken, tokenHashMatches, verifyRefreshToken } from './token.service.js';
import { env } from '../config/env.js';
import { throwDeprecation } from 'node:process';
import { access } from 'node:fs';

type LoginInput = {
  email: string;
  password: string;
  userAgent: string | null;
  ipAddress: string | null;
};

type RefreshAuthenticationInput = {
  refreshToken: string;
};

type LogoutCurrentSessionInput = {
  userId: string;
  sessionId: string;
};

type RegisterCustomerInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
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

      customerProfile: {
        select: {
          id: true,
        },
      },
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

  const expiresAt = createRefreshTokenExpirationDate();

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

      customerId: user.customerProfile?.id ?? null,

      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshAuthentication(input: RefreshAuthenticationInput) {
  let verifiedToken;

  try {
    verifiedToken = await verifyRefreshToken(input.refreshToken);
  } catch {
    throw new AppError(401, 'Refresh token tidak valid', 'INVALID_REFRESH_TOKEN');
  }

  const now = new Date();

  const session = await prisma.authSessions.findUnique({
    where: {
      id: verifiedToken.sessionId,
    },
    select: {
      id: true,
      userId: true,
      refreshTokenHash: true,
      expiresAt: true,
      revokedAt: true,

      user: {
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      },
    },
  });
  if (!session || session.userId !== verifiedToken.userId) {
    throw new AppError(401, 'Session sudah dicabut', 'SESSION_REVOKED');
  }
  if (session.expiresAt <= now) {
    throw new AppError(401, 'Session sudah kedaluwarsa', 'SESSION_EXPIRED');
  }
  if (!tokenHashMatches(input.refreshToken, session.refreshTokenHash)) {
    throw new AppError(401, 'Refresh token tidak valid atau sudah digunakan', 'REFRESH_TOKEN_REUSED');
  }
  if (!session.user.isActive) {
    await prisma.authSessions.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: now,
      },
    });
    throw new AppError(403, 'Akun sudah dinonaktifkan', 'ACCOUNT_INACTIVE');
  }

  const [newAccessToken, newRefreshToken] = await Promise.all([
    createAccessToken({
      userId: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    }),

    createRefreshToken({
      userId: session.user.id,
      sessionId: session.id,
    }),
  ]);

  const newRefreshTokenHash = hashToken(newRefreshToken);

  const newExpiresAt = createRefreshTokenExpirationDate();

  const updateResult = await prisma.authSessions.updateMany({
    where: {
      id: session.id,
      refreshTokenHash: session.refreshTokenHash,
      revokedAt: null,
      expiresAt: {
        gt: now,
      },
    },

    data: {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: newExpiresAt,
    },
  });

  if (updateResult.count !== 1) {
    throw new AppError(401, 'Refresh token tidak valid atau sudah digunakan', 'REFRESH_TOKEN_REUSED');
  }

  return {
    accessToken: newAccessToken,
    refreshTokenHash: newRefreshToken,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'Pengguna authentication tidak ditemukan', 'AUTHENTICATION_USER_NOT_FOUND');
  }

  return user;
}

export async function logoutCurrentSession(input: LogoutCurrentSessionInput): Promise<void> {
  const revokedAt = new Date();

  const updateResult = await prisma.authSessions.updateMany({
    where: {
      id: input.sessionId,
      userId: input.userId,
      revokedAt: null,
    },
    data: {
      revokedAt,
    },
  });

  if (updateResult.count !== 1) {
    throw new AppError(401, 'Session tidak valid atau sudah dicabut', 'INVALID_SESSION');
  }
}

function refreshDurationInMilliseconds(): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return env.jwtRefreshExpiresInDays * millisecondsPerDay;
}

function createRefreshTokenExpirationDate(): Date {
  return new Date(Date.now() + refreshDurationInMilliseconds());
}

export async function registerCustomer(input: RegisterCustomerInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },

    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new AppError(409, 'Email sudah digunakan', 'EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await argon2.hash(input.password);

  try {
    return await prisma.$transaction(async (transaction) => {
      const matchingCustomers = await transaction.customer.findMany({
        where: {
          email: input.email,
          userId: null,
        },

        select: {
          id: true,
        },

        take: 2,
      });

      if (matchingCustomers.length > 1) {
        throw new AppError(409, 'Terdapat lebih dari satu profil customer dengan email ini. Silakan hubungi administrator.', 'CUSTOMER_PROFILE_CONFLICT');
      }

      const user = await transaction.user.create({
        data: {
          name: input.name,

          email: input.email,

          phone: input.phone,

          passwordHash,

          role: UserRole.CUSTOMER,

          isActive: true,
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const existingCustomer = matchingCustomers[0];

      const customer = existingCustomer
        ? await transaction.customer.update({
            where: {
              id: existingCustomer.id,
            },

            data: {
              userId: user.id,

              name: input.name,

              phone: input.phone,

              email: input.email,

              address: input.address,
            },

            select: {
              id: true,
              userId: true,
              name: true,
              phone: true,
              email: true,
              address: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : await transaction.customer.create({
            data: {
              userId: user.id,

              name: input.name,

              phone: input.phone,

              email: input.email,

              address: input.address,
            },

            select: {
              id: true,
              userId: true,
              name: true,
              phone: true,
              email: true,
              address: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
            },
          });

      return {
        user,
        customer,
      };
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Email sudah digunakan', 'EMAIL_ALREADY_EXISTS');
    }

    throw error;
  }
}
