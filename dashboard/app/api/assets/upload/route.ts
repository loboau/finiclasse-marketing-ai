import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { addSecurityHeaders } from '@/lib/security';

// Allowed file types
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],

  // Videos
  'video/mp4': ['.mp4'],
  'video/mpeg': ['.mpeg', '.mpg'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm'],

  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
};

// Maximum file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Validates and sanitizes file paths to prevent directory traversal attacks
 * @param userPath - The path provided by the user
 * @returns Sanitized path or null if invalid
 */
function validateAndSanitizePath(userPath: string): string | null {
  if (!userPath || typeof userPath !== 'string') {
    return '';
  }

  // Remove any attempts at directory traversal
  const sanitized = userPath
    .replace(/\.\./g, '') // Remove ..
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .trim();

  // Ensure the path doesn't try to escape the base directory
  const normalizedPath = path.normalize(sanitized);
  if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
    return null;
  }

  return sanitized;
}

/**
 * Validates file extension against MIME type
 * @param fileName - The name of the file
 * @param mimeType - The MIME type of the file
 * @returns true if valid, false otherwise
 */
function validateFileType(fileName: string, mimeType: string): boolean {
  const allowedExtensions = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];

  if (!allowedExtensions) {
    return false;
  }

  const fileExt = path.extname(fileName).toLowerCase();
  return allowedExtensions.includes(fileExt);
}

/**
 * Sanitizes a filename to prevent security issues
 * @param fileName - The original filename
 * @returns Sanitized filename
 */
function sanitizeFileName(fileName: string): string {
  // Remove any path separators and dangerous characters
  let sanitized = fileName
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove ..
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid characters
    .trim();

  // Ensure the filename isn't empty after sanitization
  if (!sanitized) {
    sanitized = 'file';
  }

  // Limit filename length (including extension)
  const ext = path.extname(sanitized);
  const nameWithoutExt = path.basename(sanitized, ext);
  const maxNameLength = 200;

  if (nameWithoutExt.length > maxNameLength) {
    sanitized = nameWithoutExt.substring(0, maxNameLength) + ext;
  }

  return sanitized;
}

/**
 * Generates a unique filename if the file already exists
 * @param basePath - The base directory path
 * @param fileName - The desired filename
 * @returns A unique filename
 */
function getUniqueFileName(basePath: string, fileName: string): string {
  const ext = path.extname(fileName);
  const nameWithoutExt = path.basename(fileName, ext);
  let uniqueName = fileName;
  let counter = 1;

  // Note: In a real implementation, you'd check if the file exists
  // For now, we'll add a timestamp to ensure uniqueness
  const timestamp = Date.now();
  uniqueName = `${nameWithoutExt}-${timestamp}${ext}`;

  return uniqueName;
}

/**
 * POST /api/assets/upload
 * Uploads a file to the specified directory
 * Form data:
 *   - file: The file to upload (required)
 *   - path: The relative path within uploads directory (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedPath = (formData.get('path') as string) || '';

    // Validate file exists
    if (!file) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            maxSize: MAX_FILE_SIZE,
            receivedSize: file.size,
          },
          { status: 413 }
        )
      );
    }

    // Validate file size isn't zero
    if (file.size === 0) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'File is empty' },
          { status: 400 }
        )
      );
    }

    // Validate file type
    if (!validateFileType(file.name, file.type)) {
      const allowedTypes = Object.keys(ALLOWED_MIME_TYPES).join(', ');
      return addSecurityHeaders(
        NextResponse.json(
          {
            error: 'Invalid file type. Only images, videos, and documents are allowed.',
            receivedType: file.type,
            allowedTypes,
          },
          { status: 400 }
        )
      );
    }

    // Validate and sanitize the path
    const sanitizedPath = validateAndSanitizePath(requestedPath);
    if (sanitizedPath === null) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid path: Directory traversal detected' },
          { status: 400 }
        )
      );
    }

    // Sanitize filename
    const sanitizedFileName = sanitizeFileName(file.name);

    // Construct the full path
    const baseDir = path.join(process.cwd(), 'public/uploads');
    const uploadDir = path.join(baseDir, sanitizedPath);

    // Verify the resolved path is within the base directory
    const resolvedPath = path.resolve(uploadDir);
    const resolvedBase = path.resolve(baseDir);
    if (!resolvedPath.startsWith(resolvedBase)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Access denied: Path outside allowed directory' },
          { status: 403 }
        )
      );
    }

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const uniqueFileName = getUniqueFileName(uploadDir, sanitizedFileName);
    const filePath = path.join(uploadDir, uniqueFileName);

    // Verify the final file path is still within the base directory
    const resolvedFilePath = path.resolve(filePath);
    if (!resolvedFilePath.startsWith(resolvedBase)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Access denied: File path outside allowed directory' },
          { status: 403 }
        )
      );
    }

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Calculate the relative path for the response
    const relativePath = path.relative(
      path.join(process.cwd(), 'public'),
      filePath
    );

    // Return success response with file info
    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        file: {
          name: uniqueFileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          path: relativePath,
          url: `/${relativePath}`,
        },
      })
    );
  } catch (error) {
    console.error('Error uploading file:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('ENOSPC')) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Not enough disk space to upload file' },
            { status: 507 }
          )
        );
      }

      if (error.message.includes('EACCES')) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Permission denied to write file' },
            { status: 500 }
          )
        );
      }
    }

    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    );
  }
}
