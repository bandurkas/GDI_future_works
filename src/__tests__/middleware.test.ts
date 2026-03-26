/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

describe('Middleware RBAC', () => {
  let req: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
    process.env.NEXTAUTH_SECRET = 'test_secret';
    
    req = {
      nextUrl: { pathname: '' },
      url: 'http://localhost:3000',
      cookies: { get: jest.fn() },
    };
  });

  it('should redirect unauthenticated users from /admin to login', async () => {
    req.nextUrl.pathname = '/admin/dashboard';
    (getToken as jest.Mock).mockResolvedValue(null);

    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe('/admin/login');
  });

  it('should allow Owner to access user management', async () => {
    req.nextUrl.pathname = '/admin/users';
    (getToken as jest.Mock).mockResolvedValue({ role: 'Owner' });

    await middleware(req);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect non-Owners away from user management', async () => {
    req.nextUrl.pathname = '/admin/users/invite';
    (getToken as jest.Mock).mockResolvedValue({ role: 'Instructor' });

    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe('/admin');
    expect(redirectUrl.searchParams.get('error')).toBe('unauthorized');
  });
});
