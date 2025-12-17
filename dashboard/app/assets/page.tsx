"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Upload, Search, Image, Video, FileText, Download, Folder, Plus, ArrowLeft,
  Trash2, FileEdit, Grid3X3, List, Calendar, Filter, ChevronRight, ChevronDown,
  File, MoreVertical, Eye, Copy, FolderOpen, SortAsc, SortDesc, Clock, HardDrive,
  X, ZoomIn, ZoomOut, ChevronLeft, Maximize2, Minimize2, AlertCircle
} from "lucide-react"
import { useEffect, useState, ChangeEvent, useMemo, useCallback, DragEvent, KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Asset {
  name: string;
  isDirectory: boolean;
  size: number;
  lastModified: string;
  path?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [folderName, setFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [itemToDelete, setItemToDelete] = useState<Asset | null>(null);
  const [itemToRename, setItemToRename] = useState<Asset | null>(null);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const joinPath = (...parts: string[]) => {
    return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
  }

  const dirname = (p: string) => {
    return p.substring(0, p.lastIndexOf('/'));
  }

  const getFileUrl = (asset: Asset) => {
    return `/api/assets/download?path=${encodeURIComponent(joinPath(currentPath, asset.name))}`;
  }

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  const isImageFile = (fileName: string) => {
    const ext = getFileExtension(fileName);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  }

  const isVideoFile = (fileName: string) => {
    const ext = getFileExtension(fileName);
    return ['mp4', 'mov', 'avi', 'webm', 'mkv', 'ogv'].includes(ext);
  }

  const isPdfFile = (fileName: string) => {
    return getFileExtension(fileName) === 'pdf';
  }

  const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  async function fetchAssets(p: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/assets?path=${encodeURIComponent(p)}`);
      const data = await res.json();
      setAssets(data.files || []);
    } catch (error) {
      console.error("Failed to fetch assets", error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssets(currentPath);
  }, [currentPath]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (previewAsset) {
        if (e.key === 'Escape') {
          setPreviewAsset(null);
          setImageZoom(1);
          setIsFullscreen(false);
        } else if (e.key === 'ArrowRight') {
          handleNextAsset();
        } else if (e.key === 'ArrowLeft') {
          handlePreviousAsset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewAsset, assets]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
      return 'File type not allowed';
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<void> => {
    const validation = validateFile(file);
    if (validation) {
      setUploadProgress(prev => [...prev, {
        fileName: file.name,
        progress: 100,
        status: 'error',
        error: validation
      }]);
      return;
    }

    setUploadProgress(prev => [...prev, {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);

    try {
      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadProgress(prev => prev.map(p =>
        p.fileName === file.name ? { ...p, progress: 100, status: 'success' as const } : p
      ));
    } catch (error) {
      setUploadProgress(prev => prev.map(p =>
        p.fileName === file.name ? { ...p, progress: 100, status: 'error' as const, error: 'Upload failed' } : p
      ));
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await handleFilesUpload(Array.from(files));
    event.target.value = '';
  };

  const handleFilesUpload = async (files: File[]) => {
    setUploadProgress([]);

    await Promise.all(files.map(file => uploadFile(file)));

    setTimeout(() => {
      setUploadProgress([]);
      fetchAssets(currentPath);
    }, 2000);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFilesUpload(files);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName) return;

    try {
      const response = await fetch('/api/assets/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: joinPath(currentPath, folderName) }),
      });

      if (response.ok) {
        setFolderName("");
        setIsCreateFolderOpen(false);
        await fetchAssets(currentPath);
      } else {
        const data = await response.json();
        console.error('Folder creation failed:', data.error);
      }
    } catch (error) {
      console.error('Folder creation error:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/assets?path=${encodeURIComponent(joinPath(currentPath, itemToDelete.name))}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItemToDelete(null);
        await fetchAssets(currentPath);
      } else {
        const data = await response.json();
        console.error('Delete failed:', data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleRenameItem = async () => {
    if (!itemToRename || !newName) return;

    try {
      const response = await fetch('/api/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: joinPath(currentPath, itemToRename.name),
          newPath: joinPath(currentPath, newName),
        }),
      });

      if (response.ok) {
        setItemToRename(null);
        setNewName("");
        await fetchAssets(currentPath);
      } else {
        const data = await response.json();
        console.error('Rename failed:', data.error);
      }
    } catch (error) {
      console.error('Rename error:', error);
    }
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const url = `/api/assets/download?path=${encodeURIComponent(joinPath(currentPath, asset.name))}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = asset.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleFolderClick = (folder: Asset) => {
    setCurrentPath(joinPath(currentPath, folder.name));
    setSelectedItems(new Set());
  };

  const handleGoBack = () => {
    setCurrentPath(dirname(currentPath));
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (assetName: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    const newSelection = new Set(selectedItems);
    if (newSelection.has(assetName)) {
      newSelection.delete(assetName);
    } else {
      newSelection.add(assetName);
    }
    setSelectedItems(newSelection);
  };

  const handleAssetClick = (asset: Asset) => {
    if (asset.isDirectory) {
      handleFolderClick(asset);
    } else {
      setPreviewAsset(asset);
      setImageZoom(1);
    }
  };

  const handleNextAsset = () => {
    if (!previewAsset) return;
    const currentIndex = fileAssets.findIndex(a => a.name === previewAsset.name);
    const nextIndex = (currentIndex + 1) % fileAssets.length;
    setPreviewAsset(fileAssets[nextIndex]);
    setImageZoom(1);
  };

  const handlePreviousAsset = () => {
    if (!previewAsset) return;
    const currentIndex = fileAssets.findIndex(a => a.name === previewAsset.name);
    const previousIndex = (currentIndex - 1 + fileAssets.length) % fileAssets.length;
    setPreviewAsset(fileAssets[previousIndex]);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = assets.filter(asset =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      // Directories always first
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          const extA = a.name.split('.').pop() || '';
          const extB = b.name.split('.').pop() || '';
          comparison = extA.localeCompare(extB);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [assets, searchQuery, sortBy, sortOrder]);

  const folders = filteredAssets.filter(asset => asset.isDirectory);
  const fileAssets = filteredAssets.filter(asset => !asset.isDirectory);

  const getFileIcon = (fileName: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };
    const extension = fileName.split('.').pop()?.toLowerCase();
    const className = `${sizeClasses[size]} text-arrow`;

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
      case "bmp":
        return <Image className={className} />
      case "mp4":
      case "mov":
      case "avi":
      case "webm":
      case "mkv":
        return <Video className={className} />
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
        return <FileText className={className} />
      default:
        return <File className={className} />
    }
  }

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return [{ name: 'Assets', path: '' }, ...parts.map((part, index) => ({
      name: part,
      path: parts.slice(0, index + 1).join('/'),
    }))];
  };

  const totalSize = useMemo(() => {
    return assets.filter(a => !a.isDirectory).reduce((acc, a) => acc + a.size, 0);
  }, [assets]);

  return (
    <div
      className="space-y-6"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-12 shadow-2xl border-4 border-dashed border-amg">
            <Upload className="h-24 w-24 mx-auto text-amg mb-4" />
            <h3 className="text-2xl font-bold text-center mb-2">Drop files here</h3>
            <p className="text-muted-foreground text-center">Release to upload files</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 w-96 space-y-2">
          {uploadProgress.map((progress, index) => (
            <Card key={index} className="border shadow-lg">
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  {progress.status === 'uploading' && (
                    <div className="animate-spin h-5 w-5 border-2 border-amg border-t-transparent rounded-full shrink-0 mt-0.5" />
                  )}
                  {progress.status === 'success' && (
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {progress.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{progress.fileName}</p>
                    {progress.status === 'error' && progress.error && (
                      <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                    )}
                    {progress.status === 'success' && (
                      <p className="text-xs text-green-600 mt-1">Upload complete</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewAsset} onOpenChange={(open) => {
        if (!open) {
          setPreviewAsset(null);
          setImageZoom(1);
          setIsFullscreen(false);
        }
      }}>
        <DialogContent className={`${isFullscreen ? 'max-w-full h-full' : 'max-w-6xl'} p-0`}>
          <DialogHeader className="sr-only">
            <DialogTitle>{previewAsset?.name || 'File Preview'}</DialogTitle>
          </DialogHeader>
          {previewAsset && (
            <div className="flex flex-col h-full">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b bg-midnight text-white">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(previewAsset.name, 'sm')}
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{previewAsset.name}</h3>
                    <p className="text-xs text-gray-300">
                      {formatBytes(previewAsset.size)} • {formatDate(previewAsset.lastModified)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isImageFile(previewAsset.name) && (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-white hover:bg-white/10">
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-300 w-12 text-center">
                        {Math.round(imageZoom * 100)}%
                      </span>
                      <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-white hover:bg-white/10">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="text-white hover:bg-white/10">
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(previewAsset)} className="text-white hover:bg-white/10">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPreviewAsset(null)} className="text-white hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Preview Content */}
              <div className={`flex-1 overflow-auto bg-gray-50 ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}`}>
                <div className="flex items-center justify-center h-full p-4">
                  {isImageFile(previewAsset.name) ? (
                    <div className="relative">
                      <img
                        src={getFileUrl(previewAsset)}
                        alt={previewAsset.name}
                        className="max-w-full max-h-full object-contain transition-transform"
                        style={{ transform: `scale(${imageZoom})` }}
                      />
                    </div>
                  ) : isVideoFile(previewAsset.name) ? (
                    <video
                      src={getFileUrl(previewAsset)}
                      controls
                      className="max-w-full max-h-full"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : isPdfFile(previewAsset.name) ? (
                    <iframe
                      src={getFileUrl(previewAsset)}
                      className="w-full h-full border-0"
                      title={previewAsset.name}
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This file type cannot be previewed in the browser
                      </p>
                      <Button onClick={() => handleDownload(previewAsset)} className="bg-amg hover:bg-amg/90">
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Navigation */}
              {fileAssets.length > 1 && (
                <div className="flex items-center justify-between p-4 border-t bg-white">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousAsset}
                    disabled={fileAssets.findIndex(a => a.name === previewAsset.name) === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {fileAssets.findIndex(a => a.name === previewAsset.name) + 1} of {fileAssets.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextAsset}
                    disabled={fileAssets.findIndex(a => a.name === previewAsset.name) === fileAssets.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {itemToDelete?.isDirectory ? 'Folder' : 'File'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDeleteItem} variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!itemToRename} onOpenChange={(isOpen) => { if (!isOpen) { setItemToRename(null); setNewName(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="New name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameItem()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRenameItem} className="bg-amg hover:bg-amg/90">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Media Assets
          </h1>
          <p className="mt-1 text-muted-foreground">
            Professional file manager for marketing images, videos, and documents
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Folder name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateFolder} className="bg-amg hover:bg-amg/90">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="bg-amg hover:bg-amg/90 text-white" asChild>
            <label htmlFor="file-upload" className="cursor-pointer flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </label>
          </Button>
          <Input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Folder className="h-4 w-4" />
          <span>{folders.length} folders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <File className="h-4 w-4" />
          <span>{fileAssets.length} files</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive className="h-4 w-4" />
          <span>{formatBytes(totalSize)}</span>
        </div>
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-1.5 text-amg font-medium">
            <span>{selectedItems.size} selected</span>
          </div>
        )}
      </div>

      {/* Breadcrumbs & Toolbar */}
      <Card className="border">
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-sm">
              {getBreadcrumbs().map((crumb, index, arr) => (
                <div key={crumb.path} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentPath(crumb.path)}
                    className={`hover:text-amg transition-colors ${
                      index === arr.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {crumb.name}
                  </button>
                  {index < arr.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            {/* Search & Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-1.5" /> : <SortDesc className="h-4 w-4 mr-1.5" />}
                    {sortBy === 'name' ? 'Name' : sortBy === 'date' ? 'Date' : sortBy === 'size' ? 'Size' : 'Type'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>Size</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('type')}>Type</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Sidebar - Folder Tree */}
        <div className="w-64 shrink-0">
          <Card className="border sticky top-4">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Folders</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-2 pb-3">
              {loading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-0.5">
                  {currentPath && (
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm text-left"
                    >
                      <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">..</span>
                    </button>
                  )}
                  {folders.length === 0 && !currentPath && (
                    <p className="text-sm text-muted-foreground px-2 py-2">No folders</p>
                  )}
                  {folders.map((folder) => (
                    <div key={folder.name} className="group">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleFolderClick(folder)}
                          className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm text-left"
                        >
                          <FolderOpen className="h-4 w-4 text-amber-500" />
                          <span className="truncate">{folder.name}</span>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setItemToRename(folder); setNewName(folder.name); }}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setItemToDelete(folder)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Card className="border">
              <CardContent className="py-12 text-center">
                <div className="animate-spin h-8 w-8 border-2 border-amg border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-muted-foreground">Loading files...</p>
              </CardContent>
            </Card>
          ) : fileAssets.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No files in this folder</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag files here or click to upload
                </p>
                <Button asChild variant="outline">
                  <label htmlFor="file-upload-empty" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-empty"
                  multiple
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border">
              <CardContent className="py-4">
                {viewMode === 'grid' ? (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {fileAssets.map((asset) => (
                      <div
                        key={asset.name}
                        className={`group relative border rounded-lg overflow-hidden hover:border-amg/50 transition-all cursor-pointer ${
                          selectedItems.has(asset.name) ? 'ring-2 ring-amg' : ''
                        }`}
                        onClick={() => handleAssetClick(asset)}
                      >
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                          {isImageFile(asset.name) ? (
                            <img
                              src={getFileUrl(asset)}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            getFileIcon(asset.name, 'lg')
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium truncate" title={asset.name}>
                            {asset.name}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                            <span>{formatBytes(asset.size)}</span>
                            <span>{formatDate(asset.lastModified)}</span>
                          </div>
                        </div>
                        <div
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="sm" className="h-6 w-6 p-0 shadow-lg">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewAsset(asset)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(asset)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToRename(asset); setNewName(asset.name); }}>
                                <FileEdit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); setItemToDelete(asset); }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div
                          className="absolute top-1 left-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItemSelection(asset.name);
                          }}
                        >
                          <div className={`h-5 w-5 rounded border-2 ${
                            selectedItems.has(asset.name)
                              ? 'bg-amg border-amg'
                              : 'bg-white border-gray-300 opacity-0 group-hover:opacity-100'
                          } transition-opacity flex items-center justify-center`}>
                            {selectedItems.has(asset.name) && (
                              <ChevronRight className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {fileAssets.map((asset) => (
                      <div
                        key={asset.name}
                        className={`group flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer ${
                          selectedItems.has(asset.name) ? 'bg-amg/5 ring-1 ring-amg/20' : ''
                        }`}
                        onClick={() => handleAssetClick(asset)}
                      >
                        <div
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItemSelection(asset.name);
                          }}
                        >
                          <div className={`h-4 w-4 rounded border-2 ${
                            selectedItems.has(asset.name)
                              ? 'bg-amg border-amg'
                              : 'bg-white border-gray-300'
                          } flex items-center justify-center`}>
                            {selectedItems.has(asset.name) && (
                              <ChevronRight className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {getFileIcon(asset.name, 'sm')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{asset.name}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="w-16 text-right">{formatBytes(asset.size)}</span>
                          <span className="w-24">{formatDate(asset.lastModified)}</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleDownload(asset); }}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewAsset(asset)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToRename(asset); setNewName(asset.name); }}>
                                <FileEdit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); setItemToDelete(asset); }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
