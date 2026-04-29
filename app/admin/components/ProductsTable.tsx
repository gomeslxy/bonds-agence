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
    <motion.tr 
      layout 
      className="border-b border-black/5 dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.015] transition-colors group"
    >
      <td className="px-6 py-4">
        <div className="relative w-12 h-14 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105">
          <Image src={product.image} alt={product.name} fill className="object-cover object-top" />
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-bold tracking-tight text-black dark:text-white uppercase italic">
          {product.name}
        </p>
        <p className="text-[10px] text-black/40 dark:text-white/40 font-mono tracking-widest uppercase mt-0.5">{product.category}</p>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <span className="text-sm font-bold font-mono tracking-tight text-black dark:text-white">
          {fmt(product.price)}
        </span>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <span className="text-[10px] text-black/50 dark:text-white/40 font-mono uppercase tracking-widest">
          {product.stock} Unidades
        </span>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="flex gap-1.5 flex-wrap">
          {product.sizes.map((s) => (
            <span key={s} className="text-[9px] border border-black/10 dark:border-white/10 px-2 py-0.5 text-black/50 dark:text-white/40 font-mono uppercase rounded-sm">
              {s}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        {product.tag && (
          <span className="text-[9px] px-3 py-1 font-bold font-mono tracking-widest uppercase rounded-sm bg-black text-white dark:bg-white dark:text-black">
            {product.tag}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,1)', color: 'white' }} 
            whileTap={{ scale: 0.9 }} 
            onClick={onEdit}
            className="p-2 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 transition-all rounded-sm hover:dark:bg-white hover:dark:text-black"
          >
            <Pencil size={14} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 1)', color: 'white' }} 
            whileTap={{ scale: 0.9 }} 
            onClick={onDelete}
            className="p-2 border border-red-500/10 text-red-500/40 transition-all rounded-sm"
          >
            <Trash2 size={14} />
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
  };

  return (
    <div className="overflow-hidden border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 backdrop-blur-sm rounded-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/[0.02]">
              {['Visual', 'Nome / Cat', 'Preço', 'Estoque', 'Tamanhos', 'Tag', 'Ações'].map((h) => (
                <th key={h} className="px-6 py-5 text-[10px] tracking-[0.4em] uppercase text-black/30 dark:text-white/30 font-mono font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            <AnimatePresence mode="popLayout">
              {products.map((p) => (
                <ProductRow 
                  key={p.id} 
                  product={p}
                  onEdit={() => openEdit(p)}
                  onDelete={() => removeProduct(p.id)} 
                />
              ))}
            </AnimatePresence>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-32 text-center">
                  <p className="text-[10px] font-mono tracking-[0.5em] text-black/20 dark:text-white/20 uppercase">
                    Nenhum produto encontrado no estoque
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
