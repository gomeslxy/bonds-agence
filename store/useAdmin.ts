'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { type Order, type OrderStatus } from '@/lib/storage';
import { type Product } from '@/data/products';
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

  // ── UI ────────────────────────────────────────────────────
  activeTab:    'products' | 'orders';
  setTab:       (t: 'products' | 'orders') => void;
  editingProduct: Product | null;
  setEditing:   (p: Product | null) => void;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:        (pw: string) => boolean;
  logout:       () => void;
  refreshData:  () => Promise<void>;
  resetToDefault: () => Promise<void>;
  
  // ── Realtime ─────────────────────────────────────────────
  subscribe:    () => () => void;
}

export const useAdmin = create<AdminStore>((set, get) => ({
  products:       [],
  orders:         [],
  activeTab:      'products',
  editingProduct: null,
  isAuthenticated: typeof window !== 'undefined' ? localStorage.getItem('bonds_admin_auth') === 'true' : false,
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

  setTab:     (activeTab) => set({ activeTab }),
  setEditing: (editingProduct) => set({ editingProduct }),

  login: async (pw) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        set({ isAuthenticated: true });
        localStorage.setItem('bonds_admin_auth', 'true');
        return true;
      }
      
      if (data.error) alert(data.error);
      return false;
    } catch (error) {
      alert('Erro ao conectar com o servidor de segurança.');
      return false;
    }
  },
  logout: () => {
    set({ isAuthenticated: false });
    localStorage.removeItem('bonds_admin_auth');
  },

  refreshData: async () => {
    set({ isLoading: true });
    await Promise.all([get().loadProducts(), get().loadOrders()]);
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

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(orderChannel);
    };
  },
}));
