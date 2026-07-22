import type {
    NextFunction,
    Request,
    Response,
} from "express";
import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../services/token.service.js";

export async function authenticate(
    request: Request,
    _response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authorizationHeader =
            request.get("authorization");

        if (!authorizationHeader) {
            throw new AppError(
                401,
                "Access token wajib disertakan",
                "ACCESS_TOKEN-REQUIRED",
            );
        }

        const authorizationParts =
            authorizationHeader.trim().split(/\s+/);
        
        const scheme = authorizationParts[0];
        const token = authorizationParts[1];

        if (
            authorizationParts.length !== 2 ||
            scheme?.toLowerCase() !== "bearer" ||
            !token 
        ) {
            throw new AppError(
                401,
                "Format Authorization header tidak valid",
                "INVALID_AUTHORIZATION_HEADER",
            );
        }

        const verifiedToken =
            await verifyAccessToken(token);
        
        const now = new Date();

        const session =
            await prisma.authSessions.findUnique({
                where: {
                    id: verifiedToken.sessionId,
                },
                select: {
                    id: true,
                    userId: true,
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

            if (
                !session ||
                session.userId !== verifiedToken.userId
            ) {
                throw new AppError(
                    401,
                    "Session authentication tidak valid",
                    "INVALID_SESSION",
                );
            }

            if (session.revokedAt !== null) {
                throw new AppError(
                    401,
                    "Session sudah dicabut",
                    "SESSION_REVOKED",
                );
            }

            if (session.expiresAt.getTime() <= now.getTime()
            ) {
                throw new AppError(
                    401,
                    "Session sudah kedaluwarsa",
                    "SESSION_EXPIRED",
                );
            }

            if (!session.user.isActive) {
                throw new AppError(
                    401,
                    "Akun sudah dinonaktifkan",
                    "ACCOUNT_INACTIVE",
                );
            }

            request.auth = {
                userId: session.user.id,
                sessionId: session.id,
                role: session.user.role,    
            };

            next();
    } catch (error: unknown) {
        if (error instanceof AppError) {
            next(error);
            return;
        }

        next(
            new AppError(
                401, 
                "Access token tidak valid atau sudah kedaluwarsa",
                "INVALID_ACCESS_TOKEN",
            ),
        );
    }
}