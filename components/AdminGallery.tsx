import React, { useState, useEffect } from 'react';
import { GalleryImage } from '../types';
import { galleryService } from '../firebase';
import { imgbbService } from '../services/imgbb';
import { Loader2, Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';

const AdminGallery: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        const data = await galleryService.getImages();
        setImages(data);
        setLoading(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        // Simple verification it's an image
        if (!file.type.startsWith('image/')) {
            alert('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น');
            setUploading(false);
            return;
        }

        // 1. Upload to ImgBB
        console.log("Starting ImgBB upload...");
        const imageUrl = await imgbbService.uploadImage(file);

        if (imageUrl) {
            // 2. Save to Firestore
            const success = await galleryService.addImage(imageUrl, 'Design');
            if (success) {
                fetchImages();
            } else {
                alert('Database save failed. Please try again.');
            }
        } else {
            alert('Image upload failed. Please try again.');
        }
        setUploading(false);
    };

    const handleDelete = async (img: GalleryImage) => {
        if (confirm('ต้องการลบรูปภาพนี้ใช่หรือไม่?')) {
            await galleryService.deleteImage(img.id!, img.storagePath);
            // Optimistic update
            setImages(prev => prev.filter(i => i.id !== img.id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <ImageIcon size={18} className="text-rose-500" />
                    จัดการแกลเลอรี
                </h3>
                <span className="text-xs font-bold text-slate-400">
                    {images.length} รูปภาพ
                </span>
            </div>

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all
          ${dragActive ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-300'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    accept="image/*"
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-rose-500" size={32} />
                        <p className="text-slate-500 font-medium">กำลังอัพโหลด...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                            <Upload size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">คลิกเพื่ออัพโหลด หรือลากไฟล์มาวาง</p>
                            <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ JPG, PNG</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="animate-spin text-rose-500 mx-auto" size={24} />
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">ยังไม่มีรูปภาพ</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                                src={img.imageUrl}
                                alt={img.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={() => handleDelete(img)}
                                    className="p-2 bg-white text-rose-600 rounded-full shadow-lg hover:bg-rose-50 transition-colors transform scale-90 group-hover:scale-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
