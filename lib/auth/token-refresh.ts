type RefreshCallback = () => Promise<string | null>;

class TokenRefreshQueue {
  private queue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
  }> = [];
  private refreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  async enqueue(refreshFn: RefreshCallback): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });

      if (!this.refreshing) {
        this.processQueue(refreshFn);
      }
    });
  }

  private async processQueue(refreshFn: RefreshCallback): Promise<void> {
    if (this.queue.length === 0) {
      this.refreshing = false;
      return;
    }

    this.refreshing = true;

    try {
      if (!this.refreshPromise) {
        this.refreshPromise = refreshFn();
      }

      const token = await this.refreshPromise;

      // Resolve all queued requests with the same token
      this.queue.forEach(({ resolve }) => resolve(token));
      this.queue = [];
      this.refreshPromise = null;
    } catch (error) {
      // Reject all queued requests
      this.queue.forEach(({ reject }) =>
        reject(error instanceof Error ? error : new Error('Token refresh failed'))
      );
      this.queue = [];
      this.refreshPromise = null;
    } finally {
      this.refreshing = false;
    }
  }
}

export const tokenRefreshQueue = new TokenRefreshQueue();

