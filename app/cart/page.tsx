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
        className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 transition-colors duration-200 font-mono"
        style={{ color: focused ? '#FF4500' : 'rgba(128,128,128,0.5)' }}
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
          className={`w-full px-4 py-3 bg-transparent text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 text-sm outline-none transition-all duration-300 font-body font-medium rounded-sm ${
            error ? 'border border-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]' : focused ? 'border border-fire-orange bg-fire-orange/5 drop-shadow-[0_0_16px_rgba(255,69,0,0.2)]' : 'border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02]'
          }`}
        />
        {focused && !error && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-[#FF0000] via-[#FF4500] to-[#FFA500]"
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
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#FF0000] to-[#FFA500] rounded-sm font-mono text-[0.75rem] text-black font-bold">
        {step}
      </div>
      <h2 className="text-2xl text-black dark:text-white font-display tracking-[0.1em]">
        {children}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-fire-orange/20 to-transparent" />
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
    <main className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <CartSidebar />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,69,0,0.04)_0%,transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-40">

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-8 group font-mono text-[0.7rem] tracking-[0.2em]">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            CONTINUAR COMPRANDO
          </Link>
          <h1 className="text-[clamp(3rem,8vw,6rem)] leading-none mb-12 font-display tracking-[0.04em]">
            <span className="text-black/30 dark:text-white/25">MEU </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500]">
              CARRINHO
            </span>
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
                    <p className="text-black/50 dark:text-white/30 font-mono text-sm py-8 text-center border border-dashed border-black/10 dark:border-white/10">Carrinho vazio</p>
                  ) : items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                      className="flex gap-4 p-4 group bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] rounded-sm"
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
                              <h3 className="text-lg text-black dark:text-white leading-tight font-display tracking-[0.05em]">
                                {item.name}
                              </h3>
                              <p className="text-[10px] text-black/50 dark:text-white/30 mt-0.5 font-mono">
                                {item.category}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.id, item.size)}
                              className="p-1.5 text-black/30 dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </motion.button>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] border border-black/10 dark:border-white/10 px-2 py-0.5 text-black/60 dark:text-white/40 font-mono rounded-sm">
                              TAM: {item.size}
                            </span>
                            {item.color && (
                              <span className="text-[10px] border border-black/10 dark:border-white/10 px-2 py-0.5 text-black/60 dark:text-white/40 truncate font-mono rounded-sm">
                                {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty */}
                          <div className="flex items-center gap-1 border border-black/10 dark:border-white/10 rounded-sm bg-black/5 dark:bg-white/[0.02]">
                            <button onClick={() => updateQty(item.id, item.size, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
                              <Minus size={10} />
                            </button>
                            <span className="w-8 text-center text-sm text-black dark:text-white font-mono">
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQty(item.id, item.size, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-black/50 dark:text-white/30 hover:text-fire-orange transition-colors">
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-xl font-display text-transparent bg-clip-text bg-gradient-to-br from-[#FF4500] to-[#FFA500]">
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
                  <label className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 text-black/50 dark:text-white/30 font-mono">
                    CEP
                  </label>
                  <input
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-3 bg-transparent text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 outline-none font-mono border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] rounded-sm"
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
                    className="px-5 py-3 font-body font-bold uppercase tracking-[0.15em] text-sm transition-all rounded-sm bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500] text-black"
                    style={{ opacity: loadingCep ? 0.7 : 1 }}
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
                    className="mt-3 flex items-center gap-3 px-4 py-3 overflow-hidden bg-fire-orange/10 border border-fire-orange/20 rounded-sm"
                  >
                    <Truck size={14} className="text-fire-orange flex-shrink-0" />
                    <span className="text-sm text-black/60 dark:text-white/60 font-body">
                      {shipping.label} — entrega em {shipping.days} dias úteis
                    </span>
                    <span className={`ml-auto font-bold font-mono text-[0.85rem] ${shipping.price === 0 ? 'text-green-500 dark:text-green-400' : 'text-fire-orange'}`}>
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
                      className={`flex-1 min-w-[130px] py-4 px-3 text-center transition-all duration-200 rounded-sm border ${
                        isSelected ? 'border-fire-orange bg-fire-orange/20 drop-shadow-fire-sm' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02]'
                      }`}
                    >
                      <p className="text-sm font-bold font-body text-black dark:text-white">
                        {labels[method]}
                      </p>
                      <p className={`text-[10px] mt-1 font-mono ${isSelected ? 'text-fire-orange' : 'text-black/40 dark:text-white/20'}`}>
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
                  className="mt-4 p-6 text-center overflow-hidden border border-black/5 dark:border-white/[0.05] rounded-sm bg-black/5 dark:bg-white/[0.02]"
                >
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center border-2 border-fire-orange/30 rounded-md bg-fire-orange/10">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/50 font-body">
                    O QR Code PIX será gerado após confirmar o pedido.
                  </p>
                  <p className="text-xs mt-1 text-green-600 dark:text-green-400/80 font-mono">
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
            <div className="p-6 space-y-5 bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.06] rounded-sm">

              {/* Fire top border */}
              <div className="h-px -mx-6 -mt-6 mb-0 bg-gradient-to-r from-[#FF0000] via-[#FF4500] to-transparent" />

              <h3 className="text-xl pt-1 font-display tracking-[0.1em] text-black dark:text-white">
                RESUMO DO PEDIDO
              </h3>

              {/* Item count */}
              <div className="flex justify-between text-sm text-black/50 dark:text-white/40 font-mono text-[0.7rem]">
                <span>Itens ({items.reduce((a, i) => a + i.quantity, 0)})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm font-mono text-[0.7rem]">
                <span className="text-black/50 dark:text-white/40">Frete</span>
                <span className={shippingCost === 0 ? 'text-green-500 dark:text-green-400' : shippingCost === null ? 'text-black/30 dark:text-white/20' : 'text-black/80 dark:text-white/70'}>
                  {shippingCost === null ? '—' : shippingCost === 0 ? 'GRÁTIS' : formatCurrency(shippingCost)}
                </span>
              </div>

              {/* Free shipping progress */}
              {subtotal < 299 && (
                <div>
                  <div className="flex justify-between text-[10px] text-black/40 dark:text-white/20 mb-1.5 font-mono">
                    <span>Faltam {formatCurrency(299 - subtotal)} para frete grátis</span>
                    <span>{Math.round((subtotal / 299) * 100)}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/[0.06]">
                    <motion.div
                      className="h-full origin-left bg-gradient-to-r from-[#FF0000] via-[#FF4500] to-[#FFA500]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: Math.min(subtotal / 299, 1) }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-black/5 dark:bg-white/[0.05]" />

              {/* Coupon Field */}
              <div className="pt-2">
                <label className="block text-[9px] tracking-[0.2em] uppercase mb-1.5 text-black/40 dark:text-white/20 font-mono">
                  CUPOM DE DESCONTO
                </label>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="CUPOM"
                  className="w-full px-3 py-2 bg-transparent text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 text-xs outline-none border border-black/10 dark:border-white/10 focus:border-fire-orange/40 transition-all font-mono rounded-sm"
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-black/5 dark:bg-white/[0.05]" />

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="text-black/60 dark:text-white/50 text-sm font-mono text-[0.7rem]">
                  TOTAL
                </span>
                <span className="text-3xl font-display tracking-[0.05em] text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500] drop-shadow-[0_0_10px_rgba(255,69,0,0.3)]">
                  {formatCurrency(shippingCost !== null ? total : subtotal)}
                </span>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleOrder}
                disabled={!isFormValid() || loadingOrder}
                whileHover={isFormValid() ? { scale: 1.02, y: -1 } : {}}
                whileTap={isFormValid() ? { scale: 0.98 } : {}}
                className={`w-full py-4 flex items-center justify-center gap-3 font-body font-extrabold uppercase tracking-[0.18em] rounded-sm relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500] text-black ${!isFormValid() || loadingOrder ? 'opacity-40 grayscale' : ''}`}
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
                <Lock size={10} className="text-black/30 dark:text-white/20" />
                <span className="text-[9px] text-black/40 dark:text-white/20 font-mono">
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
