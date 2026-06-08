import { describe, it, expect, beforeEach } from 'vitest';
import reducer, { reset, setCredentials } from './authSlice';

const baseState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

describe('authSlice reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('isLoading', false);
  });

  it('setCredentials stores the user and persists to localStorage', () => {
    const action = setCredentials({ user: { id: '1', name: 'Jo', role: 'student' }, token: 'tok' });
    const state = reducer(baseState, action);
    expect(state.user.name).toBe('Jo');
    expect(state.isSuccess).toBe(true);
    expect(JSON.parse(localStorage.getItem('user')).name).toBe('Jo');
  });

  it('reset clears transient flags but keeps user', () => {
    const dirty = { ...baseState, user: { id: '1' }, isError: true, message: 'x' };
    const state = reducer(dirty, reset());
    expect(state.isError).toBe(false);
    expect(state.message).toBe('');
    expect(state.user).toEqual({ id: '1' });
  });
});
