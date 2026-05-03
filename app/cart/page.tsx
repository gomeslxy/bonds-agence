'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trash2, Minus, Plus,
  Lock, ChevronRight, Truck, Zap, Loader2,
  CreditCard, Apple
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { fireToast } from '@/components/ToastVFX';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';
import { maskCPF, maskCEP, validateCPF, formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

/* ─── Neon Input ────────────────────────────────────────── */
function IceInput({
  label, placeholder, type = 'text', half = false, value, onChange, error, maxLength, loading
}: {
  label: string; placeholder: string; type?: string; half?: boolean; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: boolean; maxLength?: number; loading?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={half ? 'flex-1 min-w-[140px]' : 'w-full'}>
      <label
        className="block text-[10px] tracking-[0.2em] uppercase mb-1.5 transition-colors duration-200 font-mono"
        style={{ color: focused ? '#00BFFF' : 'rgba(128,128,128,0.5)' }}
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
            error ? 'border border-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]' : focused ? 'border border-ice-blue bg-ice-blue/5 drop-shadow-[0_0_16px_rgba(0,191,255,0.2)]' : 'border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02]'
          } ${loading ? 'opacity-50 animate-pulse cursor-wait' : ''}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-ice-blue/30 border-t-ice-blue rounded-full animate-spin" />
          </div>
        )}
        {focused && !error && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-[#007FFF] via-[#00BFFF] to-[#00FFFF]"
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
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#007FFF] to-[#00FFFF] rounded-sm font-mono text-[0.75rem] text-black font-bold">
        {step}
      </div>
      <h2 className="text-2xl text-black dark:text-white font-display tracking-[0.1em]">
        {children}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-ice-blue/20 to-transparent" />
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
    confirmEmail: '',
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
  const [payMethod, setPayMethod] = useState<'pix'>('pix');
  const [currentStep, setCurrentStep] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [isCpfValid, setIsCpfValid] = useState(true);
  const [couponInfo, setCouponInfo] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState(false);
  const [pixTimer, setPixTimer] = useState(10);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const isFieldRequired = (field: string) => {
    return ['name', 'email', 'confirmEmail', 'cpf', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'].includes(field);
  };

  const validateStep1 = () => {
    const newErrors: string[] = [];
    const required = ['name', 'email', 'confirmEmail', 'cpf', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'];
    
    required.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors.push(field);
      }
    });

    if (formData.email !== formData.confirmEmail) {
      newErrors.push('confirmEmail');
    }

    if (!validateCPF(formData.cpf)) {
      newErrors.push('cpf');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  useEffect(() => {
    setMounted(true);
    
    // Pre-fill user data if logged in
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || prev.name,
          email: user.email || prev.email,
          confirmEmail: user.email || prev.confirmEmail,
          cpf: user.user_metadata?.cpf || prev.cpf,
        }));
      }
    };
    fetchUser();
  }, []);

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
    if (errors.includes(field)) {
      setErrors(prev => prev.filter(f => f !== field));
    }

    // Auto-fetch address if CEP is complete
    if (field === 'cep' && formattedValue.replace(/\D/g, '').length === 8) {
      fetchAddress(formattedValue.replace(/\D/g, ''));
    }
  };

  const fetchAddress = async (cep: string) => {
    try {
      setLoadingCep(true);
      const res = await fetch(`/api/cep/${cep}`);
      const data = await res.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
        
        // Clear errors for auto-filled fields
        setErrors(prev => prev.filter(f => !['address', 'neighborhood', 'city', 'state'].includes(f)));
        
        fireToast('CEP Encontrado!', `${data.localidade}, ${data.uf}`);
        
        // Also trigger shipping calculation if items exist
        if (items.length > 0) {
          calcShipping(cep);
        }
      } else {
        fireToast('CEP não encontrado', 'Verifique o número digitado.');
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

  const validateCoupon = async () => {
    const code = coupon.trim();
    if (!code) return;
    
    setLoadingCep(true); // Reusing loading state for feedback
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setCouponInfo({ code: data.code, discount: data.discount });
        setCouponError(false);
        fireToast('Cupom Aplicado!', `${data.discount}% de desconto ativado`);
      } else {
        setCouponInfo(null);
        setCouponError(true);
        fireToast('Cupom Inválido', data.error || 'Este código não existe ou expirou.');
      }
    } catch (err) {
      fireToast('Erro', 'Não foi possível validar o cupom.');
    } finally {
      setLoadingCep(false);
    }
  };

  const isFormValid = () => {
    const required = ['name', 'email', 'cpf', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'];
    const hasEmpty = required.some(field => !formData[field as keyof typeof formData]);
    
    const emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isEmailValid = emailRegex.test(formData.email);
    const isEmailMatching = formData.email === formData.confirmEmail && formData.email.length > 0;
    
    const nameStr = typeof formData.name === 'string' ? formData.name : '';
    const nameParts = nameStr.trim().split(/\s+/);
    const isNameValid = nameParts.length >= 2 && nameStr.length >= 5;
    
    const isCepComplete = formData.cep.replace(/\D/g, '').length === 8;
    const isCpfComplete = formData.cpf.replace(/\D/g, '').length === 11;
    
    return !hasEmpty && isNameValid && isCpfValid && isCpfComplete && isCepComplete && isEmailValid && isEmailMatching && items.length > 0;
  };

  const handleOrder = async () => {
    if (!isFormValid()) {
      validateStep1();
      if (formData.email !== formData.confirmEmail) {
        fireToast('E-mails não coincidem', 'Os campos de e-mail devem ser idênticos.');
      } else {
        fireToast('Campos Incompletos', 'Por favor preencha todos os campos obrigatórios e verifique os dados.');
      }
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
        fireToast('Pedido Realizado!', 'Seu pedido foi registrado com sucesso.');
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ice-blue/20 border-t-ice-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <CartSidebar />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,191,255,0.04)_0%,transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-40">

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-8 group font-mono text-[0.7rem] tracking-[0.2em]">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            CONTINUAR COMPRANDO
          </Link>
          <h1 className="text-[clamp(3rem,8vw,6rem)] leading-none mb-12 font-display tracking-[0.04em]">
            <span className="text-black/30 dark:text-white/25">MEU </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] via-[#00BFFF] to-[#00FFFF]">
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
                                    className="w-8 h-8 flex items-center justify-center text-black/50 dark:text-white/30 hover:text-ice-blue transition-colors">
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-xl font-display text-transparent bg-clip-text bg-gradient-to-br from-[#00BFFF] to-[#00FFFF]">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>

            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* ── Identificação ── */}
                  <section>
                    <SectionTitle step={1}>Identificação</SectionTitle>
                    <div className="space-y-4">
                      <div className="flex gap-4 flex-wrap">
                        <IceInput label="Nome Completo *" placeholder="Seu nome" half value={formData.name} onChange={e => handleInputChange('name', e.target.value)} error={errors.includes('name')} />
                        <IceInput label="CPF *" placeholder="000.000.000-00" half value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} error={errors.includes('cpf')} maxLength={14} />
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <IceInput label="E-mail *" placeholder="seu@email.com" type="email" half value={formData.email} onChange={e => handleInputChange('email', e.target.value)} error={errors.includes('email')} />
                        <IceInput label="Confirmar E-mail *" placeholder="seu@email.com" type="email" half value={formData.confirmEmail} onChange={e => handleInputChange('confirmEmail', e.target.value)} error={errors.includes('confirmEmail')} />
                      </div>
                    </div>
                  </section>

                  {/* ── Entrega ── */}
                  <section>
                    <SectionTitle step={2}>Dados de Entrega</SectionTitle>
                    <div className="space-y-4">
                      <div className="flex gap-4 flex-wrap">
                        <IceInput label="CEP *" placeholder="00000-000" half value={formData.cep} onChange={e => handleInputChange('cep', e.target.value)} maxLength={9} loading={loadingCep} error={errors.includes('cep')} />
                        <IceInput label="Endereço *" placeholder="Rua, Av..." half value={formData.address} onChange={e => handleInputChange('address', e.target.value)} loading={loadingCep} error={errors.includes('address')} />
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <IceInput label="Número *" placeholder="123" half value={formData.number} onChange={e => handleInputChange('number', e.target.value)} error={errors.includes('number')} />
                        <IceInput label="Bairro *" placeholder="Seu bairro" half value={formData.neighborhood} onChange={e => handleInputChange('neighborhood', e.target.value)} loading={loadingCep} error={errors.includes('neighborhood')} />
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <IceInput label="Cidade *" placeholder="São Paulo" half value={formData.city} onChange={e => handleInputChange('city', e.target.value)} loading={loadingCep} error={errors.includes('city')} />
                        <IceInput label="Estado *" placeholder="SP" half value={formData.state} onChange={e => handleInputChange('state', e.target.value)} loading={loadingCep} error={errors.includes('state')} />
                      </div>
                      <IceInput label="Complemento" placeholder="Apto, Bloco..." value={formData.complement} onChange={e => handleInputChange('complement', e.target.value)} />
                    </div>
                  </section>

                  <button
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        fireToast('Atenção', 'Verifique os campos marcados em vermelho.');
                      }
                    }}
                    className="w-full py-5 bg-ice-gradient text-black font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-ice-blue/20"
                  >
                    Próximo Passo: Pagamento
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 text-[10px] text-black/40 dark:text-white/20 hover:text-ice-blue transition-colors font-mono uppercase tracking-widest"
                  >
                    <ArrowLeft size={12} /> Alterar dados de entrega
                  </button>

                  <section>
                    <SectionTitle step={3}>Pagamento</SectionTitle>
                    
                    <div className="p-8 border border-ice-blue/20 bg-ice-blue/5 rounded-sm space-y-6 text-center">
                      <div className="w-16 h-16 bg-ice-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} className="text-ice-blue" />
                      </div>
                      
                      <h3 className="text-2xl font-display tracking-widest text-black dark:text-white">PAGAMENTO SEGURO</h3>
                      <p className="text-sm text-black/60 dark:text-white/40 font-body leading-relaxed max-w-xs mx-auto">
                        Você será redirecionado para o ambiente seguro do <span className="text-ice-blue font-bold">Stripe</span> para finalizar sua compra via PIX, Cartão ou Boleto.
                      </p>

                      <div className="flex items-center justify-center gap-8 pt-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-10 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center border border-black/10 dark:border-white/10 group hover:border-ice-blue/40 transition-colors">
                            <CreditCard size={20} className="text-black/60 dark:text-white/60 group-hover:text-ice-blue" />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-black/40 dark:text-white/40">CARTÃO</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-10 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center border border-black/10 dark:border-white/10 group hover:border-white/40 transition-colors">
                            <div className="flex items-center gap-0.5">
                              <Apple size={18} className="text-black dark:text-white mb-0.5" />
                              <span className="font-bold text-xs tracking-tighter text-black dark:text-white">Pay</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-black/40 dark:text-white/40">APPLE PAY</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-10 bg-[#5433FF]/5 rounded-lg flex items-center justify-center border border-[#5433FF]/20 group hover:bg-[#5433FF]/10 transition-colors">
                            <span className="font-black italic text-sm tracking-tighter text-[#5433FF]">Link</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-[#5433FF]/60">LINK</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleOrder}
                      disabled={loadingOrder}
                      className="w-full mt-6 py-5 bg-ice-blue text-black font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-ice-blue/20"
                    >
                      {loadingOrder ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          PROCESSANDO...
                        </>
                      ) : (
                        <>
                          EFETUAR PAGAMENTO
                          <ChevronRight size={20} />
                        </>
                      )}
                    </button>
                    
                    <p className="mt-4 text-[10px] text-center text-black/40 dark:text-white/20 font-mono uppercase tracking-[0.2em]">
                      Ambiente 100% Criptografado & Seguro
                    </p>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ══ RIGHT — Order Summary ══ */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="self-start lg:sticky lg:top-28 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar"
          >
            <div className="p-6 space-y-5 bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.06] rounded-sm">

              {/* Fire top border */}
              <div className="h-px -mx-6 -mt-6 mb-0 bg-gradient-to-r from-[#007FFF] via-[#00BFFF] to-transparent" />

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
                      className="h-full origin-left bg-gradient-to-r from-[#007FFF] via-[#00BFFF] to-[#00FFFF]"
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
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponInfo(null); setCouponError(false); }}
                    placeholder="CUPOM"
                    className={`flex-1 px-3 py-2 bg-transparent text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 text-xs outline-none border transition-all font-mono rounded-sm ${
                      couponInfo ? 'border-green-500/50 bg-green-500/5' : couponError ? 'border-red-500/50 bg-red-500/5' : 'border-black/10 dark:border-white/10 focus:border-ice-blue/40'
                    }`}
                  />
                  <button 
                    onClick={validateCoupon}
                    className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm font-mono text-[9px] hover:bg-ice-blue hover:text-black transition-all uppercase tracking-widest"
                  >
                    Aplicar
                  </button>
                </div>
                {couponInfo && (
                  <p className="text-[9px] text-green-500 mt-1.5 font-mono uppercase tracking-wider">
                    ✓ {couponInfo.discount}% de desconto aplicado
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-black/5 dark:bg-white/[0.05]" />

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="text-black/60 dark:text-white/50 text-sm font-mono text-[0.7rem]">
                  TOTAL
                </span>
                <div className="text-right">
                  {couponInfo && (
                    <p className="text-[10px] text-black/30 dark:text-white/20 line-through font-mono mb-1">
                      {formatCurrency(shippingCost !== null ? total : subtotal)}
                    </p>
                  )}
                  <span className="text-3xl font-display tracking-[0.05em] text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] via-[#00BFFF] to-[#00FFFF] drop-shadow-[0_0_10px_rgba(0,191,255,0.3)]">
                    {formatCurrency(
                      (shippingCost !== null ? total : subtotal) * (1 - (couponInfo?.discount || 0) / 100)
                    )}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                onClick={() => {
                  if (currentStep === 1) {
                    if (isFormValid()) setCurrentStep(2);
                    else fireToast('Dados Incompletos', 'Preencha seus dados para continuar.');
                  } else {
                    handleOrder();
                  }
                }}
                disabled={loadingOrder}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 flex items-center justify-center gap-3 font-body font-extrabold uppercase tracking-[0.18em] rounded-sm relative overflow-hidden transition-all duration-300 bg-ice-gradient text-black ${loadingOrder ? 'opacity-40 grayscale' : ''}`}
              >
                {!loadingOrder && (
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
                    <span className="relative z-10">
                      {currentStep === 1 ? 'Ir para Pagamento' : 'Confirmar & Pagar'}
                    </span>
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
