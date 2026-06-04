'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GalleryImage } from '@/lib/types';
import Lightbox from './Lightbox';

export default function MasonryGrid({ images }: { images: GalleryImage[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="masonry">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="masonry-item"
          >
            <button
              onClick={() => openLightbox(i)}
              className="relative group rounded-2xl overflow-hidden block w-full cursor-pointer"
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || img.caption || 'Gallery image'}
                width={600}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/40 transition-colors flex items-end">
                <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {img.caption && <p className="text-cream text-sm font-medium">{img.caption}</p>}
                  <p className="text-cream/60 text-xs capitalize">{img.category}</p>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <Lightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((p) => (p + 1) % images.length)}
        onPrev={() => setLightboxIndex((p) => (p - 1 + images.length) % images.length)}
      />
    </>
  );
}
