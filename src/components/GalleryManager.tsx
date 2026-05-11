import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import {
    uploadGalleryImage,
    getGalleryImages,
    deleteGalleryImage,
    updateMultipleGalleryImageOrders,
    GalleryImage,
} from '../lib/appwrite';
import { getCurrentUser } from '../lib/appwrite';
import { setScrollLock } from '../lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export const GalleryManager: React.FC = () => {
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; fileId: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load gallery images on mount
    useEffect(() => {
        loadGalleryImages();
    }, []);

    useEffect(() => {
        if (deleteConfirm) {
            setScrollLock(true);
        } else {
            setScrollLock(false);
        }
        return () => setScrollLock(false);
    }, [deleteConfirm]);

    const loadGalleryImages = async () => {
        setIsLoading(true);
        const images = await getGalleryImages();
        setGalleryImages(images);
        setIsLoading(false);
    };

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = `toast-${Date.now()}`;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be less than 5MB', 'error');
            return;
        }

        setIsUploading(true);
        try {
            const user = await getCurrentUser();
            if (!user) {
                showToast('Must be logged in to upload', 'error');
                return;
            }

            const result = await uploadGalleryImage(file, user.$id);
            if (result) {
                setGalleryImages(prev => [...prev, result].sort((a, b) => a.order - b.order));
                showToast('Image uploaded successfully', 'success');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                showToast('Failed to upload image', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Error uploading image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, imageId: string) => {
        e.preventDefault();
        setDraggedOverId(imageId);
    };

    const handleDragLeave = () => {
        setDraggedOverId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        setDraggedOverId(null);

        const draggedIdStr = e.dataTransfer.getData('text/plain');
        if (!draggedIdStr) return;

        const draggedIndex = galleryImages.findIndex(img => img.id === draggedIdStr);
        if (draggedIndex === -1 || draggedIndex === targetIndex) return;

        // Reorder array
        const newImages = Array.from(galleryImages);
        const draggedImage = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(targetIndex, 0, draggedImage);

        // Update order values
        const updates = newImages.map((img, idx) => ({
            galleryId: img.id,
            newOrder: idx,
        }));

        // Update UI immediately
        setGalleryImages(newImages.map((img, idx) => ({ ...img, order: idx })));

        // Save to server
        updateMultipleGalleryImageOrders(updates)
            .then(success => {
                if (!success) {
                    showToast('Failed to save order', 'error');
                    loadGalleryImages(); // Reload on failure
                }
            })
            .catch(error => {
                console.error('Update order error:', error);
                showToast('Error saving order', 'error');
                loadGalleryImages();
            });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, imageId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', imageId);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            const success = await deleteGalleryImage(deleteConfirm.id, deleteConfirm.fileId);
            if (success) {
                setGalleryImages(prev => prev.filter(img => img.id !== deleteConfirm.id));
                showToast('Image deleted successfully', 'success');
            } else {
                showToast('Failed to delete image', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Error deleting image', 'error');
        } finally {
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Upload New Image
                </h3>

                <div
                    className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileSelect(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mx-auto mb-3 text-blue-500" size={32} />
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Drop image here or click to select
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        JPG, PNG, WebP • Max 5MB
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        disabled={isUploading}
                    />
                </div>

                {isUploading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                        <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                        <span>Uploading...</span>
                    </div>
                )}
            </div>

            {/* Current Gallery Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Gallery Preview ({galleryImages.length})
                </h3>

                {isLoading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Loading gallery...
                    </div>
                ) : galleryImages.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle className="mx-auto text-gray-400 dark:text-gray-600 mb-2" size={32} />
                        <p className="text-gray-500 dark:text-gray-400">
                            No images in gallery yet. Upload one to get started!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {galleryImages.map((img) => (
                            <div
                                key={img.id}
                                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <img
                                    src={img.imageUrl}
                                    alt={`Gallery item ${img.order + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                                    <span className="text-white text-sm font-semibold bg-black/60 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        #{img.order + 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Draggable List */}
            {galleryImages.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Manage Order (Drag to Reorder)
                    </h3>

                    <div className="space-y-3">
                        {galleryImages.map((img, index) => (
                            <div
                                key={img.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, img.id)}
                                onDragOver={(e) => handleDragOver(e, img.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-transparent cursor-move hover:border-blue-300 dark:hover:border-blue-600 transition-all ${draggedOverId === img.id
                                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : ''
                                    }`}
                            >
                                {/* Order Number */}
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{index + 1}</span>
                                </div>

                                {/* Image Thumbnail */}
                                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                    <img
                                        src={img.imageUrl}
                                        alt={`Gallery item ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Image Info */}
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Image {index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Uploaded {new Date(img.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => setDeleteConfirm({ id: img.id, fileId: img.fileId })}
                                    className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete image"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-500" size={24} />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Image?
                            </h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            This will permanently remove this image from the gallery. This action cannot be
                            undone.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <div className="fixed bottom-4 right-4 space-y-2 z-40 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white pointer-events-auto animate-in slide-in-from-right-full ${toast.type === 'success'
                            ? 'bg-green-500'
                            : toast.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <AlertCircle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GalleryManager;
