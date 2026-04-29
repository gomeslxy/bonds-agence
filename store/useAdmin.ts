'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { type Order, type OrderStatus } from '@/lib/storage';
import { fireToast } from '@/components/ToastVFX';
import { type Product } from '@/data/products';

const supabase = createClient();
import { siteConfig } from '@/config/siteConfig';

interface AdminStore {
  // ── Products ──────────────────────────────────────────────
  products:       Product[];
  loadProducts:   () => Promise<void>;
  saveProduct:    (p: Product) => Promise<void>;
  removeProduct:  (id: string) => Promise<void>;
  
  // ── Orders ────────────────────────────────────────────────
  orders:        Order[];
  loadOrders:    () => Promise<void>;
  changeStatus:  (id: string, status: OrderStatus) => Promise<void>;

  // ── Coupons ───────────────────────────────────────────────
  coupons:       any[];
  loadCoupons:   () => Promise<void>;
  saveCoupon:    (c: any) => Promise<void>;
  removeCoupon:  (id: string) => Promise<void>;

  // ── UI ────────────────────────────────────────────────────
  activeTab:    'products' | 'orders' | 'coupons';
  setTab:       (t: 'products' | 'orders' | 'coupons') => void;
  editingProduct: Product | null;
  setEditing:   (p: Product | null) => void;
  isAuthenticated: boolean;
  isLoading:       boolean;
  refreshData:  () => Promise<void>;
  resetToDefault: () => Promise<void>;
  
  // ── Realtime ─────────────────────────────────────────────
  subscribe:    () => () => void;
}

export const useAdmin = create<AdminStore>((set, get) => ({
  products:       [],
  orders:         [],
  coupons:        [],
  activeTab:      'products',
  editingProduct: null,
  isAuthenticated: false,
  isLoading:       false,

  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        const mappedProducts = (data as any[]).map(p => ({
          ...p,
          colors: (p.colors || []).map((c: string) => {
            const [name, hex] = c.split('|');
            return { name: name || 'Padrão', hex: hex || '#000000' };
          }),
          sizes: p.sizes || [],
          features: p.features || [],
          subtitle: p.subtitle || '',
          stock: p.stock || 0,
        })) as Product[];
        
        set({ products: mappedProducts });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  loadOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      // Map Supabase fields to local Order interface if needed
      // Here we assume the DB fields match our Order interface (mostly)
      // We might need to map snake_case to camelCase
      const mappedOrders = (data as any[]).map(o => ({
        id: o.id,
        createdAt: o.created_at,
        status: o.status as OrderStatus,
        customer: {
          name: o.customer_name,
          email: o.customer_email,
          cpf: o.customer_cpf,
          cep: o.cep,
          address: o.address,
          number: o.number,
          complement: o.complement,
          neighborhood: o.neighborhood,
          city: o.city,
          state: o.state,
        },
        items: o.items,
        total: o.total_price,
        subtotal: o.total_price, // Simplifying for now
        shipping: 0,
        payMethod: 'pix', // Defaulting for display
      })) as Order[];
      
      set({ orders: mappedOrders });
    }
  },

  saveProduct: async (p) => {
    const { id, ...rest } = p;
    
    // Map frontend fields to DB columns (snake_case and filtering)
    const dbProduct = {
      name:           rest.name,
      description:    rest.description,
      price:          rest.price,
      image:          rest.image,
      category:       rest.category,
      sizes:          rest.sizes,
      // Mapping complex colors to TEXT[] if that's what the DB has
      // but let's try to send them as JSON if we can, or just names
      colors:         rest.colors.map(c => `${c.name}|${c.hex}`), 
      // These might fail if columns don't exist, so we'll check schema or just send basic ones
    } as any;

    // Optional fields (only send if they exist in DB)
    // For now, let's stick to what's in supabase_setup.sql to be safe
    /*
    if (rest.subtitle) dbProduct.subtitle = rest.subtitle;
    if (rest.tag) dbProduct.tag = rest.tag;
    */

    let error;
    
    if (!id || id.startsWith('temp-')) {
      // Insert new - don't send the temp ID
      const { error: err } = await supabase.from('products').insert([dbProduct]);
      error = err;
    } else {
      // Update existing
      const { error: err } = await supabase.from('products').update(dbProduct).eq('id', id);
      error = err;
    }

    if (error) {
      console.error('Supabase Save Error:', error);
      alert('Erro ao salvar no banco: ' + error.message);
    } else {
      get().loadProducts();
      set({ editingProduct: null });
    }
  },

  removeProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      get().loadProducts();
    }
  },

  changeStatus: async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      get().loadOrders();
    }
  },

  // ── Coupons ───────────────────────────────────────────────
  loadCoupons: async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data && !error) set({ coupons: data });
  },

  saveCoupon: async (c: any) => {
    let error;
    if (c.id) {
      const { error: err } = await supabase.from('coupons').update(c).eq('id', c.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('coupons').insert([c]);
      error = err;
    }
    if (!error) {
      fireToast('Sucesso', 'Cupom salvo com sucesso.');
      get().loadCoupons();
    } else {
      console.error('Erro ao salvar cupom:', error);
      fireToast('Erro', 'Não foi possível salvar o cupom. Verifique se a tabela existe.');
    }
  },

  removeCoupon: async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      fireToast('Sucesso', 'Cupom removido.');
      get().loadCoupons();
    } else {
      fireToast('Erro', 'Não foi possível remover o cupom.');
    }
  },

  setTab:     (activeTab) => set({ activeTab }),
  setEditing: (editingProduct) => set({ editingProduct }),

  refreshData: async () => {
    set({ isLoading: true });
    await Promise.all([get().loadProducts(), get().loadOrders(), get().loadCoupons()]);
    set({ isLoading: false });
  },

  resetToDefault: async () => {
    // For now, just re-fetch everything as a "soft reset"
    await get().refreshData();
  },

  subscribe: () => {
    const productChannel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        get().loadProducts();
      })
      .subscribe();

    const orderChannel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        get().loadOrders();
      })
      .subscribe();

    const couponChannel = supabase
      .channel('public:coupons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => {
        get().loadCoupons();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(couponChannel);
    };
  },
}));
