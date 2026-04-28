'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trash2, Minus, Plus,
  Lock, ChevronRight, Truck,
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { fireToast } from '@/components/ToastVFX';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';
import { maskCPF, maskCEP, validateCPF, formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

/* ─── Neon Input ────────────────────────────────────────── */
function FireInput({
  label, placeholder, type = 'text', half = false, value, onChange, error, maxLength
}: {
  label: string; placeholder: string; type?: string; half?: boolean; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: boolean; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={half ? 'flex-1 min-w-[140px]' : 'w-full'}>
      <label
        className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 transition-colors duration-200"
        style={{ fontFamily: "'Space Mono', monospace", color: focused ? '#FF4500' : 'rgba(255,255,255,0.3)' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          className="w-full px-4 py-3 bg-transparent text-white placeholder-white/20 text-sm outline-none transition-all duration-300"
          style={{
            fontFamily: "'Barlow Condensed', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: '1rem',
            border: error ? '1px solid #ef4444' : focused ? '1px solid #FF4500' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '2px',
            background: focused ? 'rgba(255,69,0,0.04)' : 'rgba(255,255,255,0.02)',
            boxShadow: error ? '0 0 10px rgba(239,68,68,0.2)' : focused ? '0 0 16px rgba(255,69,0,0.2), inset 0 0 12px rgba(255,69,0,0.04)' : 'none',
            transition: 'all 0.25s ease',
          }}
        />
        {focused && !error && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-px origin-left"
            style={{ background: 'linear-gradient(90deg, #FF0000, #FF4500, #FFA500)' }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Section heading ───────────────────────────────────── */
function SectionTitle({ children, step }: { children: React.ReactNode; step: number }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
           style={{
             background: 'linear-gradient(135deg, #FF0000, #FFA500)',
             borderRadius: '2px',
             fontFamily: "'Space Mono', monospace",
             fontSize: '0.75rem',
             color: 'black',
             fontWeight: 700,
           }}>
        {step}
      </div>
      <h2 className="text-2xl text-white"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}>
        {children}
      </h2>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,69,0,0.2), transparent)' }} />
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [shipping, setShipping] = useState<null | { label: string; price: number; days: number }>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [payMethod, setPayMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [coupon, setCoupon] = useState('');
  const [isCpfValid, setIsCpfValid] = useState(true);

  const subtotal = totalPrice();
  const shippingCost = shipping?.price ?? (subtotal >= 299 ? 0 : null);
  const total = subtotal + (shippingCost ?? 0);

  useEffect(() => {
    if (formData.cpf.length === 14) {
      setIsCpfValid(validateCPF(formData.cpf));
    } else {
      setIsCpfValid(true);
    }
  }, [formData.cpf]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = maskCPF(value);
    } else if (field === 'cep') {
      formattedValue = maskCEP(value);
    } else if (field === 'state') {
      formattedValue = value.toUpperCase().slice(0, 2);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Auto-fetch address if CEP is complete
    if (field === 'cep' && formattedValue.replace(/\D/g, '').length === 8) {
      fetchAddress(formattedValue.replace(/\D/g, ''));
    }
  };

  const fetchAddress = async (cep: string) => {
    try {
      setLoadingCep(true);
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
        
        // Also trigger shipping calculation if items exist
        if (items.length > 0) {
          calcShipping(cep);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    } finally {
      setLoadingCep(false);
    }
  };

  const calcShipping = async (specificCep?: string) => {
    const cleanCep = (specificCep || formData.cep).replace(/\D/g, '');
    if (cleanCep.length < 8) {
      fireToast('CEP Inválido', 'Digite o CEP completo para calcular o frete.');
      return;
    }
    
    setLoadingCep(true);
    // Simulating API call for shipping
    await new Promise((r) => setTimeout(r, 800));
    const options = [
      { label: 'PAC', price: subtotal >= 299 ? 0 : 19.9, days: 7 },
      { label: 'SEDEX', price: 34.9, days: 2 },
    ];
    setShipping(options[0]);
    setLoadingCep(false);
    if (!specificCep) {
      fireToast('Frete calculado!', options[0].label + (options[0].price === 0 ? ' · GRÁTIS' : ` · ${formatCurrency(options[0].price)}`));
    }
  };

  const isFormValid = () => {
    const required = ['name', 'email', 'cpf', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'];
    const hasEmpty = required.some(field => !formData[field as keyof typeof formData]);
    
    // Stricter Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(formData.email);
    
    // Stricter Name Validation (at least two words)
    const nameParts = formData.name.trim().split(/\s+/);
    const isNameValid = nameParts.length >= 2 && formData.name.length >= 5;
    
    const isCepComplete = formData.cep.replace(/\D/g, '').length === 8;
    const isCpfComplete = formData.cpf.replace(/\D/g, '').length === 11;
    
    return !hasEmpty && isNameValid && isCpfValid && isCpfComplete && isCepComplete && isEmailValid && items.length > 0;
  };

  const handleOrder = async () => {
    if (!isFormValid()) {
      fireToast('Campos Incompletos', 'Por favor preencha todos os dados obrigatórios e verifique o CPF.');
      return;
    }

    setLoadingOrder(true);
    try {
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_cpf: formData.cpf,
        cep: formData.cep,
        address: formData.address,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          size: i.size,
          color: i.color,
          price: i.price,
          quantity: i.quantity,
          image: i.image
        })),
        total_price: total,
        status: 'Pendente',
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, coupon }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Erro ao processar checkout');

      if (resData.url) {
        fireToast('Redirecionando...', 'Aguarde um momento.');
        window.location.href = resData.url;
      } else if (resData.success) {
        fireToast('Pedido Confirmado!', 'Teste bonds2026 ativado.');
        clearCart();
        router.push(`/success?id=${resData.orderId}`);
      }
    } catch (err: any) {
      console.error(err);
      fireToast('Erro no Checkout', err.message || 'Tente novamente em instantes.');
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <CartSidebar />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,69,0,0.04) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-40">

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-8 group"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.2em' }}>
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            CONTINUAR COMPRANDO
          </Link>
          <h1 className="text-[clamp(3rem,8vw,6rem)] leading-none mb-12"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.04em' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>MEU </span>
            <span style={{
              background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>CARRINHO</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8 xl:gap-12">

          {/* ══ LEFT COLUMN ══ */}
          <div className="space-y-8">

            {/* ── Items list ── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <SectionTitle step={1}>Seus Itens</SectionTitle>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.length === 0 ? (
                    <p className="text-white/30 font-mono text-sm py-8 text-center border border-dashed border-white/10">Carrinho vazio</p>
                  ) : items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                      className="flex gap-4 p-4 group"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '3px',
                      }}
                    >
                      {/* Image */}
                      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden" style={{ borderRadius: '2px' }}>
                        <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-lg text-white leading-tight"
                                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.05em' }}>
                                {item.name}
                              </h3>
                              <p className="text-[10px] text-white/30 mt-0.5"
                                  style={{ fontFamily: "'Space Mono', monospace" }}>
                                {item.category}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.id, item.size)}
                              className="p-1.5 text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </motion.button>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] border border-white/10 px-2 py-0.5 text-white/40"
                                  style={{ fontFamily: "'Space Mono', monospace", borderRadius: '1px' }}>
                              TAM: {item.size}
                            </span>
                            {item.color && (
                              <span className="text-[10px] border border-white/10 px-2 py-0.5 text-white/40 truncate"
                                    style={{ fontFamily: "'Space Mono', monospace", borderRadius: '1px' }}>
                                {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty */}
                          <div className="flex items-center gap-1 border border-white/10"
                               style={{ borderRadius: '2px', background: 'rgba(255,255,255,0.02)' }}>
                            <button onClick={() => updateQty(item.id, item.size, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                              <Minus size={10} />
                            </button>
                            <span className="w-8 text-center text-sm text-white"
                                  style={{ fontFamily: "'Space Mono', monospace" }}>
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQty(item.id, item.size, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-fire-orange transition-colors">
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-xl"
                                style={{
                                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                                  background: 'linear-gradient(135deg, #FF4500, #FFA500)',
                                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                }}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* ── Shipping calc ── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionTitle step={2}>Calcular Frete</SectionTitle>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <label className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 text-white/30"
                         style={{ fontFamily: "'Space Mono', monospace" }}>
                    CEP
                  </label>
                  <input
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-white/20 outline-none"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '2px',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && calcShipping()}
                  />
                  {loadingCep && (
                    <div className="absolute right-3 bottom-3">
                      <div className="w-4 h-4 border-2 border-fire-orange/30 border-t-fire-orange rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => calcShipping()}
                    disabled={loadingCep}
                    className="px-5 py-3 font-bold uppercase tracking-widest text-sm transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
                      borderRadius: '2px',
                      fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: 'black',
                      opacity: loadingCep ? 0.7 : 1,
                    }}
                  >
                    {loadingCep ? '...' : 'Calcular'}
                  </motion.button>
                </div>
              </div>

              {/* Shipping result */}
              <AnimatePresence>
                {shipping && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mt-3 flex items-center gap-3 px-4 py-3 overflow-hidden"
                    style={{
                      background: 'rgba(255,69,0,0.05)',
                      border: '1px solid rgba(255,69,0,0.15)',
                      borderRadius: '2px',
                    }}
                  >
                    <Truck size={14} style={{ color: '#FF4500', flexShrink: 0 }} />
                    <span className="text-sm text-white/60"
                          style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
                      {shipping.label} — entrega em {shipping.days} dias úteis
                    </span>
                    <span className="ml-auto font-bold"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            color: shipping.price === 0 ? '#4ade80' : '#FF4500',
                            fontSize: '0.85rem',
                          }}>
                      {shipping.price === 0 ? 'GRÁTIS' : formatCurrency(shipping.price)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* ── Checkout form ── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionTitle step={3}>Dados de Entrega</SectionTitle>
              <div className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <FireInput label="Nome Completo" placeholder="Seu nome" half value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                  <FireInput label="CPF" placeholder="000.000.000-00" half value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} error={!isCpfValid} maxLength={14} />
                </div>
                <FireInput label="E-mail" placeholder="seu@email.com" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                <div className="flex gap-4 flex-wrap">
                  <FireInput label="CEP" placeholder="00000-000" half value={formData.cep} onChange={e => handleInputChange('cep', e.target.value)} maxLength={9} />
                  <FireInput label="Endereço" placeholder="Rua, Av..." half value={formData.address} onChange={e => handleInputChange('address', e.target.value)} />
                </div>
                <div className="flex gap-4 flex-wrap">
                  <FireInput label="Número" placeholder="123" half value={formData.number} onChange={e => handleInputChange('number', e.target.value)} />
                  <FireInput label="Bairro" placeholder="Seu bairro" half value={formData.neighborhood} onChange={e => handleInputChange('neighborhood', e.target.value)} />
                </div>
                <div className="flex gap-4 flex-wrap">
                  <FireInput label="Cidade" placeholder="São Paulo" half value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                  <FireInput label="Estado" placeholder="SP" half value={formData.state} onChange={e => handleInputChange('state', e.target.value)} />
                </div>
              </div>
            </motion.section>

            {/* ── Payment method ── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SectionTitle step={4}>Forma de Pagamento</SectionTitle>
              <div className="flex gap-3 flex-wrap">
                {(['card', 'pix', 'boleto'] as const).map((method) => {
                  const labels = { card: '💳 Cartão', pix: '⚡ PIX', boleto: '📄 Boleto' };
                  const subs   = { card: 'até 12x sem juros', pix: '5% de desconto', boleto: 'vence em 3 dias' };
                  const isSelected = payMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setPayMethod(method)}
                      className="flex-1 min-w-[130px] py-4 px-3 text-center transition-all duration-200"
                      style={{
                        border: isSelected ? '1px solid #FF4500' : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(255,69,0,0.8)' : 'rgba(255,255,255,0.02)',
                        boxShadow: isSelected ? '0 0 16px rgba(255,69,0,0.2)' : 'none',
                        borderRadius: '2px',
                      }}
                    >
                      <p className="text-sm font-bold text-white"
                         style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 700 }}>
                        {labels[method]}
                      </p>
                      <p className="text-[10px] mt-1"
                         style={{ fontFamily: "'Space Mono', monospace", color: isSelected ? '#FF4500' : 'rgba(255,255,255,0.2)' }}>
                        {subs[method]}
                      </p>
                    </button>
                  );
                })}
              </div>

              {payMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  <FireInput label="Número do Cartão" placeholder="0000 0000 0000 0000" />
                  <div className="flex gap-4">
                    <FireInput label="Validade" placeholder="MM/AA" half />
                    <FireInput label="CVV" placeholder="000" half />
                  </div>
                  <FireInput label="Nome no Cartão" placeholder="NOME IMPRESSO" />
                </motion.div>
              )}

              {payMethod === 'pix' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-6 text-center overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '2px', background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center"
                       style={{ border: '2px solid rgba(255,69,0,0.3)', borderRadius: '4px', background: 'rgba(255,69,0,0.05)' }}>
                    <span className="text-3xl">⚡</span>
                  </div>
                  <p className="text-sm text-white/50" style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
                    O QR Code PIX será gerado após confirmar o pedido.
                  </p>
                  <p className="text-xs mt-1 text-green-400/60" style={{ fontFamily: "'Space Mono', monospace" }}>
                    5% de desconto aplicado automaticamente
                  </p>
                </motion.div>
              )}
            </motion.section>
          </div>

          {/* ══ RIGHT — Order Summary ══ */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="self-start lg:sticky lg:top-28 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar"
          >
            <div className="p-6 space-y-5"
                 style={{
                   background: 'rgba(255,255,255,0.02)',
                   border: '1px solid rgba(255,255,255,0.06)',
                   borderRadius: '4px',
                 }}>

              {/* Fire top border */}
              <div className="h-px -mx-6 -mt-6 mb-0"
                   style={{ background: 'linear-gradient(90deg, #FF0000, #FF4500, #FFA500, transparent)' }} />

              <h3 className="text-xl pt-1"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}>
                RESUMO DO PEDIDO
              </h3>

              {/* Item count */}
              <div className="flex justify-between text-sm text-white/40"
                   style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem' }}>
                <span>Itens ({items.reduce((a, i) => a + i.quantity, 0)})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm"
                   style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem' }}>
                <span className="text-white/40">Frete</span>
                <span className={shippingCost === 0 ? 'text-green-400' : shippingCost === null ? 'text-white/20' : 'text-white/70'}>
                  {shippingCost === null ? '—' : shippingCost === 0 ? 'GRÁTIS' : formatCurrency(shippingCost)}
                </span>
              </div>

              {/* Free shipping progress */}
              {subtotal < 299 && (
                <div>
                  <div className="flex justify-between text-[10px] text-white/20 mb-1.5"
                       style={{ fontFamily: "'Space Mono', monospace" }}>
                    <span>Faltam {formatCurrency(299 - subtotal)} para frete grátis</span>
                    <span>{Math.round((subtotal / 299) * 100)}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full origin-left"
                      style={{ background: 'linear-gradient(90deg, #FF0000, #FF4500, #FFA500)' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: Math.min(subtotal / 299, 1) }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* Coupon Field */}
              <div className="pt-2">
                <label className="block text-[9px] tracking-[0.2em] uppercase mb-1.5 text-white/20"
                       style={{ fontFamily: "'Space Mono', monospace" }}>
                  CUPOM DE DESCONTO
                </label>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="CUPOM"
                  className="w-full px-3 py-2 bg-transparent text-white placeholder-white/10 text-xs outline-none border border-white/5 focus:border-fire-orange/40 transition-all"
                  style={{ fontFamily: "'Space Mono', monospace", borderRadius: '2px' }}
                />
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="text-white/50 text-sm" style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem' }}>
                  TOTAL
                </span>
                <span className="text-3xl"
                      style={{
                        fontFamily: "'Bebas Neue', Impact, sans-serif",
                        letterSpacing: '0.05em',
                        background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 10px rgba(255,69,0,0.3))',
                      }}>
                  {formatCurrency(shippingCost !== null ? total : subtotal)}
                </span>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleOrder}
                disabled={!isFormValid() || loadingOrder}
                whileHover={isFormValid() ? { scale: 1.02, y: -1 } : {}}
                whileTap={isFormValid() ? { scale: 0.98 } : {}}
                className={`w-full py-4 flex items-center justify-center gap-3 font-bold uppercase tracking-widest relative overflow-hidden transition-all duration-300 ${!isFormValid() || loadingOrder ? 'opacity-40 grayscale' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, #FF0000 0%, #FF4500 50%, #FFA500 100%)',
                  borderRadius: '2px',
                  fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  color: 'black',
                }}
              >
                {isFormValid() && !loadingOrder && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)', backgroundSize: '200% 100%' }}
                    animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
                  />
                )}
                {loadingOrder ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={14} className="relative z-10" />
                    <span className="relative z-10">Confirmar Pedido</span>
                    <ChevronRight size={14} className="relative z-10" />
                  </>
                )}
              </motion.button>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <Lock size={10} className="text-white/20" />
                <span className="text-[9px] text-white/20" style={{ fontFamily: "'Space Mono', monospace" }}>
                  SSL · 256-bit · Compra 100% Segura
                </span>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
