/**
 * Security utilities for Finiclasse Marketing Dashboard
 *
 * This module provides comprehensive security measures to protect
 * API keys and prevent unauthorized access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting store (in-memory for development, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 30, // Max 30 requests per minute

  // AI-specific rate limiting (more restrictive)
  AI_RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  AI_RATE_LIMIT_MAX_REQUESTS: 10, // Max 10 AI requests per minute

  // Request size limits
  MAX_REQUEST_SIZE_BYTES: 1024 * 1024, // 1MB
  MAX_AI_PROMPT_LENGTH: 5000, // Max 5000 characters for prompts

  // Allowed origins (add your production domains)
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],

  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const currentRecord = rateLimitStore.get(identifier);

  if (!currentRecord) {
    // First request
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (currentRecord.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: currentRecord.resetTime };
  }

  currentRecord.count++;
  return {
    allowed: true,
    remaining: maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  };
}

/**
 * Validate origin for CORS protection
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow requests without origin (same-origin requests, curl, etc.)
  if (!origin && !referer) {
    return true;
  }

  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check if origin is in allowed list
  if (origin && SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check referer as fallback
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    return SECURITY_CONFIG.ALLOWED_ORIGINS.includes(refererOrigin);
  }

  return false;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potential script tags and HTML
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();

  // Limit length
  if (sanitized.length > SECURITY_CONFIG.MAX_AI_PROMPT_LENGTH) {
    sanitized = sanitized.substring(0, SECURITY_CONFIG.MAX_AI_PROMPT_LENGTH);
  }

  return sanitized;
}

/**
 * Validate API request and apply security measures
 */
export async function validateApiRequest(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    isAIEndpoint?: boolean;
    maxBodySize?: number;
  } = {}
): Promise<{ valid: boolean; error?: NextResponse }> {
  const {
    requireAuth = false,
    isAIEndpoint = false,
    maxBodySize = SECURITY_CONFIG.MAX_REQUEST_SIZE_BYTES,
  } = options;

  // 1. Validate origin
  if (!validateOrigin(request)) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Forbidden: Invalid origin' },
        { status: 403, headers: SECURITY_CONFIG.SECURITY_HEADERS }
      ),
    };
  }

  // 2. Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitKey = `${clientIP}:${request.nextUrl.pathname}`;

  const rateLimit = checkRateLimit(
    rateLimitKey,
    isAIEndpoint ? SECURITY_CONFIG.AI_RATE_LIMIT_MAX_REQUESTS : SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    isAIEndpoint ? SECURITY_CONFIG.AI_RATE_LIMIT_WINDOW_MS : SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS
  );

  if (!rateLimit.allowed) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            ...SECURITY_CONFIG.SECURITY_HEADERS,
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(isAIEndpoint ? SECURITY_CONFIG.AI_RATE_LIMIT_MAX_REQUESTS : SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetTime),
          },
        }
      ),
    };
  }

  // 3. Check content length
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxBodySize) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Request body too large' },
        { status: 413, headers: SECURITY_CONFIG.SECURITY_HEADERS }
      ),
    };
  }

  // 4. Authentication check (if required)
  if (requireAuth) {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      return {
        valid: false,
        error: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401, headers: SECURITY_CONFIG.SECURITY_HEADERS }
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Log security event (for monitoring)
 */
export function logSecurityEvent(
  eventType: 'rate_limit' | 'invalid_origin' | 'auth_failure' | 'suspicious_input',
  details: Record<string, unknown>
): void {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    ...details,
  };

  // In production, this should send to a logging service
  console.warn('[SECURITY EVENT]', JSON.stringify(event));
}

/**
 * Validate environment variables are properly configured
 */
export function validateEnvSecurity(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for API keys
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    warnings.push('No AI API keys configured (GROQ_API_KEY or GEMINI_API_KEY)');
  }

  // Check API key format (basic validation)
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith('gsk_')) {
    warnings.push('GROQ_API_KEY format appears invalid');
  }

  // Warn about development mode
  if (process.env.NODE_ENV !== 'production') {
    warnings.push('Running in development mode - security restrictions relaxed');
  }

  return { valid: warnings.length === 0, warnings };
}
