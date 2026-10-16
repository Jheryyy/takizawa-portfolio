import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    await fs.mkdir(projectsDir, { recursive: true });

    const files = await fs.readdir(projectsDir);
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'];

    const images = files
      .filter((file) => validExts.includes(path.extname(file).toLowerCase()))
      .map((file) => ({
        filename: file,
        url: `/projects/${file}`,
      }));

    return NextResponse.json({ images });
  } catch (err: any) {
    console.error('List project images error:', err);
    return NextResponse.json({ images: [] });
  }
}
