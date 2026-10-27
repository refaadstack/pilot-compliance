import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Minimal stateless token: base64url(JSON payload) + '.' + base64url(HMAC-SHA256).
 * Deliberately dependency-free (no jsonwebtoken) — the token carries only the
 * username, is verified with a timing-safe comparison, and never expires
 * (the brief's account set is static; add `exp` when real accounts exist).
 */
export interface TokenPayload {
  sub: string;
  iat: number;
}

const b64url = (input: Buffer | string): string =>
  Buffer.from(input).toString('base64url');

function hmac(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

export function signToken(username: string, secret: string): string {
  const payload: TokenPayload = { sub: username, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${hmac(body, secret)}`;
}

/** Returns the payload when the signature is valid, otherwise null. */
export function verifyToken(token: string, secret: string): TokenPayload | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(hmac(body, secret));
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
    return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload : null;
  } catch {
    return null;
  }
}
