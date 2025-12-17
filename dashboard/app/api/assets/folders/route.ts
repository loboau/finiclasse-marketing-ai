import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir } from 'fs/promises';
import { addSecurityHeaders } from '@/lib/security';

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
 * Validates folder name to ensure it's safe
 * @param folderName - The folder name to validate
 * @returns true if valid, false otherwise
 */
function validateFolderName(folderName: string): boolean {
  if (!folderName || typeof folderName !== 'string') {
    return false;
  }

  const trimmed = folderName.trim();

  // Check if empty after trimming
  if (!trimmed) {
    return false;
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f\/\\]/;
  if (invalidChars.test(trimmed)) {
    return false;
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  if (reservedNames.includes(trimmed.toUpperCase())) {
    return false;
  }

  // Check for directory traversal attempts
  if (trimmed.includes('..') || trimmed === '.' || trimmed === '..') {
    return false;
  }

  // Check length
  if (trimmed.length > 255) {
    return false;
  }

  return true;
}

/**
 * Sanitizes folder name by removing invalid characters
 * @param folderName - The folder name to sanitize
 * @returns Sanitized folder name
 */
function sanitizeFolderName(folderName: string): string {
  return folderName
    .replace(/[<>:"|?*\x00-\x1f\/\\]/g, '') // Remove invalid characters
    .replace(/\.\./g, '') // Remove ..
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .trim();
}

/**
 * POST /api/assets/folders
 * Creates a new folder in the uploads directory
 * Body:
 *   - folderName: The name of the folder to create (required)
 *   - path: The relative path within uploads directory where to create the folder (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderName, path: requestedPath = '' } = body;

    // Validate folder name is provided
    if (!folderName) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Folder name is required' },
          { status: 400 }
        )
      );
    }

    // Sanitize folder name
    const sanitizedFolderName = sanitizeFolderName(folderName);

    // Validate folder name
    if (!validateFolderName(sanitizedFolderName)) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            error: 'Invalid folder name. Folder names cannot contain special characters like / \\ : * ? " < > | and cannot be empty.',
            providedName: folderName,
          },
          { status: 400 }
        )
      );
    }

    // Validate and sanitize the parent path
    const sanitizedPath = validateAndSanitizePath(requestedPath);
    if (sanitizedPath === null) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid path: Directory traversal detected' },
          { status: 400 }
        )
      );
    }

    // Construct the full path
    const baseDir = path.join(process.cwd(), 'public/uploads');
    const parentDir = path.join(baseDir, sanitizedPath);
    const folderPath = path.join(parentDir, sanitizedFolderName);

    // Verify the resolved paths are within the base directory
    const resolvedParent = path.resolve(parentDir);
    const resolvedFolder = path.resolve(folderPath);
    const resolvedBase = path.resolve(baseDir);

    if (
      !resolvedParent.startsWith(resolvedBase) ||
      !resolvedFolder.startsWith(resolvedBase)
    ) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Access denied: Path outside allowed directory' },
          { status: 403 }
        )
      );
    }

    // Try to create the folder
    try {
      await mkdir(folderPath, { recursive: false });
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'EEXIST') {
          return addSecurityHeaders(
            NextResponse.json(
              { error: 'A folder with this name already exists' },
              { status: 409 }
            )
          );
        }

        if (error.code === 'ENOENT') {
          // Parent directory doesn't exist, create it first
          await mkdir(parentDir, { recursive: true });
          await mkdir(folderPath, { recursive: false });
        } else if (error.code === 'EACCES') {
          return addSecurityHeaders(
            NextResponse.json(
              { error: 'Permission denied to create folder' },
              { status: 500 }
            )
          );
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Calculate the relative path for the response
    const relativePath = path.relative(baseDir, folderPath);

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        folder: {
          name: sanitizedFolderName,
          path: relativePath,
          fullPath: path.join(sanitizedPath, sanitizedFolderName),
        },
      })
    );
  } catch (error) {
    console.error('Error creating folder:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('ENOSPC')) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Not enough disk space to create folder' },
            { status: 507 }
          )
        );
      }
    }

    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      )
    );
  }
}
