import { NextRequest, NextResponse } from 'next/server';
import {
  attachAdminCookie,
  clearAdminCookie,
  safeEqualString,
  verifyAdminRequest,
  verifySupabaseAccessToken,
} from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const session = await verifyAdminRequest(req);
  if (!session.authorized) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    subject: session.subject,
    method: session.method,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rememberMe = Boolean(body?.rememberMe);

    // Mode 1: Verify Supabase Auth access token issued by client signInWithPassword
    if (typeof body?.supabaseAccessToken === 'string' && body.supabaseAccessToken.trim()) {
      const sb = await verifySupabaseAccessToken(body.supabaseAccessToken.trim());
      if (!sb.valid || !sb.email) {
        return NextResponse.json(
          { error: 'Akun Supabase tidak memiliki akses administrator.' },
          { status: 401 }
        );
      }
      const res = NextResponse.json({
        authenticated: true,
        subject: sb.email,
        method: 'supabase',
      });
      attachAdminCookie(res, sb.email, 'supabase', rememberMe);
      return res;
    }

    // Mode 2: Server-only environment credentials (never exposed in client bundle)
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!expectedUser || !expectedPass) {
      return NextResponse.json(
        {
          error:
            'Login username belum dikonfigurasi di server (.env.local: ADMIN_USERNAME & ADMIN_PASSWORD). Silakan masuk menggunakan Email akun Supabase Auth Anda.',
        },
        { status: 401 }
      );
    }

    if (
      username &&
      password &&
      safeEqualString(username.toLowerCase(), expectedUser.toLowerCase()) &&
      safeEqualString(password, expectedPass)
    ) {
      const res = NextResponse.json({
        authenticated: true,
        subject: expectedUser,
        method: 'env',
      });
      attachAdminCookie(res, expectedUser, 'env', rememberMe);
      return res;
    }

    return NextResponse.json(
      { error: 'Username/Email atau Password salah! Periksa kembali kredensial Anda.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: 'Format request login tidak valid.' }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  clearAdminCookie(res);
  return res;
}
