import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dipilih' }, { status: 400 });
    }

    // Batasi ukuran file (maksimal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar (maksimal 5MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Format nama file agar aman dan unik
    const timestamp = Date.now();
    const originalExt = path.extname(file.name) || '.jpg';
    const baseName = path.basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const finalFileName = `${timestamp}-${baseName}${originalExt.toLowerCase()}`;
    const mimeType = file.type || 'image/jpeg';

    // 1. Coba upload ke Supabase Storage (bucket 'projects') jika sudah dibuat
    try {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('projects')
        .upload(`uploads/${finalFileName}`, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
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
      // Abaikan jika bucket projects belum tersedia di Supabase
    }

    // 2. Coba simpan ke filesystem lokal jika bukan lingkungan serverless read-only
    try {
      const projectsDir = path.join(process.cwd(), 'public', 'projects');
      await fs.mkdir(projectsDir, { recursive: true });
      const filePath = path.join(projectsDir, finalFileName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/projects/${finalFileName}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: finalFileName,
        storage: 'local',
      });
    } catch (fsErr: any) {
      // 3. Fallback jika lingkungan Vercel Serverless (EROFS / Read-Only File System):
      // Konversi buffer menjadi Base64 Data URL agar gambar langsung tersimpan ke database Supabase
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
