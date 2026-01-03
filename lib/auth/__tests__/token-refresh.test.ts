import { tokenRefreshQueue } from '../token-refresh';

describe('Token Refresh Queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should queue refresh requests and execute sequentially', async () => {
    const refreshFn = jest.fn().mockResolvedValue('new-token');

    const promise1 = tokenRefreshQueue.enqueue(refreshFn);
    const promise2 = tokenRefreshQueue.enqueue(refreshFn);
    const promise3 = tokenRefreshQueue.enqueue(refreshFn);

    const [token1, token2, token3] = await Promise.all([
      promise1,
      promise2,
      promise3,
    ]);

    expect(refreshFn).toHaveBeenCalledTimes(1); // Should only call once
    expect(token1).toBe('new-token');
    expect(token2).toBe('new-token');
    expect(token3).toBe('new-token');
  });

  it('should handle refresh errors', async () => {
    const refreshFn = jest
      .fn()
      .mockRejectedValue(new Error('Refresh failed'));

    const promise = tokenRefreshQueue.enqueue(refreshFn);

    await expect(promise).rejects.toThrow('Refresh failed');
  });

  it('should handle multiple concurrent refresh requests', async () => {
    let callCount = 0;
    const refreshFn = jest.fn().mockImplementation(async () => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
      return `token-${callCount}`;
    });

    const promises = Array.from({ length: 5 }, () =>
      tokenRefreshQueue.enqueue(refreshFn)
    );

    const results = await Promise.all(promises);

    // All should get the same token (from first call)
    expect(refreshFn).toHaveBeenCalledTimes(1);
    expect(results.every((token) => token === 'token-1')).toBe(true);
  });
});

