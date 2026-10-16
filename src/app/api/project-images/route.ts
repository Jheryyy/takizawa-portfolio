import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const images: { filename: string; url: string }[] = [];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'];

    // 1. Ambil dari Supabase Storage jika ada
    try {
      const { data: storageFiles } = await supabase.storage.from('projects').list('uploads', {
        limit: 50,
      });
      if (storageFiles && storageFiles.length > 0) {
        storageFiles.forEach((file) => {
          if (validExts.includes(path.extname(file.name).toLowerCase())) {
            const { data } = supabase.storage.from('projects').getPublicUrl(`uploads/${file.name}`);
            if (data?.publicUrl) {
              images.push({
                filename: file.name,
                url: data.publicUrl,
              });
            }
          }
        });
      }
    } catch {
      // Abaikan jika Supabase Storage belum aktif
    }

    // 2. Ambil dari folder public/projects
    try {
      const projectsDir = path.join(process.cwd(), 'public', 'projects');
      const files = await fs.readdir(projectsDir);
      files
        .filter((file) => validExts.includes(path.extname(file).toLowerCase()))
        .forEach((file) => {
          if (!images.some((img) => img.filename === file)) {
            images.push({
              filename: file,
              url: `/projects/${file}`,
            });
          }
        });
    } catch {
      // Abaikan jika folder belum ada di runtime
    }

    return NextResponse.json({ images });
  } catch (err: any) {
    console.error('List project images error:', err);
    return NextResponse.json({ images: [] });
  }
}
