import '@testing-library/jest-dom';

// Polyfill Web APIs for Jest environment
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Request and Response for next/server
class MockHeaders {
  constructor(init = {}) {
    this._headers = new Map(Object.entries(init));
  }
  get(name) { return this._headers.get(name.toLowerCase()); }
  set(name, value) { this._headers.set(name.toLowerCase(), value); }
  has(name) { return this._headers.has(name.toLowerCase()); }
  delete(name) { this._headers.delete(name.toLowerCase()); }
  forEach(callback) { this._headers.forEach(callback); }
}

class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input?.url || '';
    this.method = init.method || 'GET';
    this.headers = new MockHeaders(init.headers || {});
    this.body = init.body;
  }
  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }
}

class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new MockHeaders(init.headers || {});
    this.ok = this.status >= 200 && this.status < 300;
  }
  json() {
    return Promise.resolve(typeof this._body === 'string' ? JSON.parse(this._body) : this._body);
  }
  text() {
    return Promise.resolve(typeof this._body === 'string' ? this._body : JSON.stringify(this._body));
  }
  static json(data, init = {}) {
    const response = new MockResponse(JSON.stringify(data), {
      ...init,
      headers: { 'content-type': 'application/json', ...init.headers }
    });
    response._body = data;
    return response;
  }
}

global.Request = MockRequest;
global.Response = MockResponse;
global.Headers = MockHeaders;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  redirect: jest.fn(),
}));

// Mock next/server - NextResponse needs proper body handling
jest.mock('next/server', () => {
  class NextResponse extends MockResponse {
    constructor(body, init = {}) {
      super(body, init);
      this[Symbol.for('internal response')] = {
        cookies: { _parsed: new Map(), _headers: this.headers },
        url: undefined,
      };
    }

    static json(data, init = {}) {
      const response = new NextResponse(JSON.stringify(data), {
        status: 200,
        ...init,
        headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
      });
      response._jsonData = data;
      return response;
    }

    json() {
      if (this._jsonData !== undefined) {
        return Promise.resolve(this._jsonData);
      }
      return Promise.resolve(
        typeof this._body === 'string' ? JSON.parse(this._body) : this._body,
      );
    }
  }

  return {
    NextResponse,
    NextRequest: MockRequest,
  };
});

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

