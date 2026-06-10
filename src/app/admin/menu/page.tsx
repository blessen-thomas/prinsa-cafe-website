'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import type { Dish, Category } from '@/lib/types';

export default function AdminMenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const defaultForm = { id: '', name: '', description: '', price: '', category_id: '', image_url: '', is_veg: true, is_available: true, is_featured: false };
  const [form, setForm] = useState(defaultForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [dRes, cRes] = await Promise.all([
        fetch('/api/admin/menu'),
        fetch('/api/menu/categories')
      ]);
      const d = await dRes.json();
      const c = await cRes.json();
      if (d.data) {
        // Normalize: ensure both 'category' and 'categories' keys are populated
        // regardless of whether data came from Supabase or the local JSON fallback.
        const normalized = d.data.map((dish: any) => ({
          ...dish,
          categories: dish.categories ?? (dish.category ? { name: dish.category, slug: dish.category_id } : undefined),
          category: dish.category ?? dish.categories ?? undefined,
        }));
        setDishes(normalized);
      }
      if (c.data) setCategories(c.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = form.image_url;
      
      // Upload new image if selected
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.url) imageUrl = uploadData.url;
      }

      const payload = {
        ...form,
        price: parseFloat(form.price),
        image_url: imageUrl
      };

      const method = form.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/menu', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setForm(defaultForm);
        setFile(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (dish: Dish) => {
    setForm({
      id: dish.id,
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      category_id: dish.category_id || '',
      image_url: dish.image_url || '',
      is_veg: dish.is_veg,
      is_available: dish.is_available,
      is_featured: dish.is_featured,
    });
    setFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-cream">Menu Management</h1>
          <p className="text-warm-gray mt-1">Manage dishes and categories</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setShowForm(!showForm); }} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Add Dish
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-card rounded-2xl p-6 border border-white/5 mb-8">
          <h2 className="font-heading text-xl text-cream mb-4">{form.id ? 'Edit Dish' : 'New Dish'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-warm-gray mb-1">Name</label>
              <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded bg-dark border border-white/10 text-cream" />
            </div>
            <div>
              <label className="block text-sm text-warm-gray mb-1">Price (₹)</label>
              <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 rounded bg-dark border border-white/10 text-cream" />
            </div>
            <div>
              <label className="block text-sm text-warm-gray mb-1">Category</label>
              <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full px-3 py-2 rounded bg-dark border border-white/10 text-cream">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-warm-gray mb-1">Image (Optional)</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-warm-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-400/10 file:text-gold-400 hover:file:bg-gold-400/20" />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-warm-gray mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 rounded bg-dark border border-white/10 text-cream" />
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
            <label className="flex items-center gap-2 text-sm text-cream cursor-pointer">
              <input type="checkbox" checked={form.is_veg} onChange={e => setForm({...form, is_veg: e.target.checked})} className="rounded bg-dark border-white/10 text-gold-400 focus:ring-gold-400" /> Veg
            </label>
            <label className="flex items-center gap-2 text-sm text-cream cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="rounded bg-dark border-white/10 text-gold-400 focus:ring-gold-400" /> Available
            </label>
            <label className="flex items-center gap-2 text-sm text-cream cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="rounded bg-dark border-white/10 text-gold-400 focus:ring-gold-400" /> Featured
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="gold" loading={submitting}>{form.id ? 'Save Changes' : 'Add Dish'}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {dishes.map((dish) => (
              <div key={dish.id} className="bg-dark-card rounded-2xl border border-white/5 p-4 flex flex-col gap-3 relative">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-medium text-cream text-base">{dish.name}</h3>
                    <p className="text-sm text-warm-gray">{(dish as any).categories?.name || '-'}</p>
                  </div>
                  <span className="font-medium text-cream whitespace-nowrap">₹{dish.price}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded ${dish.is_veg ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {dish.is_veg ? 'Veg' : 'Non-Veg'}
                  </span>
                  {!dish.is_available && <span className="px-2 py-0.5 rounded bg-warm-gray/10 text-warm-gray">Out of stock</span>}
                  {dish.is_featured && <span className="px-2 py-0.5 rounded bg-gold-400/10 text-gold-400">Featured</span>}
                </div>
                <div className="flex gap-2 justify-end mt-2 pt-3 border-t border-white/5">
                  <button onClick={() => handleEdit(dish)} className="p-2 text-warm-gray hover:text-cream rounded-lg transition-colors flex items-center justify-center bg-dark hover:bg-white/5 flex-1 max-w-[100px]">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </button>
                  <button onClick={() => handleDelete(dish.id)} className="p-2 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center bg-red-900/10 hover:bg-red-900/20 flex-1 max-w-[100px]">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-dark-card rounded-2xl border border-white/5 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-dark-lighter border-b border-white/5 text-warm-gray">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-cream/90">
                {dishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-medium">{dish.name}</td>
                    <td className="p-4">{(dish as any).categories?.name || '-'}</td>
                    <td className="p-4">₹{dish.price}</td>
                    <td className="p-4">
                      <div className="flex gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded ${dish.is_veg ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {dish.is_veg ? 'Veg' : 'Non-Veg'}
                        </span>
                        {!dish.is_available && <span className="px-2 py-0.5 rounded bg-warm-gray/10 text-warm-gray">Out of stock</span>}
                        {dish.is_featured && <span className="px-2 py-0.5 rounded bg-gold-400/10 text-gold-400">Featured</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(dish)} className="p-2 text-warm-gray hover:text-cream rounded-lg transition-colors mr-1" aria-label="Edit dish">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(dish.id)} className="p-2 text-red-400 hover:text-red-300 rounded-lg transition-colors" aria-label="Delete dish">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
