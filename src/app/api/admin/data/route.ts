import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, verifyAdminRequest } from '@/lib/admin-auth';

async function getAuthorizedClient(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), client: null };
  }
  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  return { errorResponse: null, client: createServerSupabaseClient(bearer) };
}

export async function GET(req: NextRequest) {
  const { errorResponse, client } = await getAuthorizedClient(req);
  if (errorResponse || !client) return errorResponse!;

  try {
    const [projRes, contactRes, gbRes, scRes] = await Promise.all([
      client.from('projects').select('*').order('created_at', { ascending: false }),
      client.from('contacts').select('*').order('created_at', { ascending: false }),
      client.from('guestbook').select('*').order('created_at', { ascending: false }),
      client.from('site_content').select('*').eq('id', 'primary').maybeSingle(),
    ]);

    return NextResponse.json({
      projects: projRes.data || [],
      contacts: contactRes.data || [],
      guestbook: gbRes.data || [],
      siteContent: scRes.data?.content || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch admin data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse, client } = await getAuthorizedClient(req);
  if (errorResponse || !client) return errorResponse!;

  try {
    const body = await req.json();
    const { action, payload } = body || {};

    switch (action) {
      case 'create_project': {
        const { error } = await client.from('projects').insert([payload]);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case 'update_project': {
        const { id, fields } = payload || {};
        const { error } = await client.from('projects').update(fields).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case 'delete_project': {
        const { id } = payload || {};
        const { error } = await client.from('projects').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case 'approve_guestbook': {
        const { id, approved } = payload || {};
        const { error } = await client
          .from('guestbook')
          .update({ is_approved: Boolean(approved) })
          .eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case 'delete_guestbook': {
        const { id } = payload || {};
        const { error } = await client.from('guestbook').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case 'admin_reply_guestbook': {
        const { parentId, message } = payload || {};
        if (!parentId || !message?.trim()) {
          return NextResponse.json({ error: 'Parent ID and message are required' }, { status: 400 });
        }
        const replyPayload = {
          name: 'Jheryco Takizawa',
          handle: '@jtakizawa',
          role: 'Owner & Admin',
          message: `[reply:${parentId}|admin] ${String(message).trim()}`,
          likes: 1,
          is_approved: true,
        };
        const res = await client.from('guestbook').insert([replyPayload]);
        if (res.error && res.error.message.includes('is_approved')) {
          const fallbackRes = await client.from('guestbook').insert([
            {
              name: replyPayload.name,
              handle: replyPayload.handle,
              role: replyPayload.role,
              message: replyPayload.message,
              likes: replyPayload.likes,
            },
          ]);
          if (fallbackRes.error) {
            return NextResponse.json({ error: fallbackRes.error.message }, { status: 400 });
          }
          return NextResponse.json({ success: true });
        }
        if (res.error) return NextResponse.json({ error: res.error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case 'delete_contact': {
        const { id } = payload || {};
        const { error } = await client.from('contacts').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case 'save_site_content': {
        const { error } = await client.from('site_content').upsert({
          id: 'primary',
          content: JSON.stringify(payload),
          updated_at: new Date().toISOString(),
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: 'Unknown admin action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Admin request failed' }, { status: 500 });
  }
}
