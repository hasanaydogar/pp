import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../auth-store';
import type { AuthUser } from '@/lib/types/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(null);
      result.current.setLoading(true);
    });
  });

  it('should initialize with null user and loading true', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    // Loading starts as true in the store definition
    expect(result.current.loading).toBe(true);
  });

  it('should set user', () => {
    const { result } = renderHook(() => useAuthStore());
    const testUser: AuthUser = {
      id: '123',
      provider_id: '123',
      provider_type: 'google',
      email: 'test@example.com',
      name: 'Test User',
    };

    act(() => {
      result.current.setUser(testUser);
    });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.loading).toBe(false);
  });

  it('should clear auth', () => {
    const { result } = renderHook(() => useAuthStore());
    const testUser: AuthUser = {
      id: '123',
      provider_id: '123',
      provider_type: 'google',
      email: 'test@example.com',
    };

    act(() => {
      result.current.setUser(testUser);
      result.current.clearAuth();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.loading).toBe(false);
  });
});

