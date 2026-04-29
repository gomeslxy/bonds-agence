'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Package, CreditCard, Zap, FileText, MapPin, User, Tag, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { type Order, type OrderStatus } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  'Pendente': 'Pendente',
  'Pago': 'Pago',
  'Enviado': 'Enviado',
  'Entregue': 'Entregue',
  'Cancelado': 'Cancelado',
};

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'Pendente':  { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.1)' },
  'Pago':      { bg: 'rgba(255,255,255,1)',    color: 'rgba(0,0,0,1)',       border: 'rgba(255,255,255,1)' },
  'Enviado':   { bg: 'rgba(255,255,255,0.1)',  color: 'rgba(255,255,255,0.9)', border: 'rgba(255,255,255,0.2)' },
  'Entregue':  { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.05)' },
  'Cancelado': { bg: 'rgba(255,0,0,0.1)',       color: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 0.2)' },
};

const PAY_ICONS: Record<Order['payMethod'], React.ReactNode> = {
  card:   <CreditCard size={12} />,
  pix:    <Zap size={12} />,
  boleto: <FileText size={12} />,
};

const ALL_STATUSES = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'];

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { changeStatus } = useAdmin();
  const s = STATUS_STYLES[order.status] || STATUS_STYLES['Pendente'];
  const date = new Date(order.createdAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <motion.tr
        layout
        className="border-b border-black/5 dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.015] transition-all cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-5">
          <span className="text-[10px] text-black/40 dark:text-white/20 font-mono tracking-tighter group-hover:text-black dark:group-hover:text-white transition-colors">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-5">
          <div className="flex flex-col">
            <p className="text-sm font-bold tracking-tight text-black dark:text-white uppercase italic">
              {order.customer.name}
            </p>
            <p className="text-[9px] text-black/40 dark:text-white/40 font-mono tracking-widest uppercase truncate max-w-[150px]">
              {order.customer.email}
            </p>
          </div>
        </td>
        <td className="px-6 py-5 hidden sm:table-cell">
          <span className="text-[10px] text-black/30 dark:text-white/30 font-mono uppercase tracking-widest">{date}</span>
        </td>
        <td className="px-6 py-5">
          <span className="text-lg font-bold tracking-tighter text-black dark:text-white">
            {formatCurrency(order.total)}
          </span>
        </td>
        <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
          <select
            value={order.status}
            onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
            className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 outline-none cursor-pointer rounded-sm appearance-none border transition-all hover:scale-105"
            style={{
              background: s.bg,
              borderColor: s.border,
              color: s.color,
            }}
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-white dark:bg-black text-black dark:text-white">{STATUS_LABELS[st]}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="text-black/20 dark:text-white/20">{PAY_ICONS[order.payMethod]}</div>
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-black/40 dark:text-white/40">
              {order.payMethod}
            </span>
          </div>
        </td>
        <td className="px-6 py-5">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown size={14} className="text-black/20 dark:text-white/20" />
          </motion.div>
        </td>
      </motion.tr>

      {/* Expandable row */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <td colSpan={7} className="px-8 pb-12 pt-4 bg-black/[0.01] dark:bg-white/[0.01]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 border border-black/5 dark:border-white/5 bg-white dark:bg-black/40 rounded-sm">
                
                {/* Customer Intel */}
                <div className="lg:col-span-5 space-y-8">
                  <div>
                    <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase mb-6">
                      <User size={12} /> Informações do Cliente
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-white/20 uppercase">Primary Contact</span>
                        <span className="text-xs font-bold text-white">{order.customer.name}</span>
                        <span className="text-[10px] font-mono text-white/40">{order.customer.email}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-white/20 uppercase">Document ID (CPF)</span>
                        <span className="text-xs font-mono text-white">{order.customer.cpf}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase mb-6 pt-4 border-t border-white/5">
                      <MapPin size={12} /> Shipping Logic
                    </div>
                    <div className="space-y-2 text-[10px] font-mono text-white/60 leading-relaxed uppercase tracking-wider">
                      <p>{order.customer.address}, {order.customer.number}</p>
                      {order.customer.complement && <p className="text-white/20">{order.customer.complement}</p>}
                      <p>{order.customer.neighborhood}</p>
                      <p>{order.customer.city} / {order.customer.state}</p>
                      <p className="text-white pt-2">CEP: {order.customer.cep}</p>
                    </div>
                  </div>
                </div>

                {/* Manifest */}
                <div className="lg:col-span-7 space-y-8">
                   <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase mb-6">
                    <Package size={12} /> Resumo do Pedido
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-6 group">
                        <div className="relative w-12 h-16 bg-white/5 border border-white/5 overflow-hidden transition-transform group-hover:scale-105">
                          <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold uppercase tracking-tight text-white italic">
                            {item.name}
                          </p>
                          <p className="text-[9px] text-white/40 font-mono tracking-widest uppercase">
                            TAM {item.size} · {item.color} · QTD {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-bold font-mono tracking-tighter text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/10 space-y-3">
                    <div className="flex justify-between text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">
                      <span>Subtotal</span>
                      <span className="text-white/60">{formatCurrency(order.items.reduce((acc, i) => acc + i.price * i.quantity, 0))}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">
                      <span>Frete</span>
                      <span className="text-white/60">{order.total >= 299 ? 'GRÁTIS' : formatCurrency(order.total - order.items.reduce((acc, i) => acc + i.price * i.quantity, 0) + (order.discountAmount || 0))}</span>
                    </div>
                    {order.couponCode && (
                      <div className="flex justify-between text-[9px] font-mono tracking-[0.2em] text-white/60 uppercase">
                        <span className="flex items-center gap-2 italic">Cupom Aplicado ({order.couponCode})</span>
                        <span className="text-white">-{formatCurrency(order.discountAmount || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-6 border-t border-white/10 items-baseline">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Valor Total</span>
                      <span className="text-3xl font-bold tracking-tighter text-white">{formatCurrency(order.total)}</span>
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
    <div className="space-y-12">
      {/* Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Pedidos', value: orders.length.toString(), icon: <Activity size={16} /> },
          { label: 'Pagos',    value: approved.toString(),      icon: <CheckCircle size={16} /> },
          { label: 'Pendentes',   value: pending.toString(),       icon: <Clock size={16} /> },
          { label: 'Receita Bruta', value: formatCurrency(total),    icon: <Tag size={16} /> },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white/5 border border-white/5 backdrop-blur-sm rounded-sm group hover:bg-white/10 transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-mono tracking-[0.4em] text-white/20 uppercase group-hover:text-white/40 transition-colors">
                {s.label}
              </p>
              <div className="text-white/10 group-hover:text-white transition-colors duration-500">{s.icon}</div>
            </div>
            <p className="text-4xl font-bold tracking-tighter text-white group-hover:scale-105 transition-transform duration-500 origin-left">
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Database View */}
      {orders.length === 0 ? (
        <div className="py-40 text-center border border-dashed border-white/10 rounded-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-6">
            <Package size={24} className="text-white/20" />
          </div>
          <p className="text-[10px] font-mono tracking-[0.5em] text-white/20 uppercase">
            Aguardando primeiro pedido
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-white/5 bg-white/5 backdrop-blur-md rounded-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  {['ID', 'Cliente', 'Data', 'Total', 'Status', 'Pagamento', 'Ações'].map((h) => (
                    <th key={h} className="px-6 py-5 text-[10px] tracking-[0.4em] uppercase text-white/20 font-mono font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {orders.map((order) => <OrderRow key={order.id} order={order} />)}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
