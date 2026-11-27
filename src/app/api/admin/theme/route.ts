import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, verifyAdminRequest } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Akses ditolak: Anda harus login sebagai Admin.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    const client = createServerSupabaseClient(bearer);

    const payload = JSON.stringify({
      primaryColor: body.primaryColor,
      tertiaryColor: body.tertiaryColor,
      colorPresetId: body.colorPresetId || 'custom',
      themeStyle: body.themeStyle === 'solid' ? 'solid' : 'glass',
      updated_at: new Date().toISOString(),
    });

    // Save into dedicated site_content row ('theme_config') instead of polluting guestbook table
    const { error: scError } = await client
      .from('site_content')
      .upsert({
        id: 'theme_config',
        content: payload,
        updated_at: new Date().toISOString(),
      });

    if (!scError) {
      return NextResponse.json({ success: true, storage: 'site_content' });
    }

    // Fallback: if site_content table doesn't exist yet, update legacy guestbook config row if permitted
    const { data: existing } = await client
      .from('guestbook')
      .select('id')
      .eq('handle', '__takizawa_theme_config__')
      .maybeSingle();

    if (existing?.id) {
      const { error: gbUpdateErr } = await client
        .from('guestbook')
        .update({ message: payload })
        .eq('id', existing.id);
      if (!gbUpdateErr) {
        return NextResponse.json({ success: true, storage: 'guestbook_legacy' });
      }
    } else {
      const { error: gbInsertErr } = await client.from('guestbook').insert({
        name: 'Site Theme Config',
        handle: '__takizawa_theme_config__',
        role: 'System',
        message: payload,
        likes: 0,
        is_approved: false,
      });
      if (!gbInsertErr) {
        return NextResponse.json({ success: true, storage: 'guestbook_legacy' });
      }
    }

    return NextResponse.json(
      { error: scError.message || 'Gagal menyimpan tema ke Supabase.' },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses konfigurasi tema.' },
      { status: 500 }
    );
  }
}
