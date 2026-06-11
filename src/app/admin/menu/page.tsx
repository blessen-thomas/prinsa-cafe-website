'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Tag, Eye, EyeOff, X, Check } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import type { Dish, Category } from '@/lib/types';

// ── Utilities ─────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

function DeleteModal({
  category,
  error,
  loading,
  onCancel,
  onConfirm,
}: {
  category: Category;
  error: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-cat-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div className="bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 shrink-0 mt-0.5">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 id="delete-cat-title" className="font-heading text-lg font-semibold text-cream">
              Delete Category
            </h2>
            <p className="text-warm-gray text-sm mt-1.5 leading-relaxed">
              This will permanently delete{' '}
              <span className="text-cream font-medium">"{category.name}"</span>.
              This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-warm-gray hover:text-cream hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminMenuPage() {
  // ── Dish state ──────────────────────────────────────────────────────────────
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const defaultForm = {
    id: '', name: '', description: '', price: '',
    category_id: '', image_url: '', is_veg: true, is_available: true, is_featured: false,
  };
  const [form, setForm] = useState(defaultForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const q = searchQuery.toLowerCase();
    return dishes.filter((dish) => {
      const cat = ((dish as any).categories?.name ?? '').toLowerCase();
      return dish.name.toLowerCase().includes(q) || cat.includes(q);
    });
  }, [dishes, searchQuery]);

  // ── Tab state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'dishes' | 'categories'>('dishes');

  // ── Category management state ────────────────────────────────────────────────
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const [savingCat, setSavingCat] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [catError, setCatError] = useState('');

  // ── Data fetching ────────────────────────────────────────────────────────────

  /**
   * Fetch and sync categories from the admin endpoint (includes hidden).
   * Updates both the admin list and the dish-form dropdown.
   */
  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.data) {
        setAdminCategories(json.data);
        setCategories(json.data);
      }
    } catch { /* silent */ }
  };

  const fetchData = async () => {
    try {
      const [dRes, cRes] = await Promise.all([
        fetch('/api/admin/menu'),
        fetch('/api/admin/categories'),
      ]);
      const d = await dRes.json();
      const c = await cRes.json();

      if (d.data) {
        const normalized = d.data.map((dish: any) => ({
          ...dish,
          categories: dish.categories ?? (dish.category
            ? { name: dish.category, slug: dish.category_id }
            : undefined),
          category: dish.category ?? dish.categories ?? undefined,
        }));
        setDishes(normalized);
      }
      if (c.data) {
        setAdminCategories(c.data);
        setCategories(c.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Close delete modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteTarget && !deleting) {
        setDeleteTarget(null);
        setDeleteError('');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleteTarget, deleting]);

  // ── Dish handlers (unchanged) ────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = form.image_url;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const upData = await up.json();
        if (upData.url) imageUrl = upData.url;
      }
      const payload = { ...form, price: parseFloat(form.price), image_url: imageUrl };
      const method = form.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/menu', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setShowForm(false); setForm(defaultForm); setFile(null); fetchData(); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (dish: Dish) => {
    setForm({
      id: dish.id, name: dish.name, description: dish.description ?? '',
      price: dish.price.toString(), category_id: dish.category_id ?? '',
      image_url: dish.image_url ?? '', is_veg: dish.is_veg,
      is_available: dish.is_available, is_featured: dish.is_featured,
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

  // ── Category handlers ────────────────────────────────────────────────────────

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    setCatError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setCatError(json.error ?? 'Failed to create category.'); return; }
      setNewCatName('');
      await refreshCategories();
    } catch { setCatError('Network error. Please try again.'); }
    finally { setAddingCat(false); }
  };

  const handleSaveEdit = async () => {
    if (!editingCat?.name.trim()) return;
    setSavingCat(true);
    setCatError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCat.id, name: editingCat.name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setCatError(json.error ?? 'Failed to update category.'); return; }
      setEditingCat(null);
      await refreshCategories();
    } catch { setCatError('Network error. Please try again.'); }
    finally { setSavingCat(false); }
  };

  const handleToggleVisibility = async (cat: Category) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, is_visible: !cat.is_visible }),
      });
      if (res.ok) await refreshCategories();
    } catch { /* silent */ }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/categories?id=${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) { setDeleteError(json.error ?? 'Failed to delete category.'); return; }
      setDeleteTarget(null);
      await refreshCategories();
    } catch { setDeleteError('Network error. Please try again.'); }
    finally { setDeleting(false); }
  };

  // ── Shared input style ───────────────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2 rounded bg-dark border border-white/10 text-cream focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-cream">Menu Management</h1>
          <p className="text-warm-gray mt-1">Manage dishes and categories</p>
        </div>

        {activeTab === 'dishes' && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-dark-card border border-white/10 text-cream text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors w-full sm:w-64"
              />
            </div>
            <Button
              onClick={() => { setForm(defaultForm); setShowForm(!showForm); }}
              variant="primary"
              className="w-full sm:w-auto"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Dish
            </Button>
          </div>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-dark-card p-1 rounded-xl border border-white/5 w-fit">
        {([
          { id: 'dishes', label: 'Dishes', count: dishes.length },
          { id: 'categories', label: 'Categories', count: adminCategories.length },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-gold-400 text-dark shadow-sm'
                : 'text-warm-gray hover:text-cream',
            ].join(' ')}
          >
            {tab.label}
            <span className={[
              'text-xs px-1.5 py-0.5 rounded-full font-normal tabular-nums',
              activeTab === tab.id ? 'bg-dark/20' : 'bg-white/5',
            ].join(' ')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ════════════════════ DISHES TAB ════════════════════════════════════ */}
      {activeTab === 'dishes' && (
        <>
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-dark-card rounded-2xl p-6 border border-white/5 mb-8">
              <h2 className="font-heading text-xl text-cream mb-4">
                {form.id ? 'Edit Dish' : 'New Dish'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-warm-gray mb-1">Name</label>
                  <input required type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm text-warm-gray mb-1">Price (₹)</label>
                  <input required type="number" step="0.01" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm text-warm-gray mb-1">Category</label>
                  <select required value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className={inputCls}>
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}{!c.is_visible ? ' (hidden)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-warm-gray mb-1">Image (Optional)</label>
                  <input type="file" accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-warm-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-400/10 file:text-gold-400 hover:file:bg-gold-400/20" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-warm-gray mb-1">Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className={inputCls} />
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
                {([
                  { key: 'is_veg', label: 'Veg' },
                  { key: 'is_available', label: 'Available' },
                  { key: 'is_featured', label: 'Featured' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-cream cursor-pointer">
                    <input type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                      className="rounded bg-dark border-white/10 text-gold-400 focus:ring-gold-400" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="gold" loading={submitting}>
                  {form.id ? 'Save Changes' : 'Add Dish'}
                </Button>
              </div>
            </form>
          )}

          {loading ? <LoadingSpinner /> : (
            <>
              <div className="mb-4 text-sm text-warm-gray">
                Showing {filteredDishes.length} of {dishes.length} dishes
              </div>

              {/* Mobile cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredDishes.map((dish) => (
                  <div key={dish.id} className="bg-dark-card rounded-2xl border border-[#3D3030] p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-heading font-bold text-gold-400 text-lg">{dish.name}</div>
                        <p className="text-sm text-warm-gray">{(dish as any).categories?.name ?? '-'}</p>
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
                      <button onClick={() => handleEdit(dish)}
                        className="p-2 text-warm-gray hover:text-cream rounded-lg transition-colors flex items-center justify-center bg-dark hover:bg-white/5 flex-1 max-w-[100px]">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </button>
                      <button onClick={() => handleDelete(dish.id)}
                        className="p-2 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center bg-red-900/10 hover:bg-red-900/20 flex-1 max-w-[100px]">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
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
                    {filteredDishes.map((dish) => (
                      <tr key={dish.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-medium">{dish.name}</td>
                        <td className="p-4">{(dish as any).categories?.name ?? '-'}</td>
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
                          <button onClick={() => handleEdit(dish)} aria-label="Edit dish"
                            className="p-2 text-warm-gray hover:text-cream rounded-lg transition-colors mr-1">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(dish.id)} aria-label="Delete dish"
                            className="p-2 text-red-400 hover:text-red-300 rounded-lg transition-colors">
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
        </>
      )}

      {/* ════════════════════ CATEGORIES TAB ════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-6">

          {/* Add category form */}
          <div className="bg-dark-card rounded-2xl p-6 border border-white/5">
            <h2 className="font-heading text-lg font-semibold text-cream mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gold-400" />
              Add Category
            </h2>
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  id="new-category-name"
                  type="text"
                  placeholder="Category name (e.g. Biriyani Specials)"
                  value={newCatName}
                  onChange={(e) => { setNewCatName(e.target.value); setCatError(''); }}
                  maxLength={80}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark border border-white/10 text-cream placeholder:text-warm-gray/50 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors"
                />
                {newCatName.trim() && (
                  <p className="text-xs text-warm-gray/60 mt-1.5 ml-1">
                    Slug:{' '}
                    <span className="text-gold-400/80 font-mono">{slugify(newCatName)}</span>
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="gold"
                loading={addingCat}
                icon={<Plus className="w-4 h-4" />}
                className="shrink-0 w-full sm:w-auto"
              >
                Add Category
              </Button>
            </form>
            {catError && (
              <p className="mt-3 text-sm text-red-400 flex items-start gap-1.5">
                <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {catError}
              </p>
            )}
          </div>

          {/* Category list */}
          <div className="bg-dark-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-cream">All Categories</h2>
              <span className="text-xs text-warm-gray bg-white/5 px-2.5 py-1 rounded-full tabular-nums">
                {adminCategories.length} total
              </span>
            </div>

            {adminCategories.length === 0 ? (
              <div className="p-10 text-center text-warm-gray text-sm">
                No categories yet. Add your first one above.
              </div>
            ) : (
              <>
                {/* ── Desktop table ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-dark-lighter border-b border-white/5 text-warm-gray">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4">Visibility</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminCategories.map((cat) =>
                        editingCat?.id === cat.id ? (
                          /* Edit row */
                          <tr key={cat.id} className="bg-gold-400/[0.04]">
                            <td className="p-3">
                              <input
                                autoFocus
                                type="text"
                                value={editingCat.name}
                                maxLength={80}
                                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') { e.preventDefault(); handleSaveEdit(); }
                                  if (e.key === 'Escape') { setEditingCat(null); setCatError(''); }
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-dark border border-gold-400/40 text-cream focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none text-sm"
                              />
                            </td>
                            <td className="p-3 font-mono text-xs text-warm-gray/50">
                              {slugify(editingCat.name)}
                            </td>
                            <td className="p-3 text-warm-gray/30 text-xs">—</td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => { setEditingCat(null); setCatError(''); }}
                                  className="px-3 py-1.5 rounded-lg text-xs text-warm-gray hover:text-cream hover:bg-white/5 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  disabled={savingCat || !editingCat.name.trim()}
                                  className="px-3 py-1.5 rounded-lg text-xs bg-gold-400/20 text-gold-400 hover:bg-gold-400/30 border border-gold-400/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {savingCat
                                    ? <span className="w-3 h-3 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                                    : <Check className="w-3 h-3" />}
                                  Save
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          /* Normal row */
                          <tr key={cat.id} className={`hover:bg-white/[0.02] transition-opacity ${!cat.is_visible ? 'opacity-50' : ''}`}>
                            <td className="p-4 font-medium text-cream">{cat.name}</td>
                            <td className="p-4 font-mono text-xs text-warm-gray">{cat.slug}</td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleVisibility(cat)}
                                title={cat.is_visible ? 'Click to hide from public menu' : 'Click to show on public menu'}
                                className={[
                                  'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors',
                                  cat.is_visible
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                    : 'bg-white/5 text-warm-gray border-white/10 hover:bg-white/10',
                                ].join(' ')}
                              >
                                {cat.is_visible
                                  ? <><Eye className="w-3 h-3" /> Visible</>
                                  : <><EyeOff className="w-3 h-3" /> Hidden</>}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => { setEditingCat({ id: cat.id, name: cat.name }); setCatError(''); }}
                                aria-label={`Edit ${cat.name}`}
                                className="p-2 text-warm-gray hover:text-cream rounded-lg transition-colors mr-1 hover:bg-white/5"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setDeleteTarget(cat); setDeleteError(''); }}
                                aria-label={`Delete ${cat.name}`}
                                className="p-2 text-red-400 hover:text-red-300 rounded-lg transition-colors hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile cards ── */}
                <div className="md:hidden divide-y divide-white/5">
                  {adminCategories.map((cat) => (
                    <div key={cat.id} className={`p-4 transition-opacity ${!cat.is_visible ? 'opacity-50' : ''}`}>
                      {editingCat?.id === cat.id ? (
                        /* Mobile edit form */
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-warm-gray mb-1 block">Category Name</label>
                            <input
                              autoFocus
                              type="text"
                              value={editingCat.name}
                              maxLength={80}
                              onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') { setEditingCat(null); setCatError(''); }
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-dark border border-gold-400/40 text-cream focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none text-sm"
                            />
                            {editingCat.name.trim() && (
                              <p className="text-xs text-warm-gray/60 mt-1.5 ml-0.5">
                                Slug:{' '}
                                <span className="text-gold-400/80 font-mono">{slugify(editingCat.name)}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => { setEditingCat(null); setCatError(''); }}
                              className="px-4 py-2 rounded-lg text-sm text-warm-gray hover:text-cream hover:bg-white/5 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={savingCat || !editingCat.name.trim()}
                              className="px-4 py-2 rounded-lg text-sm bg-gold-400/20 text-gold-400 hover:bg-gold-400/30 border border-gold-400/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {savingCat
                                ? <span className="w-3.5 h-3.5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                                : <Check className="w-3.5 h-3.5" />}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Mobile normal card */
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-cream">{cat.name}</p>
                            <p className="text-xs text-warm-gray/60 font-mono mt-0.5 truncate">{cat.slug}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleToggleVisibility(cat)}
                              title={cat.is_visible ? 'Hide from public menu' : 'Show on public menu'}
                              className={[
                                'p-2 rounded-lg border transition-colors',
                                cat.is_visible
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                  : 'bg-white/5 text-warm-gray border-white/10 hover:bg-white/10',
                              ].join(' ')}
                            >
                              {cat.is_visible
                                ? <Eye className="w-4 h-4" />
                                : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setEditingCat({ id: cat.id, name: cat.name }); setCatError(''); }}
                              aria-label={`Edit ${cat.name}`}
                              className="p-2 text-warm-gray hover:text-cream rounded-lg transition-colors hover:bg-white/5"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(cat); setDeleteError(''); }}
                              aria-label={`Delete ${cat.name}`}
                              className="p-2 text-red-400 hover:text-red-300 rounded-lg transition-colors hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          error={deleteError}
          loading={deleting}
          onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
