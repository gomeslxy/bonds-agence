'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trash2, Minus, Plus,
  Lock, Truck, ShoppingBag, CreditCard, ChevronRight
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { fireToast } from '@/components/ToastVFX';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';
import { maskCPF, maskCEP, validateCPF, formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

/* ─── Premium Input ────────────────────────────────────────── */
function PremiumInput({
  label, placeholder, type = 'text', half = false, value, onChange, error, maxLength, loading
}: {
  label: string; placeholder: string; type?: string; half?: boolean; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: boolean; maxLength?: number; loading?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={half ? 'flex-1 min-w-[140px]' : 'w-full'}>
      <label className="block text-[9px] font-mono tracking-[0.4em] uppercase mb-2 text-white/30">
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
          className={`w-full px-5 py-4 bg-white/5 border text-white placeholder-white/10 text-xs outline-none transition-all duration-500 font-medium ${
            error ? 'border-red-500/50 bg-red-500/5' : focused ? 'border-white bg-white/10' : 'border-white/5 hover:border-white/10'
          } ${loading ? 'opacity-50 cursor-wait' : ''}`}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Section heading ───────────────────────────────────── */
function SectionTitle({ children, step }: { children: React.ReactNode; step: number }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-[10px] font-mono text-white/20">0{step}</span>
      <h2 className="text-xl text-white font-bold tracking-tight uppercase italic">
        {children}
      </h2>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart();
  const router = useRouter();

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

  const [mounted, setMounted] = useState(false);
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
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const clientSupabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await clientSupabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || prev.name,
          email: user.email || prev.email,
          confirmEmail: user.email || prev.confirmEmail,
        }));
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    let interval: any;
    if (currentStep === 2) {
      if (pixTimer > 0) {
        interval = setInterval(() => {
          setPixTimer(prev => prev - 1);
        }, 1000);
      }
    } else {
      setPixTimer(10);
    }
    return () => clearInterval(interval);
  }, [currentStep, pixTimer]);

  useEffect(() => {
    setMounted(true);
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
    if (field === 'cpf') formattedValue = maskCPF(value);
    else if (field === 'cep') formattedValue = maskCEP(value);
    else if (field === 'state') formattedValue = value.toUpperCase().slice(0, 2);
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
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
        fireToast('CEP Encontrado!', `${data.localidade}, ${data.uf}`);
        if (items.length > 0) calcShipping(cep);
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
    if (cleanCep.length < 8) return;
    setLoadingCep(true);
    await new Promise((r) => setTimeout(r, 800));
    const options = [
      { label: 'STANDARD', price: subtotal >= 299 ? 0 : 19.9, days: 7 },
    ];
    setShipping(options[0]);
    setLoadingCep(false);
  };

  const validateCoupon = async () => {
    const code = coupon.trim();
    if (!code) return;
    setLoadingCep(true);
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
    if (!isFormValid()) return;
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
        body: JSON.stringify({ ...orderData, coupon, payMethod: 'pix' }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Erro ao processar checkout');

      if (resData.url) {
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      <CartSidebar />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3 text-[10px] font-mono tracking-[0.3em] text-white/30 hover:text-white transition-colors uppercase">
            <ArrowLeft size={12} /> Voltar para Loja
          </Link>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-white' : 'text-white/20'}`}>
              <span className="text-[10px] font-mono">01</span>
              <span className="text-[11px] font-bold tracking-widest uppercase">Carrinho</span>
            </div>
            <div className="w-8 h-px bg-white/10" />
            <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-white' : 'text-white/20'}`}>
              <span className="text-[10px] font-mono">02</span>
              <span className="text-[11px] font-bold tracking-widest uppercase">Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Step 1: Cart Items */}
            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16"
                >
                  {/* Items List */}
                  <section>
                    <SectionTitle step={1}>Review Items</SectionTitle>
                    <div className="space-y-4">
                      {items.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-white/10">
                          <ShoppingBag size={40} className="mx-auto text-white/10 mb-4" />
                          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Carrinho vazio</p>
                        </div>
                      ) : (
                        items.map((item) => (
                          <div key={`${item.id}-${item.size}`} className="flex gap-6 p-6 bg-white/5 border border-white/5 group transition-colors hover:border-white/10">
                            <div className="relative w-24 aspect-[3/4] flex-shrink-0 bg-white/5">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-sm font-bold tracking-tight uppercase">{item.name}</h3>
                                  <p className="text-[10px] text-white/30 font-mono tracking-widest mt-1 uppercase">{item.category}</p>
                                  <div className="flex gap-2 mt-4">
                                    <span className="px-2 py-1 bg-white/5 text-[9px] font-bold text-white/40 uppercase">SIZE: {item.size}</span>
                                    {item.color && <span className="px-2 py-1 bg-white/5 text-[9px] font-bold text-white/40 uppercase">{item.color}</span>}
                                  </div>
                                </div>
                                <button onClick={() => removeItem(item.id, item.size)} className="text-white/20 hover:text-white transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-1 border border-white/10 bg-black">
                                  <button onClick={() => updateQty(item.id, item.size, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white"><Minus size={10} /></button>
                                  <span className="w-8 text-center text-[11px] font-bold font-mono">{item.quantity}</span>
                                  <button onClick={() => updateQty(item.id, item.size, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white"><Plus size={10} /></button>
                                </div>
                                <span className="text-lg font-bold">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Identification & Shipping */}
                  {!user && !authLoading ? (
                    <section className="p-12 border border-white/5 bg-white/5 text-center">
                      <Lock size={32} className="mx-auto text-white/20 mb-6" />
                      <h3 className="text-2xl font-bold uppercase italic mb-4">Acesso Exclusivo</h3>
                      <p className="text-white/40 text-sm mb-10 max-w-sm mx-auto">Conecte-se para garantir a segurança dos seus dados e acompanhar seu pedido em tempo real.</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/login?redirectTo=/cart" className="btn-premium px-12">LOGIN</Link>
                        <Link href="/register?redirectTo=/cart" className="btn-premium-outline px-12">CREATE ACCOUNT</Link>
                      </div>
                    </section>
                  ) : (
                    <div className="space-y-16">
                      <section>
                        <SectionTitle step={2}>Personal Information</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <PremiumInput label="Full Name" placeholder="John Doe" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                          <PremiumInput label="CPF / Document" placeholder="000.000.000-00" value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} error={!isCpfValid} maxLength={14} />
                          <PremiumInput label="Email Address" placeholder="email@example.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                          <PremiumInput label="Confirm Email" placeholder="email@example.com" value={formData.confirmEmail} onChange={e => handleInputChange('confirmEmail', e.target.value)} error={formData.confirmEmail.length > 0 && formData.email !== formData.confirmEmail} />
                        </div>
                      </section>

                      <section>
                        <SectionTitle step={3}>Shipping Address</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <PremiumInput label="Postal Code (CEP)" placeholder="00000-000" value={formData.cep} onChange={e => handleInputChange('cep', e.target.value)} maxLength={9} loading={loadingCep} />
                          <PremiumInput label="Street Address" placeholder="Address..." value={formData.address} onChange={e => handleInputChange('address', e.target.value)} loading={loadingCep} />
                          <PremiumInput label="Number" placeholder="123" value={formData.number} onChange={e => handleInputChange('number', e.target.value)} />
                          <PremiumInput label="Neighborhood" placeholder="Neighborhood" value={formData.neighborhood} onChange={e => handleInputChange('neighborhood', e.target.value)} loading={loadingCep} />
                          <PremiumInput label="City" placeholder="City" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} loading={loadingCep} />
                          <PremiumInput label="State (UF)" placeholder="SP" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} loading={loadingCep} />
                        </div>
                      </section>

                      <button
                        onClick={() => isFormValid() ? setCurrentStep(2) : fireToast('Form Incomplete', 'Please check all required fields.')}
                        className="w-full btn-premium py-6"
                      >
                        CONTINUE TO PAYMENT <ChevronRight size={18} className="ml-2" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16"
                >
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <SectionTitle step={4}>Secure Payment</SectionTitle>
                      <button onClick={() => setCurrentStep(1)} className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-widest">
                        Back to shipping
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-8 sm:p-12">
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white flex items-center justify-center text-black">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold uppercase italic">Manual Transfer / PIX</h4>
                          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mt-1">Instant Approval Gateway</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                          <div className="p-6 bg-black border border-white/5">
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] block mb-2">Recipient</span>
                            <p className="text-sm font-bold uppercase tracking-tight">LUCAS GOMES DO AMARAL</p>
                          </div>
                          <div className="p-6 bg-black border border-white/5">
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] block mb-2">Total Amount</span>
                            <p className="text-3xl font-bold">{formatCurrency(total * (1 - (couponInfo?.discount || 0) / 100))}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] block mb-4">PIX CODE</span>
                            <div className="relative">
                              <input
                                readOnly
                                value="00020101021126360014br.gov.bcb.pix0114+55119899400805204000053039865802BR5921LUCAS GOMES DO AMARAL6010INDAIATUBA62070503***63043504"
                                className="w-full bg-white/5 border border-white/10 px-5 py-4 pr-16 text-[10px] font-mono text-white/40 outline-none"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText("00020101021126360014br.gov.bcb.pix0114+55119899400805204000053039865802BR5921LUCAS GOMES DO AMARAL6010INDAIATUBA62070503***63043504");
                                  fireToast('Copiado!', 'Chave PIX copiada.');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 transition-all"
                              >
                                <Plus size={16} className="rotate-45" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/5">
                          <div className="p-4 bg-white mb-6">
                            <img src="/pix_qrcode.jpeg" alt="PIX QR" className="w-48 h-48" />
                          </div>
                          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] text-center">
                            Scan to pay instantly
                          </p>
                        </div>
                      </div>

                      <div className="mt-12 pt-12 border-t border-white/5">
                        <button
                          onClick={handleOrder}
                          disabled={loadingOrder || pixTimer > 0}
                          className={`w-full py-6 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.3em] transition-all ${
                            pixTimer > 0 
                              ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                              : 'bg-white text-black hover:bg-white/90'
                          }`}
                        >
                          {loadingOrder ? 'Processing...' : pixTimer > 0 ? `Validate Payment in ${pixTimer}s` : 'I have already paid — Place Order'}
                        </button>
                        {pixTimer > 0 && (
                          <div className="mt-4 h-1 bg-white/5 overflow-hidden">
                            <motion.div 
                              className="h-full bg-white"
                              initial={{ width: '0%' }}
                              animate={{ width: `${((10 - pixTimer) / 10) * 100}%` }}
                              transition={{ duration: 1, ease: 'linear' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4">
            <aside className="sticky top-32 space-y-8">
              <div className="bg-white/5 border border-white/5 p-8">
                <h3 className="text-lg font-bold uppercase italic mb-8">Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs text-white/40 font-mono">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/40">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-white' : 'text-white/60'}>
                      {shippingCost === null ? 'Calculated at checkout' : shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  {subtotal < 299 && (
                    <div className="pt-2">
                      <div className="flex justify-between text-[9px] font-mono text-white/20 mb-2 uppercase tracking-widest">
                        <span>Free shipping at {formatCurrency(299)}</span>
                        <span>{Math.round((subtotal / 299) * 100)}%</span>
                      </div>
                      <div className="h-0.5 bg-white/5 overflow-hidden">
                        <motion.div 
                          className="h-full bg-white/40"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: Math.min(subtotal / 299, 1) }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupon */}
                <div className="pt-6 border-t border-white/5 mb-8">
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] block mb-4">Promotional Code</span>
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value); setCouponInfo(null); setCouponError(false); }}
                      placeholder="ENTER CODE"
                      className="flex-1 bg-transparent border border-white/10 px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white transition-colors"
                    />
                    <button onClick={validateCoupon} className="px-6 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all">Apply</button>
                  </div>
                  {couponInfo && <p className="text-[9px] text-white/60 mt-3 font-mono">✓ {couponInfo.discount}% discount applied</p>}
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest">Total</span>
                    <div className="text-right">
                      {couponInfo && <p className="text-xs text-white/20 line-through font-mono mb-1">{formatCurrency(total)}</p>}
                      <p className="text-3xl font-bold tracking-tight">{formatCurrency(total * (1 - (couponInfo?.discount || 0) / 100))}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
                      <Truck size={14} /> Shipping from São Paulo
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
                      <CreditCard size={14} /> Secure Payment
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust badge */}
              <div className="p-6 bg-white/5 border border-white/5 text-center">
                <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Guaranteed quality · Bonds Agence</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
