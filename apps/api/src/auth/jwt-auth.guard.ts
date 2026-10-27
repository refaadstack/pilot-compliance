import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { verifyToken } from './token.util';

interface RequestWithUser extends Request {
  user?: { sub: string };
}

function bearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = bearerToken(request);
    const payload = token === null ? null : verifyToken(token, process.env.AUTH_SECRET ?? 'susi-air-dev-secret');
    if (payload === null) {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }
    request.user = { sub: payload.sub };
    return true;
  }
}
