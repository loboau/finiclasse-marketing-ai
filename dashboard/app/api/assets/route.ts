import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { addSecurityHeaders, sanitizeInput } from '@/lib/security';

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
 * GET /api/assets
 * Lists all files and folders in a specified directory
 * Query params:
 *   - path: The relative path within the uploads directory (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestedPath = searchParams.get('path') || '';

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

    // Construct the full path to the assets directory
    const baseDir = path.join(process.cwd(), 'public/uploads');
    const assetsDir = path.join(baseDir, sanitizedPath);

    // Ensure the resolved path is still within the base directory
    const resolvedPath = path.resolve(assetsDir);
    const resolvedBase = path.resolve(baseDir);
    if (!resolvedPath.startsWith(resolvedBase)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Access denied: Path outside allowed directory' },
          { status: 403 }
        )
      );
    }

    // Try to read the directory
    let items;
    try {
      items = await fs.readdir(assetsDir, { withFileTypes: true });
    } catch (error) {
      // If directory doesn't exist, create it
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        await fs.mkdir(assetsDir, { recursive: true });
        return addSecurityHeaders(NextResponse.json({ files: [] }));
      }
      throw error;
    }

    // Get file/folder details
    const files = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(assetsDir, item.name);
        const stats = await fs.stat(itemPath);

        return {
          name: item.name,
          isDirectory: item.isDirectory(),
          size: stats.size,
          lastModified: stats.mtime,
          path: path.join(sanitizedPath, item.name),
        };
      })
    );

    // Sort: directories first, then by name
    files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return addSecurityHeaders(NextResponse.json({ files, currentPath: sanitizedPath }));
  } catch (error) {
    console.error('Error reading assets directory:', error);
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Failed to list assets' },
        { status: 500 }
      )
    );
  }
}

/**
 * PUT /api/assets
 * Renames a file or folder
 * Body:
 *   - oldPath: Current path of the item
 *   - newName: New name for the item (not full path, just the name)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldPath, newName } = body;

    // Validate inputs
    if (!oldPath || !newName) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'oldPath and newName are required' },
          { status: 400 }
        )
      );
    }

    // Validate and sanitize paths
    const sanitizedOldPath = validateAndSanitizePath(oldPath);
    const sanitizedNewName = sanitizeInput(newName);

    if (sanitizedOldPath === null) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid oldPath: Directory traversal detected' },
          { status: 400 }
        )
      );
    }

    // Validate new name doesn't contain path separators or invalid characters
    if (
      sanitizedNewName.includes('/') ||
      sanitizedNewName.includes('\\') ||
      sanitizedNewName.includes('..') ||
      !sanitizedNewName.trim()
    ) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid newName: Must be a simple filename without path separators' },
          { status: 400 }
        )
      );
    }

    const baseDir = path.join(process.cwd(), 'public/uploads');
    const fullOldPath = path.join(baseDir, sanitizedOldPath);

    // Calculate new path (same directory, new name)
    const oldDir = path.dirname(fullOldPath);
    const fullNewPath = path.join(oldDir, sanitizedNewName);

    // Verify both paths are within the base directory
    const resolvedOldPath = path.resolve(fullOldPath);
    const resolvedNewPath = path.resolve(fullNewPath);
    const resolvedBase = path.resolve(baseDir);

    if (
      !resolvedOldPath.startsWith(resolvedBase) ||
      !resolvedNewPath.startsWith(resolvedBase)
    ) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Access denied: Path outside allowed directory' },
          { status: 403 }
        )
      );
    }

    // Check if old path exists
    try {
      await fs.access(fullOldPath);
    } catch {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Source file or folder not found' },
          { status: 404 }
        )
      );
    }

    // Check if new path already exists
    try {
      await fs.access(fullNewPath);
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'A file or folder with this name already exists' },
          { status: 409 }
        )
      );
    } catch {
      // Good, it doesn't exist
    }

    // Perform the rename
    await fs.rename(fullOldPath, fullNewPath);

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        newPath: path.relative(baseDir, fullNewPath),
      })
    );
  } catch (error) {
    console.error('Error renaming item:', error);
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Failed to rename item' },
        { status: 500 }
      )
    );
  }
}

/**
 * DELETE /api/assets
 * Deletes a file or folder
 * Query params:
 *   - path: The path to the item to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const itemPath = searchParams.get('path');

    if (!itemPath) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Path parameter is required' },
          { status: 400 }
        )
      );
    }

    // Validate and sanitize the path
    const sanitizedPath = validateAndSanitizePath(itemPath);
    if (sanitizedPath === null || sanitizedPath === '') {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid path: Cannot delete root directory or use directory traversal' },
          { status: 400 }
        )
      );
    }

    const baseDir = path.join(process.cwd(), 'public/uploads');
    const fullPath = path.join(baseDir, sanitizedPath);

    // Verify the path is within the base directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedBase = path.resolve(baseDir);
    if (!resolvedPath.startsWith(resolvedBase) || resolvedPath === resolvedBase) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Access denied: Cannot delete root directory or paths outside allowed directory' },
          { status: 403 }
        )
      );
    }

    // Check if the item exists
    let stats;
    try {
      stats = await fs.stat(fullPath);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'File or folder not found' },
            { status: 404 }
          )
        );
      }
      throw error;
    }

    // Delete the item
    if (stats.isDirectory()) {
      await fs.rm(fullPath, { recursive: true, force: true });
    } else {
      await fs.unlink(fullPath);
    }

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        deletedPath: sanitizedPath,
        wasDirectory: stats.isDirectory(),
      })
    );
  } catch (error) {
    console.error('Error deleting item:', error);
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Failed to delete item' },
        { status: 500 }
      )
    );
  }
}
