'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { supabase } from '@/lib/supabase';
import { type Product } from '@/data/products';

const CATEGORIES = ['Corta-Ventos', 'Conjuntos', 'Kits Refletivos', 'Regatas', 'Acessórios'];
const SIZES_CLOTHING = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
const SIZES_SHOES    = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

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
  };
}

/* ── Neon input ─────────────────────────────────────────── */
function FInput({ label, value, onChange, placeholder = '', type = 'text', textarea = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; textarea?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const base = {
    background: focused ? 'rgba(0,191,255,0.04)' : 'rgba(128,128,128,0.05)',
    border: `1px solid ${focused ? '#00BFFF' : 'rgba(128,128,128,0.2)'}`,
    boxShadow: focused ? '0 0 12px rgba(0,191,255,0.15)' : 'none',
    borderRadius: '2px',
    outline: 'none',
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  };
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 font-mono"
            style={{ color: focused ? '#00BFFF' : 'rgba(128,128,128,0.5)' }}>
        {label}
      </span>
      {textarea
        ? <textarea rows={3} value={value} placeholder={placeholder}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    onChange={(e) => onChange(e.target.value)} style={{ ...base, resize: 'vertical' }} className="font-body text-black dark:text-white" />
        : <input type={type} value={value} placeholder={placeholder}
                 onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                 onChange={(e) => onChange(e.target.value)} style={base} className="font-body text-black dark:text-white" />
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
  const [newColorHex, setNewColorHex] = useState('#00BFFF');

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
    setNewColorName(''); setNewColorHex('#00BFFF');
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

    if (!file.type.startsWith('image/')) {
      alert('Proteção de Segurança: Apenas arquivos de imagem são permitidos.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Limite de Tamanho: A imagem deve ter no máximo 5MB.');
      return;
    }

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

      // Append timestamp to bypass immediate 404 caching delay on some browsers
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      set('image', urlWithCacheBust);
      setPreviewError(false);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      let msg = 'Erro inesperado.';
      if (error.status === 404 || error.message?.toLowerCase().includes('bucket')) {
        msg = 'BUCKET INVÁLIDO: O bucket "products" não foi encontrado. Por favor, acesse o painel do Supabase > Storage e crie um bucket PÚBLICO chamado exatamente "products".';
      } else if (error.status === 403 || error.message?.toLowerCase().includes('policy')) {
        msg = 'ERRO DE PERMISSÃO (RLS): O Supabase bloqueou o upload. Por favor, execute o script SQL que forneci (supabase_fix.sql) no seu painel do Supabase.';
      } else {
        msg = error.message;
      }
      alert('Falha no Upload: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.images || form.images.length < 2) {
      alert('Configuração Obrigatória: O produto deve ter Nome, Preço e no MÍNIMO 2 FOTOS REAIS para manter o padrão Bonds Agence.'); 
      return;
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
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0d0d0d]"
        style={{
          border: '1px solid rgba(0,191,255,0.2)',
          borderRadius: '4px',
          boxShadow: '0 0 60px rgba(0,127,255,0.15)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0d0d0d]">
          <h2 className="text-2xl font-display tracking-[0.08em]">
            <span className="text-black/30 dark:text-white/30">{isNew ? 'NOVO' : 'EDITAR'} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF]">PRODUTO</span>
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
                  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=90',
                  description: 'Corta-vento de alta performance com detalhes em dourado refletivo. Resistente a água e vento.',
                  sizes: ['P', 'M', 'G', 'GG'],
                  colors: [{ name: 'Preto/Ouro', hex: '#d4af37' }],
                  features: ['Refletivo Premium', 'Impermeável'],
                  stock: 25
                });
                setPreviewError(false);
              }}
              className="px-3 py-1 text-[10px] border border-black/10 dark:border-white/10 text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all uppercase font-mono rounded-sm"
            >
              Carregar Modelo
            </button>
            <button onClick={onClose} className="p-1.5 text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Fire border */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg,#007FFF,#00BFFF,#00FFFF,transparent)' }} />

        <div className="p-6 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-black/50 dark:text-white/30 font-mono">Galeria de Fotos (Mínimo 2 Reais)</span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...(form.images || [])].map((img, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-sm overflow-hidden border border-black/10 dark:border-white/10 group">
                  <img src={img} alt={`Galeria ${i}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {
                      const newImages = (form.images || []).filter((_, idx) => idx !== i);
                      set('images', newImages);
                      if (newImages.length > 0) set('image', newImages[0]);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={10} />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-ice-blue/80 text-black text-[8px] font-bold py-0.5 text-center font-mono">CAPA</div>
                  )}
                </div>
              ))}
              
              {/* Add image button */}
              <label className="aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-sm hover:border-ice-blue/40 transition-colors cursor-pointer bg-black/5 dark:bg-white/[0.02]">
                <Plus size={20} className="text-black/20 dark:text-white/20" />
                <span className="text-[9px] font-mono text-black/40 dark:text-white/30 mt-2">ADICIONAR</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    try {
                      setUploading(true);
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                      const filePath = `product-images/${fileName}`;

                      const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(filePath, file);

                      if (uploadError) throw uploadError;

                      const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(filePath);

                      const newImages = [...(form.images || []), publicUrl];
                      set('images', newImages);
                      if (newImages.length === 1) set('image', publicUrl);
                    } catch (err: any) {
                      alert('Erro no upload: ' + err.message);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FInput label="Nome do Produto" value={form.name} onChange={(v) => set('name', v)} placeholder="CORTA-VENTO IGNITE" />
            <FInput label="Subtítulo" value={form.subtitle} onChange={(v) => set('subtitle', v)} placeholder="Fire Edition" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <FInput label="Preço (R$)" type="number" value={form.price === 0 ? '' : form.price} onChange={(v) => set('price', v === '' ? 0 : parseFloat(v))} placeholder="349.90" />
            <FInput label="Preço Original (R$)" type="number" value={form.originalPrice ?? ''} onChange={(v) => set('originalPrice', v === '' ? undefined : parseFloat(v))} placeholder="Opcional" />
            <FInput label="Estoque (un)" type="number" value={form.stock === 0 ? '' : form.stock} onChange={(v) => set('stock', v === '' ? 0 : parseInt(v))} placeholder="50" />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 gap-4">
            <FInput label="Categoria" value={form.category} onChange={(v) => set('category', v)} placeholder="Ex: Corta-Ventos" />
          </div>

          {/* Description */}
          <FInput label="Descrição" value={form.description} onChange={(v) => set('description', v)}
                  placeholder="Descreva o produto..." textarea />

          {/* Sizes and Stock per Size */}
          <div>
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-3 text-black/50 dark:text-white/30 font-mono">Tamanhos e Estoque</span>
            
            <div className="space-y-6">
              <div>
                <p className="text-[9px] text-black/20 dark:text-white/10 mb-2 uppercase tracking-[0.1em] font-mono">Selecione os tamanhos e defina a quantidade</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...SIZES_CLOTHING, ...SIZES_SHOES].map((sz) => {
                    const isSelected = form.sizes.includes(sz);
                    const currentQty = form.sizeStock?.find(s => s.size === sz)?.quantity ?? 0;

                    return (
                      <div key={sz} className={`p-2 rounded-sm border transition-all duration-200 ${
                        isSelected ? 'border-ice-blue bg-ice-blue/5' : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <button 
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-sm transition-colors ${
                              isSelected ? 'bg-ice-blue text-black font-bold' : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/30'
                            }`}
                          >
                            {sz}
                          </button>
                          {isSelected && (
                            <span className="text-[9px] font-mono text-ice-blue/60 uppercase">Qtd</span>
                          )}
                        </div>
                        
                        {isSelected && (
                          <input 
                            type="number"
                            min="0"
                            value={currentQty}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              const currentStock = form.sizeStock || [];
                              const index = currentStock.findIndex(s => s.size === sz);
                              
                              let newStock = [...currentStock];
                              if (index >= 0) {
                                newStock[index] = { ...newStock[index], quantity: qty };
                              } else {
                                newStock.push({ size: sz, quantity: qty });
                              }
                              
                              set('sizeStock', newStock);
                              // Sync total stock
                              const total = newStock.reduce((acc, curr) => acc + curr.quantity, 0);
                              set('stock', total);
                            }}
                            className="w-full bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 text-black dark:text-white text-xs px-2 py-1 outline-none font-mono focus:border-ice-blue/50"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-3 text-black/50 dark:text-white/30 font-mono">Cores</span>
            <div className="space-y-2 mb-3">
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.06] rounded-sm">
                  <div className="w-5 h-5 rounded-full border border-black/20 dark:border-white/20 flex-shrink-0" style={{ background: c.hex }} />
                  <span className="text-sm text-black/60 dark:text-white/60 flex-1 font-body">{c.name}</span>
                  <button onClick={() => removeColor(i)} className="text-black/30 dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Nome da cor"
                     className="flex-1 px-3 py-2 text-sm text-black dark:text-white outline-none font-body bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.08] rounded-sm" />
              <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)}
                     className="w-10 h-10 cursor-pointer rounded border border-black/10 dark:border-white/10 bg-transparent" />
              <button onClick={addColor} className="px-3 py-2 text-xs font-bold text-black"
                      style={{ background: 'linear-gradient(135deg,#007FFF,#00FFFF)', borderRadius: '2px' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-3 text-black/50 dark:text-white/30 font-mono">Características</span>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-ice-blue/10 border border-ice-blue/30 text-ice-blue rounded-sm font-mono">
                  {f}
                  <button onClick={() => removeFeature(i)} className="hover:text-black dark:hover:text-white transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                     placeholder="Ex: Refletivo 360°"
                     className="flex-1 px-3 py-2 text-sm text-black dark:text-white outline-none font-body bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.08] rounded-sm" />
              <button onClick={addFeature} className="px-3 py-2 text-xs font-bold text-black"
                      style={{ background: 'linear-gradient(135deg,#007FFF,#00FFFF)', borderRadius: '2px' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0d0d0d]">
          <button onClick={onClose}
                  className="px-5 py-2.5 text-sm text-black/50 dark:text-white/40 border border-black/10 dark:border-white/10 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all font-body rounded-sm">
            Cancelar
          </button>
          <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                         className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold uppercase tracking-widest text-black font-body rounded-sm"
                         style={{ background: 'linear-gradient(135deg,#007FFF,#00BFFF,#00FFFF)' }}>
            <Save size={14} />
            Salvar Produto
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
