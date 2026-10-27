import { SetMetadata } from '@nestjs/common';

/** Marks an endpoint as reachable without a bearer token (currently only POST /auth/login). */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): PropertyDecorator => SetMetadata(IS_PUBLIC_KEY, true);
