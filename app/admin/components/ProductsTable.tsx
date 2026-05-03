'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { type Product } from '@/data/products';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function ProductRow({ product, onEdit, onDelete }: {
  product: Product; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <motion.tr layout className="border-b border-black/5 dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.015] transition-colors group">
      <td className="px-4 py-3">
        <div className="relative w-10 h-12 overflow-hidden flex-shrink-0" style={{ borderRadius: '2px' }}>
          <Image src={product.image} alt={product.name} fill className="object-cover object-top" />
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-black dark:text-white font-display tracking-[0.05em] text-[1rem]">
          {product.name}
        </p>
        <p className="text-[10px] text-black/50 dark:text-white/30 font-mono">{product.category}</p>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-lg font-display text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF]">
          {fmt(product.price)}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-black/60 dark:text-white/50 font-mono">
          {product.stock} un
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex gap-1 flex-wrap">
          {product.sizes.map((s) => (
            <span key={s} className="text-[9px] border border-black/10 dark:border-white/10 px-1.5 py-0.5 text-black/50 dark:text-white/30 font-mono rounded-[1px]">
              {s}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onEdit}
                         className="p-1.5 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/25 transition-all rounded-sm">
            <Pencil size={12} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onDelete}
                         className="p-1.5 border border-red-900/30 text-red-500/40 hover:text-red-400 hover:border-red-500/40 transition-all"
                         style={{ borderRadius: '2px' }}>
            <Trash2 size={12} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function ProductsTable() {
  const { products, removeProduct, setEditing } = useAdmin();
  
  const openEdit = (p: Product) => {
    setEditing(p);
    // Note: showForm is managed in AdminPage, so we rely on the store trigger
    // or just assume AdminPage handles the modal open when editingProduct changes.
  };

  return (
    <div className="overflow-x-auto border border-black/10 dark:border-white/5 rounded-md">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-black/5 dark:border-white/[0.06] bg-black/5 dark:bg-white/[0.02]">
            {['Foto', 'Produto', 'Preço', 'Estoque', 'Tamanhos', 'Ações'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase text-black/40 dark:text-white/30 font-mono">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {products.map((p) => (
              <ProductRow key={p.id} product={p}
                          onEdit={() => openEdit(p)}
                          onDelete={() => removeProduct(p.id)} />
            ))}
          </AnimatePresence>
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="py-20 text-center text-black/30 dark:text-white/20 font-mono text-xs uppercase tracking-widest">
                Nenhum produto cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
