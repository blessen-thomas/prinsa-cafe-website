'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Trash2, Plus, Upload } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import type { GalleryImage } from '@/lib/types';
import { GALLERY_CATEGORIES } from '@/lib/constants';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ category: 'interior', caption: '', alt_text: '' });
  const [uploading, setUploading] = useState(false);

  const fetchImages = () => {
    fetch('/api/admin/gallery')
      .then((r) => r.json())
      .then((res) => { if (res.data) setImages(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', form.category);
    formData.append('caption', form.caption);
    formData.append('alt_text', form.alt_text);

    try {
      const res = await fetch('/api/admin/gallery', { method: 'POST', body: formData });
      if (res.ok) {
        setShowForm(false);
        setFile(null);
        setForm({ category: 'interior', caption: '', alt_text: '' });
        fetchImages();
      }
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_visible: !current }),
      });
      fetchImages();
    } catch (e) { console.error(e); }
  };

  const deleteImage = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await fetch(`/api/admin/gallery?id=${id}&url=${encodeURIComponent(url)}`, { method: 'DELETE' });
      fetchImages();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-cream">Gallery</h1>
          <p className="text-warm-gray mt-1">Manage website photos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Add Photo
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="bg-dark-card rounded-2xl p-6 border border-white/5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-1">Image File</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-dark">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-warm-gray mb-2" />
                  <span className="text-cream text-sm">{file ? file.name : 'Click to select an image'}</span>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-white/10 text-cream focus:border-gold-400 focus:ring-1 outline-none text-sm">
                  {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1">Caption (optional)</label>
                <input type="text" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-white/10 text-cream focus:border-gold-400 focus:ring-1 outline-none text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="gold" loading={uploading} disabled={!file}>Upload</Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className={`bg-dark-card rounded-2xl overflow-hidden border border-white/5 transition-opacity ${!img.is_visible ? 'opacity-50' : ''}`}>
              <div className="relative h-48 bg-dark">
                <Image src={img.image_url} alt={img.alt_text || ''} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => toggleVisibility(img.id, img.is_visible)} className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 backdrop-blur-sm" title={img.is_visible ? 'Hide' : 'Show'}>
                    {img.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteImage(img.id, img.image_url)} className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 backdrop-blur-sm" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gold-400 uppercase tracking-wider">{img.category}</span>
                </div>
                {img.caption ? (
                  <p className="text-cream text-sm">{img.caption}</p>
                ) : (
                  <p className="text-warm-gray/50 text-sm italic">No caption</p>
                )}
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full py-12 text-center text-warm-gray bg-dark-card rounded-2xl border border-white/5">
              No images uploaded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
