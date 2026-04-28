'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      if (data) setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-fire-orange/20 border-t-fire-orange rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bebas mb-4">PEDIDO NÃO ENCONTRADO</h1>
      <Link href="/orders" className="text-fire-orange hover:underline font-mono text-sm uppercase tracking-widest">Voltar para busca</Link>
    </div>
  );

  const steps = [
    { label: 'Recebido', status: 'Pendente', icon: <Clock size={20} />, active: true },
    { label: 'Pagamento', status: 'Pago', icon: <CreditCard size={20} />, active: ['Pago', 'Enviado', 'Entregue'].includes(order.status) },
    { label: 'Enviado', status: 'Enviado', icon: <Truck size={20} />, active: ['Enviado', 'Entregue'].includes(order.status) },
    { label: 'Entregue', status: 'Entregue', icon: <CheckCircle size={20} />, active: order.status === 'Entregue' },
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-fire-orange/30">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,69,0,0.05) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-4 group font-mono text-[10px] tracking-widest">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              HISTÓRICO DE PEDIDOS
            </Link>
            <h1 className="text-5xl font-bebas tracking-wider" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
              DETALHES DO <span className="text-fire-orange">PEDIDO</span>
            </h1>
            <p className="text-white/20 font-mono text-[10px] mt-2 tracking-widest uppercase">ID: {order.id}</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-sm flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-fire-orange animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-white/60">Status: <b className="text-white">{order.status}</b></span>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white/2 border border-white/5 p-8 rounded-sm mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fire-red to-transparent opacity-20" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${step.active ? 'bg-fire-orange text-black shadow-[0_0_20px_rgba(255,69,0,0.4)]' : 'bg-white/5 text-white/20'}`}>
                  {step.icon}
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${step.active ? 'text-white' : 'text-white/20'}`}>{step.label}</p>
                  {step.active && <p className="text-[9px] text-fire-orange font-mono">Concluído</p>}
                </div>
                {idx < steps.length - 1 && <div className="hidden lg:block w-12 h-px bg-white/10 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items & Address */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/2 border border-white/5 rounded-sm p-6">
              <h3 className="text-lg font-bebas tracking-widest mb-6 flex items-center gap-2">
                <Package size={18} className="text-fire-orange" /> ITENS DO PEDIDO
              </h3>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center p-3 hover:bg-white/5 transition-all rounded-sm border border-transparent hover:border-white/5">
                    <div className="relative w-16 h-20 bg-white/5 rounded-sm overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bebas text-lg tracking-wider">{item.name}</h4>
                      <p className="text-[10px] text-white/40 font-mono uppercase">Tam: {item.size} | Cor: {item.color || 'Padrão'}</p>
                      <p className="text-xs font-bold text-fire-orange mt-1">{item.quantity}x {formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-sm p-6">
              <h3 className="text-lg font-bebas tracking-widest mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-fire-orange" /> ENDEREÇO DE ENTREGA
              </h3>
              <div className="text-sm text-white/60 space-y-1 font-light leading-relaxed">
                <p className="text-white font-bold mb-2">{order.customer_name}</p>
                <p>{order.address}, {order.number} {order.complement && `- ${order.complement}`}</p>
                <p>{order.neighborhood} - {order.city} / {order.state}</p>
                <p className="font-mono text-xs mt-2 text-white/30">{order.cep}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white/2 border border-fire-orange/20 rounded-sm p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Package size={80} />
              </div>
              <h3 className="text-xl font-bebas tracking-widest mb-8">RESUMO TOTAL</h3>
              <div className="space-y-4 font-mono text-xs mb-8">
                <div className="flex justify-between text-white/40">
                  <span>SUBTOTAL</span>
                  <span>{formatCurrency(order.total_price)}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>FRETE</span>
                  <span className="text-green-400">GRÁTIS</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-end">
                  <span className="text-white/40">TOTAL PAGO</span>
                  <span className="text-3xl font-bebas text-fire-orange">{formatCurrency(order.total_price)}</span>
                </div>
              </div>
              <div className="text-[9px] text-white/20 font-mono leading-tight text-center italic">
                Pagamento processado via Stripe Secure Checkout.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
