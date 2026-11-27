import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createServerSupabaseClient, verifyAdminRequest } from '@/lib/admin-auth';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

function hasValidImageSignature(buffer: Buffer, ext: string): boolean {
  if (buffer.length < 12) return false;

  if (ext === '.png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (ext === '.gif') {
    const header = buffer.subarray(0, 6).toString('ascii');
    return header === 'GIF87a' || header === 'GIF89a';
  }
  if (ext === '.webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  if (ext === '.avif') {
    return buffer.subarray(4, 8).toString('ascii') === 'ftyp';
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify signed HttpOnly admin cookie or valid Supabase Auth token
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda harus login ke Dashboard Admin untuk mengunggah gambar' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dipilih' }, { status: 400 });
    }

    // 2. Enforce 5MB max file size
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar (maksimal 5MB)' }, { status: 400 });
    }

    // 3. Strictly validate extension and MIME type (blocks SVG/HTML/JS uploads)
    const originalExt = path.extname(file.name).toLowerCase();
    const mimeType = (file.type || '').toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(originalExt) || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan PNG, JPG, WEBP, AVIF, atau GIF.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!hasValidImageSignature(buffer, originalExt)) {
      return NextResponse.json(
        { error: 'Isi file tidak valid atau tidak sesuai dengan format gambar yang dipilih.' },
        { status: 400 }
      );
    }

    // 4. Safe unique filename
    const timestamp = Date.now();
    const baseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || 'project-image';
    const finalFileName = `${timestamp}-${baseName}${originalExt}`;

    // 5. Try Supabase Storage ('projects' bucket)
    const authHeader = req.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    const supabaseClient = createServerSupabaseClient(bearer);

    try {
      const { data: uploadData, error: uploadErr } = await supabaseClient.storage
        .from('projects')
        .upload(`uploads/${finalFileName}`, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabaseClient.storage
          .from('projects')
          .getPublicUrl(`uploads/${finalFileName}`);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            filename: finalFileName,
            storage: 'supabase',
          });
        }
      }
    } catch {
      // Fall back to local filesystem if Supabase Storage bucket isn't configured
    }

    // 6. Save to local public/projects directory
    try {
      const projectsDir = path.join(process.cwd(), 'public', 'projects');
      await fs.mkdir(projectsDir, { recursive: true });
      const filePath = path.join(projectsDir, finalFileName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/projects/${finalFileName}`,
        filename: finalFileName,
        storage: 'local',
      });
    } catch (fsErr: any) {
      if (
        fsErr.code === 'EROFS' ||
        fsErr.message?.includes('read-only') ||
        process.env.VERCEL
      ) {
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;
        return NextResponse.json({
          success: true,
          url: dataUrl,
          filename: finalFileName,
          storage: 'data-url',
        });
      }
      throw fsErr;
    }
  } catch (err: any) {
    console.error('Upload project image error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengunggah gambar' }, { status: 500 });
  }
}
