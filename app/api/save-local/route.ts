import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // ── Vercel / serverless guard ────────────────────────────────────────────────
  // Vercel has a read-only filesystem — local disk saves are a dev-only feature.
  // MongoDB (saveDraft) already handles persistence in all environments.
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: 'Local disk save skipped in production (MongoDB handles persistence)',
    });
  }
  // ─────────────────────────────────────────────────────────────────────────────

  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const { files, projectTitle } = await req.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Invalid files data' }, { status: 400 });
    }

    const sanitizedTitle = (projectTitle || 'untitled-project')
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderName = `${sanitizedTitle}-${timestamp}`;
    const projectsDir = path.join(process.cwd(), 'projects', folderName);

    await fs.mkdir(projectsDir, { recursive: true });

    const savePromises = files.map(async (file: { path?: string; name?: string; content?: string }) => {
      const rawPath = file.path || file.name || 'index.html';
      const safePath = rawPath.replace(/^[/\\]+/, '').replace(/(\.\.\/|\.\.\\)/g, '');
      const fullPath = path.join(projectsDir, safePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file.content || '', 'utf-8');
    });

    await Promise.all(savePromises);

    return NextResponse.json({
      success: true,
      message: 'Files saved locally',
      path: projectsDir,
    });
  } catch (error: any) {
    console.error('Error saving files locally:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
