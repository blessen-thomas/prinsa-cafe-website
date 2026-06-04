'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  light?: boolean;
  className?: string;
}

export default function SectionHeader({ title, subtitle, align = 'center', light = false, className = '' }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}
    >
      <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${light ? 'text-cream' : 'text-coffee-800'}`}>
        {title}
      </h2>
      <div className={`gold-line ${align === 'center' ? 'mx-auto' : ''} mb-4`} />
      {subtitle && (
        <p className={`text-lg max-w-2xl ${align === 'center' ? 'mx-auto' : ''} ${light ? 'text-warm-gray-light' : 'text-warm-gray'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
