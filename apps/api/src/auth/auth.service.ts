import { Injectable, UnauthorizedException } from '@nestjs/common';
import { signToken } from './token.util';

/** Hardcoded per the brief; the only place that knows credentials. */
const PILOT_ACCOUNTS: ReadonlyMap<string, string> = new Map([['johndoe', 'susiairtest']]);

@Injectable()
export class AuthService {
  login(username: string, password: string): { token: string } {
    const expected = PILOT_ACCOUNTS.get(username);
    if (expected === undefined || password !== expected) {
      // Same message for unknown user and wrong password: no account enumeration.
      throw new UnauthorizedException('Invalid username or password');
    }
    return { token: signToken(username, process.env.AUTH_SECRET ?? 'susi-air-dev-secret') };
  }
}
