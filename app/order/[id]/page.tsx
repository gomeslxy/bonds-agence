'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

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
  const [query, setQuery] = useState('');
  const [verifyType, setVerifyType] = useState<'email' | 'cpf'>('email');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const [redirectTimer, setRedirectTimer] = useState(5);

  // Consolidate Fetch Logic
  useEffect(() => {
    if (!id) return;

    const init = async () => {
      const orderId = String(id);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
      
      if (!isUUID || orderId === 'undefined') {
        setOrder(null);
        setLoading(false);
        return;
      }

      // 1. Check Session
      const saved = sessionStorage.getItem(`order_verified_${orderId}`);
      const verified = saved === 'true';
      if (verified) setIsVerified(true);

      try {
        setLoading(true);
        if (verified) {
          // Fetch FULL order if already verified
          const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
          setOrder(data);
        } else {
          // Just fetch ID to confirm existence
          const { data } = await supabase.from('orders').select('id').eq('id', orderId).single();
          setOrder(data ? { id: data.id } : null);
        }
      } catch (err) {
        console.error('Fetch Order Error:', err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]); // Only run when ID changes or on mount

  // 3. Auto-redirect logic
  useEffect(() => {
    if (!loading && !order && redirectTimer > 0) {
      const t = setTimeout(() => setRedirectTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
    if (!loading && !order && redirectTimer === 0) {
      window.location.href = '/';
    }
  }, [loading, order, redirectTimer]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/order/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, query, type: verifyType })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro na verificação.');
      } else {
        setOrder(data.order);
        setIsVerified(true);
        sessionStorage.setItem(`order_verified_${id}`, 'true');
      }
    } catch (err) {
      setError('Falha na conexão.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading state (ONLY while fetching)
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-fire-orange/20 border-t-fire-orange rounded-full animate-spin" />
    </div>
  );

  // 2. Invalid/Not Found State (with redirect)
  if (!order) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-sm text-center">
        <div className="w-20 h-20 bg-fire-red/20 rounded-full flex items-center justify-center mx-auto mb-8 text-fire-red">
          <Package size={40} className="opacity-50" />
        </div>
        <h1 className="text-4xl font-bebas tracking-widest mb-4">PEDIDO NÃO ENCONTRADO</h1>
        <p className="text-xs text-white/40 mb-8 font-mono leading-relaxed uppercase">
          O código informado é inválido ou o pedido não existe mais em nossa base de dados.
        </p>
        <div className="p-4 bg-black/40 border border-white/5 rounded-sm mb-8">
          <p className="text-[10px] text-white/20 font-mono uppercase">Redirecionando para a loja em</p>
          <p className="text-3xl font-display text-fire-orange">{redirectTimer}s</p>
        </div>
        <Link href="/" className="inline-block px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all">
          Voltar Agora
        </Link>
      </div>
    </main>
  );

  // 3. Security Gate (if order exists but not verified)
  if (!isVerified) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-sm text-center"
      >
        <div className="w-16 h-16 bg-fire-orange/20 rounded-full flex items-center justify-center mx-auto mb-6 text-fire-orange">
          <Clock size={32} />
        </div>
        <h2 className="text-2xl font-bebas tracking-widest mb-2">VERIFICAÇÃO DE SEGURANÇA</h2>
        <p className="text-xs text-white/40 mb-8 font-mono leading-relaxed">
          Informe um dado da compra para acessar.
        </p>

        <div className="flex gap-2 mb-6 justify-center">
          {['email', 'cpf'].map((t) => (
            <button
              key={t}
              onClick={() => { setVerifyType(t as any); setQuery(''); setError(''); }}
              className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all rounded-sm border ${
                verifyType === t ? 'bg-fire-orange text-black border-fire-orange font-bold' : 'bg-transparent text-white/30 border-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          <input 
            type={verifyType === 'email' ? 'email' : 'text'}
            placeholder={verifyType === 'email' ? 'seu@email.com' : '000.000.000-00'}
            value={query}
            onChange={(e) => {
              let val = e.target.value;
              if (verifyType === 'cpf') val = formatCPF(val);
              setQuery(val);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm outline-none focus:border-fire-orange/50 transition-all font-mono text-sm text-center"
          />
          {error && <p className="text-[10px] text-fire-red font-mono uppercase tracking-tighter">{error}</p>}
          <button onClick={handleVerify} disabled={loading} className="w-full py-4 bg-fire-orange text-black font-bold uppercase tracking-widest text-xs rounded-sm">
            {loading ? 'Verificando...' : 'Acessar Detalhes'}
          </button>
        </div>
      </motion.div>
    </main>
  );

  // 4. Verification in progress (if isVerified but full data not loaded)
  if (isVerified && (!order || !order.customer_name)) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-fire-orange/20 border-t-fire-orange rounded-full animate-spin" />
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
            <h1 className="text-5xl font-bebas tracking-wider">
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
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center p-3 hover:bg-white/5 transition-all rounded-sm border border-transparent hover:border-white/5">
                    <div className="relative w-16 h-20 bg-white/5 rounded-sm overflow-hidden">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover object-top" />}
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

            {order.status === 'Pendente' && (
              <div className="bg-fire-orange/5 border border-fire-orange/20 rounded-sm p-6 space-y-4">
                <div className="flex items-center gap-3 text-fire-orange">
                  <Clock size={20} />
                  <h3 className="text-lg font-bebas tracking-widest">AGUARDANDO PAGAMENTO PIX</h3>
                </div>
                <p className="text-xs text-white/60 font-body leading-relaxed">
                  Seu pedido foi registrado. Para agilizar o envio, realize o PIX para o beneficiário <span className="text-white font-bold">LUCAS GOMES DO AMARAL</span>.
                </p>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="bg-white p-4 rounded-sm shadow-xl">
                    <img 
                      src="/pix_qrcode.jpeg" 
                      alt="PIX QR Code" 
                      className="w-40 h-40 object-contain block mx-auto"
                    />
                  </div>
                  <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest">Escaneie ou copie o código abaixo</p>
                </div>

                <div className="p-4 bg-black/40 rounded-sm border border-white/5">
                  <p className="text-[10px] text-white/40 font-mono uppercase mb-2">Chave PIX (Copia e Cola)</p>
                  <p className="text-[9px] font-mono text-fire-orange break-all opacity-80 select-all">00020101021126360014br.gov.bcb.pix0114+55119899400805204000053039865802BR5921LUCAS GOMES DO AMARAL6010INDAIATUBA62070503***63043504</p>
                </div>
                <p className="text-[10px] text-white/40 font-mono italic text-center">
                  * A validação manual do PIX pode levar até 24h úteis.
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white/2 border border-fire-orange/20 rounded-sm p-8 relative overflow-hidden">
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
                Pagamento via PIX com validação manual (provisório V4).
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
