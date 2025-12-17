/**
 * Finiclasse Marketing Dashboard - Security Middleware
 *
 * This middleware applies security measures to all API routes:
 * - Rate limiting
 * - CORS validation
 * - Security headers
 * - Request validation
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Security configuration
const CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 60, // 60 requests per minute per IP
  AI_RATE_LIMIT_MAX_REQUESTS: 15, // 15 AI requests per minute per IP

  // Allowed origins
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Add production domains here
  ],

  // Paths that require stricter rate limiting
  AI_PATHS: ['/api/ai/generate', '/api/ai/suggest', '/api/ai/search-knowledge'],

  // Paths that should bypass middleware (static assets, etc.)
  BYPASS_PATHS: ['/_next', '/favicon.ico'],
};

// Security headers to add to all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;",
};

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return realIP || 'unknown';
}

/**
 * Check if request should bypass middleware
 */
function shouldBypass(pathname: string): boolean {
  return CONFIG.BYPASS_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Check if path is an AI endpoint (needs stricter limits)
 */
function isAIPath(pathname: string): boolean {
  return CONFIG.AI_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Apply rate limiting
 */
function checkRateLimit(
  identifier: string,
  maxRequests: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  // Check if record exists and is still valid
  if (record && now <= record.resetTime) {
    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }
    record.count++;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  // Create new record
  const resetTime = now + CONFIG.RATE_LIMIT_WINDOW_MS;
  rateLimitMap.set(identifier, { count: 1, resetTime });
  return { allowed: true, remaining: maxRequests - 1, resetTime };
}

/**
 * Validate request origin for CORS protection
 */
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  // Allow requests without origin (same-origin, server-to-server)
  if (!origin) {
    return true;
  }

  // In development, allow localhost variants
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }

  // Check against allowed origins
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

/**
 * Create error response with security headers
 */
function createErrorResponse(
  message: string,
  status: number,
  headers?: Record<string, string>
): NextResponse {
  const response = NextResponse.json({ error: message }, { status });

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add custom headers
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for bypassed paths
  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  // Only apply to API routes
  if (!pathname.startsWith('/api')) {
    const response = NextResponse.next();
    // Still add security headers to all responses
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // === API ROUTE PROTECTION ===

  // 1. Origin validation (CORS)
  if (!validateOrigin(request)) {
    console.warn(`[SECURITY] Blocked request from invalid origin: ${request.headers.get('origin')}`);
    return createErrorResponse('Forbidden: Invalid origin', 403);
  }

  // 2. Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitKey = `${clientIP}:${pathname}`;
  const maxRequests = isAIPath(pathname)
    ? CONFIG.AI_RATE_LIMIT_MAX_REQUESTS
    : CONFIG.RATE_LIMIT_MAX_REQUESTS;

  const rateLimit = checkRateLimit(rateLimitKey, maxRequests);

  if (!rateLimit.allowed) {
    console.warn(`[SECURITY] Rate limit exceeded for ${clientIP} on ${pathname}`);
    return createErrorResponse('Too many requests. Please try again later.', 429, {
      'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
      'X-RateLimit-Limit': String(maxRequests),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(rateLimit.resetTime),
    });
  }

  // 3. Check for suspicious patterns in URL
  const suspiciousPatterns = [
    /\.\./,           // Path traversal
    /<script/i,       // XSS attempts
    /javascript:/i,   // JavaScript injection
    /on\w+=/i,        // Event handlers
    /%00/,            // Null bytes
  ];

  const fullUrl = request.url;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      console.warn(`[SECURITY] Blocked suspicious request: ${fullUrl}`);
      return createErrorResponse('Bad Request: Invalid characters in URL', 400);
    }
  }

  // 4. Proceed with security headers
  const response = NextResponse.next();

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', String(maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime));

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Also apply security headers to pages
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
