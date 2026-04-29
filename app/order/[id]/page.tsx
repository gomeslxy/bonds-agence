'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const formatCPF = (v: string) => {
  v = v.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirectTimer, setRedirectTimer] = useState(5);
  const supabaseClient = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const init = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        router.push(`/login?redirectTo=/order/${id}`);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          setOrder(null);
        } else {
          setOrder(data);
        }
      } catch (err) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  useEffect(() => {
    if (!loading && !order && redirectTimer > 0) {
      const t = setTimeout(() => setRedirectTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
    if (!loading && !order && redirectTimer === 0) {
      router.push('/');
    }
  }, [loading, order, redirectTimer]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-sm text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20">
          <Package size={40} className="opacity-50" />
        </div>
        <h1 className="text-4xl font-display tracking-widest mb-4 italic font-black uppercase">PEDIDO NÃO ENCONTRADO</h1>
        <p className="text-xs text-white/40 mb-8 font-mono leading-relaxed uppercase tracking-widest">
          Você não tem permissão para acessar este pedido ou ele não existe.
        </p>
        <div className="p-4 bg-white/5 border border-white/5 rounded-sm mb-8">
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-1">Redirecionando em</p>
          <p className="text-3xl font-bold">{redirectTimer}s</p>
        </div>
        <Link href="/" className="inline-block px-8 py-3 bg-white text-black rounded-sm text-[10px] font-mono uppercase font-bold tracking-widest transition-all hover:bg-white/90">
          Voltar Agora
        </Link>
      </div>
    </main>
  );

  // 4. Verification in progress (if full data not loaded)
  if (!order || !order.customer_name) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  // Main Content
  const steps = [
    { label: 'Aguardando PIX', status: 'Pendente', icon: <Clock size={20} />, active: true },
    { label: 'Validação Manual', status: 'Processando', icon: <CreditCard size={20} />, active: ['Pago', 'Enviado', 'Entregue'].includes(order.status) },
    { label: 'Enviado', status: 'Enviado', icon: <Truck size={20} />, active: ['Enviado', 'Entregue'].includes(order.status) },
    { label: 'Entregue', status: 'Entregue', icon: <CheckCircle size={20} />, active: order.status === 'Entregue' },
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/10">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-4 group font-mono text-[10px] tracking-widest uppercase">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              HISTÓRICO DE PEDIDOS
            </Link>
            <h1 className="text-6xl font-display tracking-tight italic font-black uppercase">
              DETALHES DO <span className="text-white/40">PEDIDO</span>
            </h1>
            <p className="text-white/20 font-mono text-[10px] mt-2 tracking-[0.3em] uppercase">ID: {order.id}</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-sm flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${order.status === 'Entregue' ? 'bg-emerald-500' : 'bg-white animate-pulse'}`} />
            <span className="font-mono text-xs uppercase tracking-widest text-white/60">Status: <b className="text-white uppercase">{order.status}</b></span>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-sm mb-12 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-5 group flex-1">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border ${step.active ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/20 border-white/5'}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${step.active ? 'text-white' : 'text-white/20'}`}>{step.label}</p>
                  {step.active && <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Concluído</p>}
                </div>
                {idx < steps.length - 1 && <div className="hidden xl:block flex-1 h-px bg-white/10" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items & Address */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-sm p-8">
              <h3 className="text-xl font-display tracking-widest mb-8 flex items-center gap-3 uppercase italic font-bold">
                <Package size={20} className="text-white/40" /> ITENS DO PEDIDO
              </h3>
              <div className="space-y-6">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-6 items-center p-4 bg-white/5 border border-transparent hover:border-white/10 transition-all rounded-sm">
                    <div className="relative w-20 h-24 bg-white/5 rounded-sm overflow-hidden flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover object-top" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between h-24 py-1">
                      <div>
                        <h4 className="font-display text-lg tracking-wider uppercase italic font-bold leading-tight">{item.name}</h4>
                        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mt-1">Tam: {item.size} | Cor: {item.color || 'Padrão'}</p>
                      </div>
                      <p className="text-sm font-bold text-white mt-auto">{item.quantity}x {formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-sm p-8">
              <h3 className="text-xl font-display tracking-widest mb-8 flex items-center gap-3 uppercase italic font-bold">
                <MapPin size={20} className="text-white/40" /> ENDEREÇO DE ENTREGA
              </h3>
              <div className="text-sm text-white/60 space-y-2 font-light leading-relaxed">
                <p className="text-white font-bold text-lg mb-4 uppercase italic tracking-tight">{order.customer_name}</p>
                <p className="uppercase tracking-widest text-xs">{order.address}, {order.number} {order.complement && `- ${order.complement}`}</p>
                <p className="uppercase tracking-widest text-xs">{order.neighborhood} - {order.city} / {order.state}</p>
                <div className="pt-4">
                  <span className="font-mono text-[10px] px-3 py-1 bg-white/5 border border-white/5 text-white/30 uppercase tracking-[0.3em]">{order.cep}</span>
                </div>
              </div>
            </div>

            {order.status === 'Pendente' && (
              <div className="bg-white/5 border border-white/10 rounded-sm p-10 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
                <div className="flex items-center gap-4 text-white relative z-10">
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center animate-pulse">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-2xl font-display tracking-widest uppercase italic font-bold">AGUARDANDO PAGAMENTO PIX</h3>
                </div>
                <p className="text-sm text-white/40 font-body leading-relaxed max-w-xl relative z-10">
                  Seu pedido foi registrado. Para agilizar o envio, realize o PIX para o beneficiário <span className="text-white font-bold">LUCAS GOMES DO AMARAL</span>.
                </p>
                <div className="flex flex-col items-center gap-6 py-6 relative z-10">
                  <div className="bg-white p-6 rounded-sm shadow-2xl">
                    <img 
                      src="/pix_qrcode.jpeg" 
                      alt="PIX QR Code" 
                      className="w-48 h-48 object-contain block mx-auto"
                    />
                  </div>
                  <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.4em]">Escaneie ou copie o código abaixo</p>
                </div>

                <div className="p-6 bg-black border border-white/10 rounded-sm relative z-10">
                  <p className="text-[10px] text-white/40 font-mono uppercase mb-3 tracking-widest">Chave PIX (Copia e Cola)</p>
                  <p className="text-[10px] font-mono text-white break-all opacity-80 select-all leading-relaxed">00020101021126360014br.gov.bcb.pix0114+55119899400805204000053039865802BR5921LUCAS GOMES DO AMARAL6010INDAIATUBA62070503***63043504</p>
                </div>
                <p className="text-[10px] text-white/20 font-mono italic text-center relative z-10 tracking-widest uppercase">
                  * A validação manual do PIX pode levar até 24h úteis.
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white text-black rounded-sm p-10 relative overflow-hidden">
              <h3 className="text-2xl font-display tracking-tight italic font-black uppercase mb-10">RESUMO</h3>
              <div className="space-y-5 font-mono text-[11px] mb-10">
                <div className="flex justify-between text-black/40 font-bold uppercase tracking-widest">
                  <span>SUBTOTAL</span>
                  <span>{formatCurrency(order.total_price)}</span>
                </div>
                <div className="flex justify-between text-black/40 font-bold uppercase tracking-widest">
                  <span>FRETE</span>
                  <span className="text-black">GRÁTIS</span>
                </div>
                <div className="h-px bg-black/5 my-6" />
                <div className="flex justify-between items-end">
                  <span className="text-black/40 font-bold uppercase tracking-widest">TOTAL PAGO</span>
                  <span className="text-4xl font-display font-black italic tracking-tighter">{formatCurrency(order.total_price)}</span>
                </div>
              </div>
              <div className="text-[10px] text-black/20 font-mono leading-tight text-center italic uppercase tracking-widest font-bold">
                Pagamento via PIX · Validação Manual
              </div>
            </div>

            <Link href="/" className="flex items-center justify-center w-full py-5 bg-white/5 border border-white/10 rounded-sm text-[10px] font-mono font-bold tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
              Voltar para Loja
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
