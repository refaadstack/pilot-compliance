import { signToken, verifyToken } from './token.util';

const SECRET = 'test-secret';

describe('token.util', () => {
  it('round-trips a payload', () => {
    const token = signToken('johndoe', SECRET);
    expect(verifyToken(token, SECRET)).toMatchObject({ sub: 'johndoe' });
  });

  it('rejects a token signed with another secret', () => {
    expect(verifyToken(signToken('johndoe', SECRET), 'other-secret')).toBeNull();
  });

  it('rejects tampered bodies and malformed input', () => {
    const token = signToken('johndoe', SECRET);
    const [body] = token.split('.');
    expect(verifyToken(`${body}.deadbeef`, SECRET)).toBeNull();
    expect(verifyToken('garbage', SECRET)).toBeNull();
    expect(verifyToken('', SECRET)).toBeNull();
  });
});
