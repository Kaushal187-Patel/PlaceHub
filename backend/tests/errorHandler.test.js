const errorHandler = require('../src/middleware/errorHandler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockReq = () => ({ method: 'GET', originalUrl: '/api/test' });

describe('errorHandler (Sequelize-aware)', () => {
  afterEach(() => { delete process.env.NODE_ENV; });

  test('maps SequelizeUniqueConstraintError to 400', () => {
    const res = mockRes();
    const err = { name: 'SequelizeUniqueConstraintError', errors: [{ path: 'email' }] };
    errorHandler(err, mockReq(), res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/email/);
  });

  test('maps SequelizeValidationError to 400 with joined messages', () => {
    const res = mockRes();
    const err = { name: 'SequelizeValidationError', errors: [{ message: 'a invalid' }, { message: 'b invalid' }] };
    errorHandler(err, mockReq(), res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('a invalid, b invalid');
  });

  test('maps SequelizeForeignKeyConstraintError to 409', () => {
    const res = mockRes();
    errorHandler({ name: 'SequelizeForeignKeyConstraintError' }, mockReq(), res, () => {});
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('maps JWT errors to 401', () => {
    const res = mockRes();
    errorHandler({ name: 'JsonWebTokenError' }, mockReq(), res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('hides internal details for 5xx in production', () => {
    process.env.NODE_ENV = 'production';
    const res = mockRes();
    errorHandler({ message: 'sensitive db detail' }, mockReq(), res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('Server Error');
    expect(body.stack).toBeUndefined();
  });
});
