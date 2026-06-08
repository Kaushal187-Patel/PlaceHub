const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

describe('User model security methods', () => {
  test('getSignedJwtToken signs a verifiable token with JWT_SECRET', () => {
    const user = User.build({ id: 'abc-123', email: 'a@b.com', name: 'A', password: 'x' });
    const token = user.getSignedJwtToken();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('abc-123');
  });

  test('getSignedJwtToken throws when JWT_SECRET is missing', () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const user = User.build({ id: 'abc-123', email: 'a@b.com', name: 'A', password: 'x' });
    expect(() => user.getSignedJwtToken()).toThrow(/JWT_SECRET/);
    process.env.JWT_SECRET = original;
  });

  test('getResetPasswordToken returns a raw token and stores a hashed version with expiry', () => {
    const user = User.build({ id: 'abc-123', email: 'a@b.com', name: 'A', password: 'x' });
    const raw = user.getResetPasswordToken();
    expect(typeof raw).toBe('string');
    expect(raw).toHaveLength(40); // 20 random bytes -> hex
    expect(user.resetPasswordToken).toBeTruthy();
    expect(user.resetPasswordToken).not.toBe(raw); // stored value is hashed
    expect(new Date(user.resetPasswordExpire).getTime()).toBeGreaterThan(Date.now());
  });

  test('matchPassword rejects non-bcrypt stored hashes', async () => {
    const user = User.build({ id: 'abc-123', email: 'a@b.com', name: 'A', password: 'plaintext' });
    await expect(user.matchPassword('plaintext')).resolves.toBe(false);
  });
});
