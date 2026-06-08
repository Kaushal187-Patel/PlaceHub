const { authorize } = require('../src/middleware/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authorize() role guard', () => {
  test('calls next() when role is allowed', () => {
    const req = { user: { role: 'recruiter' } };
    const next = jest.fn();
    authorize('recruiter', 'admin')(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('returns 403 when role is not allowed', () => {
    const req = { user: { role: 'student' } };
    const res = mockRes();
    const next = jest.fn();
    authorize('recruiter', 'admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
