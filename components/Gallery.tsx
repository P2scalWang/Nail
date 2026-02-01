import React, { useState, useEffect } from 'react';
import { GalleryImage } from '../types';
import { galleryService } from '../firebase';
import { Loader2, X, ZoomIn } from 'lucide-react';

const Gallery: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const data = await galleryService.getImages();
        setImages(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-rose-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-bold font-luxury text-rose-500">อัลบั้มลายเล็บ</h2>
                <p className="text-sm text-stone-500">ผลงานเล็บสวยๆ เพื่อเป็นไอเดียสำหรับคุณ</p>
            </div>

            {images.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-100">
                    <p className="text-stone-400">ยังไม่มีรูปภาพในแกลเลอรี</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            onClick={() => setSelectedImage(img)}
                            className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all bg-stone-100"
                        >
                            <img
                                src={img.imageUrl}
                                alt={img.title || 'Nail Design'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative max-w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.title}
                            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain"
                        />
                        {selectedImage.title && (
                            <div className="mt-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium">
                                {selectedImage.title}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
