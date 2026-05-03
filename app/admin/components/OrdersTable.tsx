'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Package, CreditCard, Zap, FileText, MapPin, User, Tag } from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { type Order, type OrderStatus, STATUS_LABELS, STATUS_STYLES, ALL_STATUSES } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const PAY_ICONS: Record<string, React.ReactNode> = {
  card:   <CreditCard size={11} />,
  pix:    <Zap size={11} />,
  boleto: <FileText size={11} />,
};

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { changeStatus } = useAdmin();
  const s = STATUS_STYLES[order.status] || STATUS_STYLES['Pendente'];
  const date = new Date(order.createdAt).toLocaleDateString('pt-BR');

  return (
    <>
      <motion.tr
        layout
        className="border-b border-black/5 dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.015] transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <span className="text-[0.7rem] text-black/70 dark:text-white/70 font-mono">
            #{order.id.slice(0, 8)}
          </span>
        </td>
        <td className="px-4 py-3">
          <div>
            <p className="text-sm text-black dark:text-white font-body font-semibold">
              {order.customer.name}
            </p>
            <p className="text-[10px] text-black/40 dark:text-white/30 font-mono">
              {order.customer.email}
            </p>
          </div>
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <span className="text-xs text-black/50 dark:text-white/40 font-mono">{date}</span>
        </td>
        <td className="px-4 py-3">
          <span className="font-bold text-[1.1rem] font-display text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF]">
            {formatCurrency(order.total)}
          </span>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <select
            value={order.status}
            onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
            className="text-xs px-2 py-1.5 outline-none cursor-pointer font-mono"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              color: s.color,
              borderRadius: '2px',
            }}
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-white dark:bg-[#111] text-black dark:text-white">{STATUS_LABELS[st]}</option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span style={{ color: s.color }}>{PAY_ICONS[order.payMethod]}</span>
            <span className="text-[10px] uppercase text-black/40 dark:text-white/30 font-mono">
              {order.payMethod}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-black/30 dark:text-white/30" />
          </motion.div>
        </td>
      </motion.tr>

      {/* Expandable row */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <td colSpan={7} className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-black/5 dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.015] rounded-sm">
                
                {/* Detalhes do Cliente */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] text-black/50 dark:text-white/30 tracking-widest uppercase mb-2 font-mono">
                    <User size={12} /> Dados do Cliente
                  </div>
                  <div className="space-y-2 font-mono text-[11px]">
                    <p><span className="text-black/40 dark:text-white/20">NOME:</span> <span className="text-black/80 dark:text-white/80">{order.customer.name}</span></p>
                    <p><span className="text-black/40 dark:text-white/20">EMAIL:</span> <span className="text-black/80 dark:text-white/80">{order.customer.email}</span></p>
                    <p><span className="text-black/40 dark:text-white/20">CPF:</span> <span className="text-ice-blue">{order.customer.cpf}</span></p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-black/50 dark:text-white/30 tracking-widest uppercase mb-2 pt-2 font-mono">
                    <MapPin size={12} /> Endereço de Entrega
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-black/80 dark:text-white/80">
                    <p>{order.customer.address}, {order.customer.number}</p>
                    {order.customer.complement && <p>{order.customer.complement}</p>}
                    <p>{order.customer.neighborhood}</p>
                    <p>{order.customer.city} - {order.customer.state}</p>
                    <p className="text-ice-blue">CEP: {order.customer.cep}</p>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-[10px] text-black/50 dark:text-white/30 tracking-widest uppercase mb-2 font-mono">
                    <Package size={12} /> Itens do Pedido
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-10 h-12 flex-shrink-0 overflow-hidden" style={{ borderRadius: '2px' }}>
                          <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-black dark:text-white font-display tracking-[0.05em]">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-black/50 dark:text-white/30 font-mono">
                            TAM: {item.size} · {item.color} · Qtd: {item.quantity}
                          </p>
                        </div>
                        <span className="font-display text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF]">
                          {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-black/5 dark:border-white/[0.05] space-y-2">
                    <div className="flex justify-between text-[0.7rem] text-black/60 dark:text-white/40 font-mono">
                      <span>SUBTOTAL:</span>
                      <span>{formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-[0.7rem] text-black/60 dark:text-white/40 font-mono">
                      <span>FRETE:</span>
                      <span>{order.shipping === 0 ? 'GRÁTIS' : formatCurrency(order.shipping)}</span>
                    </div>
                    {order.couponCode && (
                      <div className="flex justify-between text-[0.7rem] text-green-500 font-mono">
                        <span className="flex items-center gap-1"><Tag size={10} /> CUPOM ({order.couponCode}):</span>
                        <span>-{formatCurrency(order.discountAmount || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-black/5 dark:border-white/[0.05] font-bold">
                      <span className="text-[0.7rem] text-black dark:text-white font-mono uppercase tracking-widest">TOTAL:</span>
                      <span className="text-[1.1rem] text-ice-blue font-display">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function OrdersTable() {
  const { orders } = useAdmin();

  const total   = orders.reduce((a, o) => a + o.total, 0);
  const approved = orders.filter((o) => o.status === 'Pago').length;
  const pending  = orders.filter((o) => o.status?.toLowerCase() === 'pendente').length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total de Pedidos', value: orders.length.toString(), color: '#fff' },
          { label: 'Aprovados',        value: approved.toString(),      color: '#4ade80' },
          { label: 'Pendentes',        value: pending.toString(),        color: '#00BFFF' },
          { label: 'Receita Total',    value: formatCurrency(total),               color: '#007FFF' },
        ].map((s) => (
          <div key={s.label} className="p-4 border border-black/5 dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] rounded-[3px]">
            <p className="text-[10px] text-black/50 dark:text-white/30 tracking-widest uppercase mb-2 font-mono">
              {s.label}
            </p>
            <p className="text-2xl font-display" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="text-center py-16 text-black/40 dark:text-white/20">
          <Package size={40} className="mx-auto mb-4 opacity-40 dark:opacity-20" />
          <p className="font-display text-[1.5rem] tracking-[0.1em]">
            Nenhum pedido ainda
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-black/10 dark:border-white/5 rounded-md">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                {['Pedido', 'Cliente', 'Data', 'Total', 'Status', 'Pagamento', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase text-black/50 dark:text-white/30 font-mono">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {orders.map((order) => <OrderRow key={order.id} order={order} />)}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
