# Media Assets API Documentation

This directory contains the Media Assets API routes for the Finiclasse Marketing Dashboard. These routes provide secure file and folder management capabilities for the Mercedes-Benz dealership marketing system.

## Security Features

All routes implement comprehensive security measures:

- **Directory Traversal Protection**: Path validation prevents accessing files outside the uploads directory
- **Input Sanitization**: All user inputs are sanitized to prevent injection attacks
- **File Type Validation**: Only allowed file types (images, videos, documents) can be uploaded
- **File Size Limits**: Maximum file size of 10MB enforced
- **Security Headers**: All responses include security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Path Resolution**: Double verification that all paths resolve within the allowed directory

## Base Directory

All file operations are restricted to: `/dashboard/public/uploads/`

## API Endpoints

### 1. List Assets - GET /api/assets

Lists all files and folders in a specified directory.

**Query Parameters:**
- `path` (optional): Relative path within the uploads directory

**Example Request:**
```bash
GET /api/assets?path=campaigns/2024
```

**Success Response (200):**
```json
{
  "files": [
    {
      "name": "banner.jpg",
      "isDirectory": false,
      "size": 245760,
      "lastModified": "2024-12-17T00:00:00.000Z",
      "path": "campaigns/2024/banner.jpg"
    },
    {
      "name": "videos",
      "isDirectory": true,
      "size": 4096,
      "lastModified": "2024-12-17T00:00:00.000Z",
      "path": "campaigns/2024/videos"
    }
  ],
  "currentPath": "campaigns/2024"
}
```

**Error Responses:**
- `400`: Invalid path (directory traversal detected)
- `403`: Access denied (path outside allowed directory)
- `500`: Failed to list assets

---

### 2. Rename Asset - PUT /api/assets

Renames a file or folder.

**Request Body:**
```json
{
  "oldPath": "campaigns/2024/old-banner.jpg",
  "newName": "new-banner.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "newPath": "campaigns/2024/new-banner.jpg"
}
```

**Error Responses:**
- `400`: Missing required fields or invalid path/name
- `403`: Access denied (path outside allowed directory)
- `404`: Source file or folder not found
- `409`: A file or folder with the new name already exists
- `500`: Failed to rename item

**Notes:**
- `newName` must be just the filename, not a full path
- Cannot contain path separators (/, \) or parent directory references (..)

---

### 3. Delete Asset - DELETE /api/assets

Deletes a file or folder (including all contents if folder).

**Query Parameters:**
- `path` (required): Relative path to the item to delete

**Example Request:**
```bash
DELETE /api/assets?path=campaigns/2024/old-banner.jpg
```

**Success Response (200):**
```json
{
  "success": true,
  "deletedPath": "campaigns/2024/old-banner.jpg",
  "wasDirectory": false
}
```

**Error Responses:**
- `400`: Missing path parameter or invalid path
- `403`: Access denied (cannot delete root or path outside allowed directory)
- `404`: File or folder not found
- `500`: Failed to delete item

**Notes:**
- Deleting a folder removes all its contents recursively
- Cannot delete the root uploads directory

---

### 4. Upload File - POST /api/assets/upload

Uploads a file to the specified directory.

**Request:**
- Content-Type: `multipart/form-data`

**Form Fields:**
- `file` (required): The file to upload
- `path` (optional): Relative path within uploads directory

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('path', 'campaigns/2024');

const response = await fetch('/api/assets/upload', {
  method: 'POST',
  body: formData
});
```

**Success Response (200):**
```json
{
  "success": true,
  "file": {
    "name": "banner-1734393600000.jpg",
    "originalName": "banner.jpg",
    "size": 245760,
    "type": "image/jpeg",
    "path": "uploads/campaigns/2024/banner-1734393600000.jpg",
    "url": "/uploads/campaigns/2024/banner-1734393600000.jpg"
  }
}
```

**Error Responses:**
- `400`: No file provided, file is empty, or invalid path
- `403`: Access denied (path outside allowed directory)
- `413`: File too large (max 10MB)
- `500`: Failed to upload file
- `507`: Not enough disk space

**Allowed File Types:**

*Images:*
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

*Videos:*
- MP4 (.mp4)
- MPEG (.mpeg, .mpg)
- QuickTime (.mov)
- AVI (.avi)
- WebM (.webm)

*Documents:*
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Text (.txt)
- CSV (.csv)

**Notes:**
- Maximum file size: 10MB
- Files are automatically renamed with timestamp to prevent conflicts
- Directory is created automatically if it doesn't exist

---

### 5. Create Folder - POST /api/assets/folders

Creates a new folder in the uploads directory.

**Request Body:**
```json
{
  "folderName": "new-campaign",
  "path": "campaigns/2024"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "folder": {
    "name": "new-campaign",
    "path": "campaigns/2024/new-campaign",
    "fullPath": "campaigns/2024/new-campaign"
  }
}
```

**Error Responses:**
- `400`: Missing folder name, invalid folder name, or invalid path
- `403`: Access denied (path outside allowed directory)
- `409`: A folder with this name already exists
- `500`: Failed to create folder
- `507`: Not enough disk space

**Folder Name Rules:**
- Cannot contain special characters: `/ \ : * ? " < > |`
- Cannot be empty or only whitespace
- Cannot be reserved names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
- Cannot be `.` or `..`
- Maximum length: 255 characters

**Notes:**
- Parent directories are created automatically if they don't exist
- Folder names are sanitized automatically

---

## Usage Examples

### JavaScript/TypeScript Examples

#### List Files
```typescript
const response = await fetch('/api/assets?path=campaigns/2024');
const { files, currentPath } = await response.json();
```

#### Upload File
```typescript
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('path', 'campaigns/2024');

const response = await fetch('/api/assets/upload', {
  method: 'POST',
  body: formData
});

const { success, file } = await response.json();
if (success) {
  console.log('File uploaded:', file.url);
}
```

#### Create Folder
```typescript
const response = await fetch('/api/assets/folders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderName: 'summer-campaign',
    path: 'campaigns/2024'
  })
});

const { success, folder } = await response.json();
```

#### Rename File
```typescript
const response = await fetch('/api/assets', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    oldPath: 'campaigns/2024/old-name.jpg',
    newName: 'new-name.jpg'
  })
});

const { success, newPath } = await response.json();
```

#### Delete File
```typescript
const response = await fetch('/api/assets?path=campaigns/2024/old-file.jpg', {
  method: 'DELETE'
});

const { success } = await response.json();
```

---

## Security Best Practices

1. **Never trust user input**: All paths and filenames are validated and sanitized
2. **Path resolution**: Paths are resolved and verified to be within the uploads directory
3. **File type validation**: Both MIME type and file extension are checked
4. **Size limits**: Enforced at the API level to prevent disk space exhaustion
5. **Error handling**: Specific error messages help identify issues without exposing sensitive information
6. **Security headers**: All responses include appropriate security headers

---

## Directory Structure

```
/dashboard/public/uploads/
├── .gitkeep
├── campaigns/
│   ├── 2024/
│   │   ├── summer/
│   │   │   ├── banner.jpg
│   │   │   └── video.mp4
│   │   └── winter/
│   └── 2025/
├── brochures/
│   ├── c-class.pdf
│   └── e-class.pdf
└── social-media/
    └── posts/
```

---

## Error Handling

All routes return consistent error responses:

```typescript
{
  error: string;          // Human-readable error message
  [key: string]: any;     // Additional context (optional)
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `403`: Forbidden (security violation)
- `404`: Not Found
- `409`: Conflict (resource already exists)
- `413`: Payload Too Large
- `500`: Internal Server Error
- `507`: Insufficient Storage

---

## Testing

### Test Directory Traversal Protection

These requests should all be rejected with 400 or 403 errors:

```bash
# Attempt to access parent directory
GET /api/assets?path=../../etc/passwd

# Attempt to use absolute path
GET /api/assets?path=/etc/passwd

# Attempt to escape via filename
PUT /api/assets
{
  "oldPath": "test.jpg",
  "newName": "../../../etc/passwd"
}
```

### Test File Upload

```bash
curl -X POST http://localhost:3000/api/assets/upload \
  -F "file=@/path/to/image.jpg" \
  -F "path=test"
```

### Test Folder Creation

```bash
curl -X POST http://localhost:3000/api/assets/folders \
  -H "Content-Type: application/json" \
  -d '{"folderName": "test-folder", "path": ""}'
```

---

## Future Enhancements

Potential improvements for future versions:

1. **Image Optimization**: Automatic image compression and thumbnail generation
2. **Metadata Extraction**: Extract and store EXIF data from images
3. **CDN Integration**: Serve assets from a CDN for better performance
4. **Duplicate Detection**: Check file hashes to prevent duplicate uploads
5. **Versioning**: Keep track of file versions and allow rollback
6. **Quota Management**: Per-user or per-project storage limits
7. **Preview Generation**: Generate previews for videos and documents
8. **Search Functionality**: Full-text search across file names and metadata
