'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryImage } from '@/lib/types';

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({ images, currentIndex, isOpen, onClose, onNext, onPrev }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!images.length) return null;
  const img = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Counter */}
          <div className="absolute top-4 left-4 text-cream/70 text-sm z-10">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 text-cream/70 hover:text-cream z-10 p-2" aria-label="Close">
            <X className="w-7 h-7" />
          </button>

          {/* Prev */}
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream z-10 p-2" aria-label="Previous">
            <ChevronLeft className="w-10 h-10" />
          </button>

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] max-h-[85vh]"
          >
            <Image
              src={img.image_url}
              alt={img.alt_text || 'Gallery image'}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
              priority
            />
            {img.caption && (
              <p className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 text-cream text-center rounded-b-lg">
                {img.caption}
              </p>
            )}
          </motion.div>

          {/* Next */}
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream z-10 p-2" aria-label="Next">
            <ChevronRight className="w-10 h-10" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
