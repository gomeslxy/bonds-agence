'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { supabase } from '@/lib/supabase';
import { type Product } from '@/data/products';

const CATEGORIES = ['Corta-Ventos', 'Conjuntos', 'Kits Refletivos', 'Regatas', 'Acessórios'];
const SIZES_ALL  = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
const TAGS       = [{ label: '— Nenhum —', value: '' }, { label: 'HOT', value: 'HOT' }, { label: 'LANÇAMENTO', value: 'LANÇAMENTO' }, { label: 'EXCLUSIVO', value: 'EXCLUSIVO' }, { label: 'NOVO', value: 'NOVO' }, { label: 'SALE', value: 'SALE' }];

function newProduct(): Product {
  return {
    id:          `temp-${Date.now()}`,
    name:        '',
    subtitle:    '',
    price:       0,
    category:    'Corta-Ventos',
    image:       '',
    sizes:       ['M', 'G'],
    colors:      [{ name: 'Preto', hex: '#0a0a0a' }],
    description: '',
    features:    [],
    stock:       10,
    tag:         undefined,
    tagColor:    undefined,
  };
}

/* ── Neon input ─────────────────────────────────────────── */
function FInput({ label, value, onChange, placeholder = '', type = 'text', textarea = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; textarea?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const base = {
    fontFamily: "'Barlow Condensed', system-ui, sans-serif",
    background: focused ? 'rgba(255,69,0,0.04)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${focused ? '#FF4500' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused ? '0 0 12px rgba(255,69,0,0.15)' : 'none',
    borderRadius: '2px',
    color: '#fff',
    outline: 'none',
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  };
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5"
            style={{ fontFamily: "'Space Mono', monospace", color: focused ? '#FF4500' : 'rgba(255,255,255,0.3)' }}>
        {label}
      </span>
      {textarea
        ? <textarea rows={3} value={value} placeholder={placeholder}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    onChange={(e) => onChange(e.target.value)} style={{ ...base, resize: 'vertical' }} />
        : <input type={type} value={value} placeholder={placeholder}
                 onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                 onChange={(e) => onChange(e.target.value)} style={base} />
      }
    </label>
  );
}

/* ── Main form ──────────────────────────────────────────── */
export default function ProductForm({ onClose }: { onClose: () => void }) {
  const { editingProduct, saveProduct } = useAdmin();
  const [form, setForm] = useState<Product>(editingProduct ?? newProduct());
  const [previewError, setPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FF4500');

  useEffect(() => {
    setForm(editingProduct ?? newProduct());
    setPreviewError(false);
  }, [editingProduct]);

  const set = (key: keyof Product, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleSize = (sz: string) => {
    const sizes = form.sizes.includes(sz)
      ? form.sizes.filter((s) => s !== sz)
      : [...form.sizes, sz];
    set('sizes', sizes);
  };

  const addColor = () => {
    if (!newColorName) return;
    set('colors', [...form.colors, { name: newColorName, hex: newColorHex }]);
    setNewColorName(''); setNewColorHex('#FF4500');
  };

  const removeColor = (i: number) =>
    set('colors', form.colors.filter((_, idx) => idx !== i));

  const addFeature = () => {
    if (!newFeature) return;
    set('features', [...form.features, newFeature]);
    setNewFeature('');
  };

  const removeFeature = (i: number) =>
    set('features', form.features.filter((_, idx) => idx !== i));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      // Upload to 'products' bucket
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      set('image', publicUrl);
      setPreviewError(false);
    } catch (error: any) {
      console.error('Error uploading image:', error.message);
      alert('Erro ao fazer upload: ' + error.message + '\n\nCertifique-se de que o bucket "products" existe e é público no Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.image) {
      alert('Preencha Nome, Preço e URL da Imagem.'); return;
    }
    saveProduct(form);
    onClose();
  };

  const isNew = !editingProduct;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,69,0,0.2)',
          borderRadius: '4px',
          boxShadow: '0 0 60px rgba(255,34,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
             style={{ background: '#0d0d0d' }}>
          <h2 className="text-2xl" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{isNew ? 'NOVO' : 'EDITAR'} </span>
            <span style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PRODUTO</span>
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setForm({
                  ...newProduct(),
                  name: 'CORTA-VENTO BONDS ELITE',
                  subtitle: 'Black & Gold Edition',
                  price: 449.90,
                  category: 'Corta-Ventos',
                  image: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=800&q=90',
                  description: 'Corta-vento de alta performance com detalhes em dourado refletivo. Resistente a água e vento.',
                  sizes: ['P', 'M', 'G', 'GG'],
                  colors: [{ name: 'Preto/Ouro', hex: '#d4af37' }],
                  features: ['Refletivo Premium', 'Impermeável'],
                  stock: 25
                });
                setPreviewError(false);
              }}
              className="px-3 py-1 text-[10px] border border-white/10 text-white/30 hover:text-white hover:border-white/20 transition-all uppercase"
              style={{ fontFamily: "'Space Mono', monospace", borderRadius: '2px' }}
            >
              Carregar Modelo
            </button>
            <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Fire border */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg,#FF0000,#FF4500,#FFA500,transparent)' }} />

        <div className="p-6 space-y-6">
          {/* Image preview */}
          <div className="relative aspect-video overflow-hidden" style={{ borderRadius: '3px', background: '#111' }}>
            {form.image && !previewError
              ? <img src={form.image} alt="preview" onError={() => setPreviewError(true)}
                     className="w-full h-full object-cover" />
              : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <ImageIcon size={32} className="text-white/10" />
                  <span className="text-[10px] text-white/20" style={{ fontFamily: "'Space Mono', monospace" }}>
                    Cole a URL da imagem abaixo
                  </span>
                </div>
            }
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FInput label="Nome do Produto" value={form.name} onChange={(v) => set('name', v)} placeholder="CORTA-VENTO IGNITE" />
            <FInput label="Subtítulo" value={form.subtitle} onChange={(v) => set('subtitle', v)} placeholder="Fire Edition" />
          </div>

          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <FInput 
                  label="URL da Imagem" 
                  value={form.image}
                  onChange={(v) => { set('image', v); setPreviewError(false); }}
                  placeholder="https://images.unsplash.com/..." 
                />
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-all duration-200 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-fire-orange/10'
                  }`}
                  style={{
                    fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    borderRadius: '2px',
                    border: '1px solid rgba(255,69,0,0.3)',
                    color: '#FF4500'
                  }}
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {uploading ? 'SUBINDO...' : 'UPLOAD'}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <FInput label="Preço (R$)" type="number" value={form.price} onChange={(v) => set('price', parseFloat(v) || 0)} placeholder="349.90" />
            <FInput label="Preço Original (R$)" type="number" value={form.originalPrice ?? ''} onChange={(v) => set('originalPrice', v ? parseFloat(v) : undefined)} placeholder="Opcional" />
            <FInput label="Estoque (un)" type="number" value={form.stock} onChange={(v) => set('stock', parseInt(v) || 0)} placeholder="50" />
          </div>

          {/* Category + Tag */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 text-white/30"
                    style={{ fontFamily: "'Space Mono', monospace" }}>Categoria</span>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                      className="w-full px-3 py-2.5 text-white text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 text-white/30"
                    style={{ fontFamily: "'Space Mono', monospace" }}>Badge / Tag</span>
              <select value={form.tag ?? ''} onChange={(e) => set('tag', e.target.value || undefined)}
                      className="w-full px-3 py-2.5 text-white text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
                {TAGS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
          </div>

          {/* Description */}
          <FInput label="Descrição" value={form.description} onChange={(v) => set('description', v)}
                  placeholder="Descreva o produto..." textarea />

          {/* Sizes */}
          <div>
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-3 text-white/30"
                  style={{ fontFamily: "'Space Mono', monospace" }}>Tamanhos Disponíveis</span>
            <div className="flex gap-2 flex-wrap">
              {SIZES_ALL.map((sz) => {
                const on = form.sizes.includes(sz);
                return (
                  <button key={sz} onClick={() => toggleSize(sz)}
                          className="px-4 py-2 text-xs transition-all duration-200"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            borderRadius: '2px',
                            border: on ? '1px solid #FF4500' : '1px solid rgba(255,255,255,0.1)',
                            background: on ? 'rgba(255,69,0,0.12)' : 'rgba(255,255,255,0.02)',
                            color: on ? '#FF4500' : 'rgba(255,255,255,0.4)',
                            boxShadow: on ? '0 0 10px rgba(255,69,0,0.25)' : 'none',
                          }}>
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-3 text-white/30"
                  style={{ fontFamily: "'Space Mono', monospace" }}>Cores</span>
            <div className="space-y-2 mb-3">
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2"
                     style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ background: c.hex }} />
                  <span className="text-sm text-white/60 flex-1" style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>{c.name}</span>
                  <button onClick={() => removeColor(i)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Nome da cor"
                     className="flex-1 px-3 py-2 text-sm text-white outline-none"
                     style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }} />
              <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)}
                     className="w-10 h-10 cursor-pointer rounded border border-white/10 bg-transparent" />
              <button onClick={addColor} className="px-3 py-2 text-xs font-bold text-black"
                      style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', borderRadius: '2px' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-3 text-white/30"
                  style={{ fontFamily: "'Space Mono', monospace" }}>Características</span>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
                      style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)', color: '#FF4500', borderRadius: '2px', fontFamily: "'Space Mono', monospace" }}>
                  {f}
                  <button onClick={() => removeFeature(i)} className="hover:text-white transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                     placeholder="Ex: Refletivo 360°"
                     className="flex-1 px-3 py-2 text-sm text-white outline-none"
                     style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }} />
              <button onClick={addFeature} className="px-3 py-2 text-xs font-bold text-black"
                      style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', borderRadius: '2px' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-white/[0.06]"
             style={{ background: '#0d0d0d' }}>
          <button onClick={onClose}
                  className="px-5 py-2.5 text-sm text-white/40 border border-white/10 hover:text-white hover:border-white/20 transition-all"
                  style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif", borderRadius: '2px' }}>
            Cancelar
          </button>
          <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                         className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold uppercase tracking-widest text-black"
                         style={{ background: 'linear-gradient(135deg,#FF0000,#FF4500,#FFA500)', borderRadius: '2px', fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 700, letterSpacing: '0.15em' }}>
            <Save size={14} />
            Salvar Produto
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
