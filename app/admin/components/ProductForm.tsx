'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, Image as ImageIcon, Upload, Loader2, CheckCircle2, Activity, Tag } from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { createClient } from '@/lib/supabase/client';
import { type Product } from '@/data/products';

const supabase = createClient();

const CATEGORIES = ['Corta-Ventos', 'Conjuntos', 'Kits Refletivos', 'Regatas', 'Acessórios'];
const SIZES_ALL  = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
const TAGS       = [
  { label: '— Nenhum —', value: '' }, 
  { label: 'EM ALTA', value: 'HOT' }, 
  { label: 'LIMITADO', value: 'EXCLUSIVO' }, 
  { label: 'NOVIDADE', value: 'NOVO' }, 
  { label: 'PROMOÇÃO', value: 'SALE' }
];

function newProduct(): Product {
  return {
    id:          `temp-${Date.now()}`,
    name:        '',
    subtitle:    '',
    price:       0,
    category:    'Corta-Ventos',
    image:       '',
    sizes:       ['M', 'G'],
    colors:      [{ name: 'Black', hex: '#000000' }],
    description: '',
    features:    [],
    stock:       10,
    tag:         undefined,
    tagColor:    undefined,
  };
}

/* ── Premium Input ───────────────────────────────────────── */
function FInput({ label, value, onChange, placeholder = '', type = 'text', textarea = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; textarea?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  
  return (
    <label className="block group">
      <span className={`block text-[9px] tracking-[0.4em] uppercase mb-2 font-mono font-bold transition-colors ${focused ? 'text-black dark:text-white' : 'text-black/30 dark:text-white/30'}`}>
        {label}
      </span>
      {textarea
        ? <textarea 
            rows={4} 
            value={value} 
            placeholder={placeholder}
            onFocus={() => setFocused(true)} 
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)} 
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-4 text-sm font-bold tracking-tight outline-none focus:border-black dark:focus:border-white transition-all resize-none italic" 
          />
        : <input 
            type={type} 
            value={value} 
            placeholder={placeholder}
            onFocus={() => setFocused(true)} 
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)} 
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-4 text-sm font-bold tracking-tight outline-none focus:border-black dark:focus:border-white transition-all italic" 
          />
      }
    </label>
  );
}

/* ── Main Form Component ────────────────────────────────── */
export default function ProductForm({ onClose }: { onClose: () => void }) {
  const { editingProduct, saveProduct } = useAdmin();
  const [form, setForm] = useState<Product>(editingProduct ?? newProduct());
  const [previewError, setPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

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
    setNewColorName(''); setNewColorHex('#000000');
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      set('image', publicUrl);
      setPreviewError(false);
    } catch (error: any) {
      console.error('Erro de Upload:', error.message);
      alert('Upload falhou: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.image) {
      alert('Campos obrigatórios faltando: Nome, Preço, Imagem.'); return;
    }
    saveProduct(form);
    onClose();
  };

  const isNew = !editingProduct;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-10 py-8 border-b border-black/10 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-[0.2em] uppercase italic">
            {isNew ? 'Novo Produto' : 'Editar Produto'}
          </h2>
          <span className="text-[9px] font-mono tracking-[0.5em] text-black/30 dark:text-white/20 uppercase mt-1">Gestão de Inventário</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              setForm({
                ...newProduct(),
                name: 'SAMPLE PRODUCT X',
                subtitle: 'Limited Edition Protocol',
                price: 499.00,
                category: 'Corta-Ventos',
                image: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=800&q=90',
                description: 'High-performance urban wear designed for the elite. Refined textures and weather-resistant layering.',
                sizes: ['M', 'G'],
                colors: [{ name: 'Stealth Black', hex: '#000000' }],
                features: ['Reflective Weave', 'Ergonomic Cut'],
                stock: 25
              });
              setPreviewError(false);
            }}
            className="hidden md:block text-[9px] font-mono tracking-[0.3em] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
          >
            [ Carregar Exemplo ]
          </button>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/30 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all rounded-sm">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-10 space-y-12 pb-32">
        {/* visual Manifest */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="sticky top-10 space-y-6">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group">
                {form.image && !previewError
                  ? <img src={form.image} alt="preview" onError={() => setPreviewError(true)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  : <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <ImageIcon size={40} className="text-black/10 dark:text-white/10" />
                      <span className="text-[10px] text-black/30 dark:text-white/20 font-mono tracking-widest uppercase">Sem Imagem</span>
                    </div>
                }
              </div>
              <div className="relative">
                <input type="file" id="image-upload" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                <label htmlFor="image-upload" className="flex items-center justify-center gap-3 w-full py-4 border border-black dark:border-white text-black dark:text-white text-[10px] font-bold tracking-[0.3em] uppercase cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Processando...' : 'Fazer Upload'}
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-12">
            {/* Identity */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.4em] text-black/20 dark:text-white/20 uppercase mb-4">
                <CheckCircle2 size={12} /> Identificação
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <FInput label="Nome do Produto" value={form.name} onChange={(v) => set('name', v)} placeholder="Ex: Corta-Vento VORTEX" />
                <FInput label="Subtítulo / Modelo" value={form.subtitle} onChange={(v) => set('subtitle', v)} placeholder="Ex: Core Edition" />
              </div>
              <FInput label="URL da Imagem" value={form.image} onChange={(v) => { set('image', v); setPreviewError(false); }} placeholder="https://exemplo.com/imagem.jpg" />
            </div>

            {/* Valuation */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.4em] text-black/20 dark:text-white/20 uppercase mb-4 pt-8 border-t border-black/5 dark:border-white/5">
                <Activity size={12} /> Valores e Estoque
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <FInput label="Preço de Venda (R$)" type="number" value={form.price} onChange={(v) => set('price', parseFloat(v) || 0)} />
                <FInput label="Preço Original (R$)" type="number" value={form.originalPrice ?? ''} onChange={(v) => set('originalPrice', v ? parseFloat(v) : undefined)} placeholder="Opcional (Desconto)" />
                <FInput label="Unidades em Estoque" type="number" value={form.stock} onChange={(v) => set('stock', parseInt(v) || 0)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <span className="block text-[9px] tracking-[0.4em] uppercase text-black/30 dark:text-white/30 font-mono font-bold">Categoria</span>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-all appearance-none">
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-white dark:bg-black text-black dark:text-white">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <span className="block text-[9px] tracking-[0.4em] uppercase text-black/30 dark:text-white/30 font-mono font-bold">Tag / Destaque</span>
                  <select value={form.tag ?? ''} onChange={(e) => set('tag', e.target.value || undefined)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-all appearance-none">
                    {TAGS.map((t) => <option key={t.value} value={t.value} className="bg-white dark:bg-black text-black dark:text-white">{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Spec Manifest */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.4em] text-black/20 dark:text-white/20 uppercase mb-4 pt-8 border-t border-black/5 dark:border-white/5">
                <Tag size={12} /> Especificações
              </div>
              <FInput label="Descrição do Produto" value={form.description} onChange={(v) => set('description', v)} textarea placeholder="Digite as especificações detalhadas..." />
              
              <div className="space-y-6">
                <span className="block text-[9px] tracking-[0.4em] uppercase text-black/30 dark:text-white/30 font-mono font-bold text-center sm:text-left">Tamanhos Disponíveis</span>
                <div className="flex flex-wrap gap-3">
                  {SIZES_ALL.map((sz) => {
                    const on = form.sizes.includes(sz);
                    return (
                      <button key={sz} onClick={() => toggleSize(sz)} className={`px-6 py-3 text-[10px] font-bold font-mono tracking-widest uppercase transition-all duration-500 rounded-sm ${on ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-[0_10px_20px_rgba(0,0,0,0.2)]' : 'bg-black/5 dark:bg-white/5 text-black/30 dark:text-white/20 border-transparent hover:text-black dark:hover:text-white'}`}>
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <span className="block text-[9px] tracking-[0.4em] uppercase text-black/30 dark:text-white/30 font-mono font-bold">Cores</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {form.colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 group">
                      <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10" style={{ background: c.hex }} />
                      <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{c.name}</span>
                      <button onClick={() => removeColor(i)} className="text-black/20 dark:text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 p-6 border border-dashed border-black/10 dark:border-white/10">
                  <input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Nome da Cor" className="flex-1 bg-transparent text-xs font-bold uppercase tracking-widest outline-none border-b border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white py-2" />
                  <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-10 h-10 cursor-pointer bg-transparent border-none" />
                  <button onClick={addColor} className="w-10 h-10 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:scale-110 transition-transform"><Plus size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-6 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
        <button onClick={onClose} className="text-[10px] font-mono tracking-[0.4em] uppercase text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors uppercase font-bold">
          [ Cancelar ]
        </button>
        <button onClick={handleSave} className="btn-premium px-12 flex items-center gap-4">
          <Save size={18} /> Salvar Produto
        </button>
      </div>
    </div>
  );
}
