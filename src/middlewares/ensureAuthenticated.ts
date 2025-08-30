import { FastifyRequest  } from 'fastify';
import { verify } from 'jsonwebtoken';

import authConfig from '@config/auth';
import AppError from '@errors/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default function ensureAuthenticated(
  request: FastifyRequest,
  _,
  next
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('JWT token is missing.', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { sub } = decoded as ITokenPayload;

    request.headers = {
      userId: sub
    }

    next();
  } catch (err) {
    throw new AppError('Invalid JWT token.', 401);
  }
}
