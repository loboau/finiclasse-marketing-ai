import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// MIME types for common file extensions
const MIME_TYPES: Record<string, string> = {
  // Images
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  'ico': 'image/x-icon',
  // Videos
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo',
  'mkv': 'video/x-matroska',
  'ogv': 'video/ogg',
  // Documents
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'csv': 'text/csv',
  'json': 'application/json',
  // Archives
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
};

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function sanitizePath(inputPath: string): string {
  // Remove any path traversal attempts
  return inputPath
    .replace(/\.\./g, '')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    // Sanitize the path
    const sanitizedPath = sanitizePath(filePath);
    const fullPath = path.join(UPLOADS_DIR, sanitizedPath);

    // Security check: ensure the path is within uploads directory
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    // Check if file exists
    try {
      const stats = await stat(fullPath);
      if (!stats.isFile()) {
        return NextResponse.json({ error: 'Not a file' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);
    const filename = path.basename(fullPath);
    const mimeType = getMimeType(filename);

    // Check if download is requested
    const download = searchParams.get('download') === 'true';

    // Create response with appropriate headers
    const headers: Record<string, string> = {
      'Content-Type': mimeType,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(filename)}"`;
    } else {
      headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(filename)}"`;
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
