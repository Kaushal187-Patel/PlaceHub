// Provide deterministic env for unit tests so modules that validate config load.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_at_least_32_chars_long_000';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
process.env.DATABASE_URI = process.env.DATABASE_URI || 'postgres://user:pass@localhost:5432/test_db';
