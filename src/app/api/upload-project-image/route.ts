import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dipilih' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pastikan folder public/projects ada
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    await fs.mkdir(projectsDir, { recursive: true });

    // Format nama file agar aman dan unik
    const timestamp = Date.now();
    const originalExt = path.extname(file.name) || '.jpg';
    const baseName = path.basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const finalFileName = `${timestamp}-${baseName}${originalExt.toLowerCase()}`;
    const filePath = path.join(projectsDir, finalFileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/projects/${finalFileName}`;
    return NextResponse.json({ success: true, url: publicUrl, filename: finalFileName });
  } catch (err: any) {
    console.error('Upload project image error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menyimpan gambar' }, { status: 500 });
  }
}
