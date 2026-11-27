import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const ADMIN_COOKIE_NAME = 'takizawa_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpzsqyqyhawwosoyfveb.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_POoJAifWG1AoPgthKloNrw_jVbaCt3U';

function getSessionSecret(): string {
  if (process.env.ADMIN_AUTH_SECRET && process.env.ADMIN_AUTH_SECRET.length >= 16) {
    return process.env.ADMIN_AUTH_SECRET;
  }
  // Derive deterministic server-only fallback secret from env values if ADMIN_AUTH_SECRET isn't set
  const seed = [
    process.env.ADMIN_PASSWORD || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    supabaseUrl,
    supabaseAnonKey,
  ].join('::');
  return crypto.createHash('sha256').update(seed).digest('hex');
}

export interface AdminSessionPayload {
  sub: string;
  method: 'supabase' | 'env';
  exp: number;
}

function signPayload(payload: AdminSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [data, sig] = parts;
  if (!data || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(data)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as AdminSessionPayload;
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function safeEqualString(a: string, b: string): boolean {
  const aHash = crypto.createHash('sha256').update(a).digest();
  const bHash = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

export function isAllowedAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allowedEnv = process.env.ADMIN_EMAILS;
  if (!allowedEnv || !allowedEnv.trim()) {
    // If ADMIN_EMAILS is not explicitly configured, any authenticated Supabase user in this project is permitted
    return true;
  }
  const allowed = allowedEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export async function verifySupabaseAccessToken(accessToken: string): Promise<{
  valid: boolean;
  email?: string;
  userId?: string;
}> {
  if (!accessToken) return { valid: false };
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data?.user) {
      return { valid: false };
    }
    if (!isAllowedAdminEmail(data.user.email)) {
      return { valid: false };
    }
    return {
      valid: true,
      email: data.user.email || data.user.id,
      userId: data.user.id,
    };
  } catch {
    return { valid: false };
  }
}

export async function verifyAdminRequest(req: NextRequest): Promise<{
  authorized: boolean;
  subject?: string;
  method?: 'cookie' | 'supabase';
}> {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const cookieSession = verifySessionToken(cookieToken);
  if (cookieSession) {
    return {
      authorized: true,
      subject: cookieSession.sub,
      method: 'cookie',
    };
  }

  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (bearer) {
    const sb = await verifySupabaseAccessToken(bearer);
    if (sb.valid) {
      return {
        authorized: true,
        subject: sb.email || sb.userId,
        method: 'supabase',
      };
    }
  }

  return { authorized: false };
}

export function attachAdminCookie(
  res: NextResponse,
  subject: string,
  method: 'supabase' | 'env',
  rememberMe: boolean
): void {
  const maxAgeMs = (rememberMe ? SESSION_MAX_AGE_SECONDS : 60 * 60 * 12) * 1000;
  const token = signPayload({
    sub: subject,
    method,
    exp: Date.now() + maxAgeMs,
  });

  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(rememberMe ? { maxAge: SESSION_MAX_AGE_SECONDS } : {}),
  });
}

export function clearAdminCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function createServerSupabaseClient(accessToken?: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(accessToken
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : {}),
  });
}
