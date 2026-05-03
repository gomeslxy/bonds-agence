import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { type Order, type OrderStatus } from '@/lib/types';
import { fireToast } from '@/components/ToastVFX';
import { type Product } from '@/data/products';

interface AdminStore {
  // ── Products ──────────────────────────────────────────────
  products:       Product[];
  loadProducts:   () => Promise<void>;
  saveProduct:    (p: Product) => Promise<void>;
  removeProduct:  (id: string) => Promise<void>;
  setProducts:    (products: Product[]) => void;

  
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
  isLoading:       boolean;
  refreshData:  () => Promise<void>;
  
  // ── Realtime ─────────────────────────────────────────────
  subscribe:         () => () => void;
  subscribeProducts: () => () => void; // lightweight, for public product pages
}

export const useAdmin = create<AdminStore>((set, get) => ({
  products:       [],
  orders:         [],
  coupons:        [],
  activeTab:      'products',
  editingProduct: null,
  isLoading:       false,

  setProducts: (products) => set({ products }),

  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_stock(size, quantity)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Load Products Error:', error);
        fireToast('Erro', 'Falha ao carregar produtos', 'error');
        return;
      }

      if (data) {
        const mappedProducts = (data as any[]).map(p => ({
          ...p,
          price: Number(p.price || 0),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          colors: (p.colors || []).map((c: any) => {
            if (typeof c !== 'string') return c;
            const [name, hex] = c.split('|');
            return { name: name || 'Padrão', hex: hex || '#000000' };
          }),
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          features: Array.isArray(p.features) ? p.features : [],
          images: Array.isArray(p.images) ? p.images : [],
          subtitle: p.subtitle || '',
          stock: Number(p.stock || 0),
          sizeStock: p.product_stock || [],
        })) as Product[];
        
        set({ products: mappedProducts });
      }
    } catch (err) {
      console.error('Load Products Exception:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  loadOrders: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Load Orders Error:', error);
        return;
      }

      if (data) {
        const mappedOrders = (data as any[]).map(o => {
          const total = Number(o.total_price || 0);
          const discount = Number(o.discount_amount || 0);
          const orderItems = Array.isArray(o.items) ? o.items : [];
          
          const itemsSubtotal = orderItems.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
          let shipping = total - itemsSubtotal + discount;
          if (shipping < 0.01) shipping = 0;

          return {
            id: o.id,
            createdAt: o.created_at,
            status: (o.status || 'Pendente') as OrderStatus,
            customer: {
              name: o.customer_name || 'Cliente',
              email: o.customer_email || '',
              cpf: o.customer_cpf || '',
              cep: o.cep || '',
              address: o.address || '',
              number: o.number || '',
              complement: o.complement || '',
              neighborhood: o.neighborhood || '',
              city: o.city || '',
              state: o.state || '',
            },
            items: orderItems,
            total: total,
            subtotal: itemsSubtotal,
            shipping: shipping,
            discountAmount: discount,
            couponCode: o.coupon_code,
            payMethod: 'pix',
          };
        }) as Order[];
        
        set({ orders: mappedOrders });
      }
    } catch (err) {
      console.error('Load Orders Exception:', err);
    }
  },

  saveProduct: async (p) => {
    const { id, ...rest } = p;
    const dbProduct = {
      name:           rest.name,
      description:    rest.description,
      price:          rest.price,
      original_price: rest.originalPrice,
      image:          rest.image,
      category:       rest.category,
      sizes:          rest.sizes,
      colors:         rest.colors.map(c => `${c.name}|${c.hex}`), 
      stock:          rest.stock,
      images:         rest.images || [],
      subtitle:       rest.subtitle,
      features:       rest.features,
    } as any;

    let error;
    if (!id || id.startsWith('temp-')) {
      const { error: err } = await supabase.from('products').insert([dbProduct]);
      error = err;
    } else {
      const { error: err } = await supabase.from('products').update(dbProduct).eq('id', id);
      error = err;
    }

    if (error) {
      console.error('Supabase Save Error:', error);
      fireToast('Erro', `Não foi possível salvar o produto: ${error.message}`, 'error');
    } else {
      // If we have an ID (existing or newly created), save size stock
      const productId = id && !id.startsWith('temp-') ? id : (await supabase.from('products').select('id').eq('name', rest.name).order('created_at', { ascending: false }).limit(1).single()).data?.id;

      if (productId && rest.sizeStock) {
        // Upsert size stock
        for (const item of rest.sizeStock) {
          await supabase.from('product_stock').upsert({
            product_id: productId,
            size: item.size,
            quantity: item.quantity
          }, { onConflict: 'product_id,size' });
        }
      }

      fireToast('Sucesso', 'Produto salvo com sucesso.', 'success');
      get().loadProducts();
      set({ editingProduct: null });
    }
  },

  removeProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      fireToast('Sucesso', 'Produto removido.');
      get().loadProducts();
    }
  },

  changeStatus: async (orderId, status) => {
    try {
      const res = await fetch('/api/admin/order/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar status');

      fireToast('Sucesso', `Status atualizado para: ${status}`);
      get().loadOrders();
    } catch (err: any) {
      console.error(err);
      fireToast('Erro', err.message, 'error');
    }
  },

  loadCoupons: async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data && !error) set({ coupons: data });
  },

  saveCoupon: async (c: any) => {
    let error;
    try {
      if (c.id) {
        const { error: err } = await supabase.from('coupons').update(c).eq('id', c.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('coupons').insert([c]);
        error = err;
      }

      if (error) {
        console.error('Coupon Save Error:', error);
        fireToast('Erro', `Não foi possível salvar o cupom: ${error.message}`, 'error');
      } else {
        fireToast('Sucesso', 'Cupom salvo com sucesso.', 'success');
        get().loadCoupons();
      }
    } catch (err: any) {
      console.error('Coupon Exception:', err);
      fireToast('Erro', 'Ocorreu um erro inesperado ao salvar o cupom.', 'error');
    }
  },

  removeCoupon: async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      fireToast('Sucesso', 'Cupom removido.');
      get().loadCoupons();
    }
  },

  setTab:     (activeTab) => set({ activeTab }),
  setEditing: (editingProduct) => set({ editingProduct }),

  refreshData: async () => {
    set({ isLoading: true });
    await Promise.all([get().loadProducts(), get().loadOrders(), get().loadCoupons()]);
    set({ isLoading: false });
  },

  // Full realtime for admin panel (products + orders + coupons)
  subscribe: () => {
    const productChannel = supabase
      .channel('admin:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => get().loadProducts())
      .subscribe();
    const orderChannel = supabase
      .channel('admin:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => get().loadOrders())
      .subscribe();
    const couponChannel = supabase
      .channel('admin:coupons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => get().loadCoupons())
      .subscribe();
    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(couponChannel);
    };
  },

  // Lightweight realtime for public product pages (products only)
  subscribeProducts: () => {
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => get().loadProducts())
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
}));
