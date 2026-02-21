// Database types for XpresaDashboard
// Ported from XpresaControl

export type OrderStatus = 'cotizado' | 'pendiente' | 'pagado' | 'enviado';

export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    updated_at: string;
}

export interface Order {
    id: string;
    temp_id: number;
    previo_number: number | null;
    vendedor_id: string;
    customer_name: string | null;
    customer_email: string | null;
    payment_account: string | null;
    anticipo: number;
    total_amount: number;
    status: OrderStatus;
    image_url: string | null;
    image_back_url: string | null;
    calcetas_color: string | null;
    regalo_detalle: string | null;
    shipping_guide: string | null;
    shipping_carrier: string | null;
    commission_earned: number;
    notes: string | null;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_name: string;
    size: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    account: string;
    vendedor_id: string;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price_1: number; // Price for small quantities
    price_2: number;
    price_3: number;
    price_4: number;
    price_5: number; // Price for large quantities (bulk)
    qty_1: number; // End of range 1 (e.g., 6)
    qty_2: number; // End of range 2 (e.g., 39)
    qty_3: number;
    qty_4: number;
    qty_5: number;
    unit: string; // pza, metro, kg, etc.
    image_url: string | null;
    category: string | null;
    created_at: string;
}

export interface BotKnowledge {
    id: string;
    key: string;
    question: string | null;
    content: string;
    category: 'general' | 'faq';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Database schema type for Supabase client
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'updated_at'>;
                Update: Partial<Profile>;
            };
            orders: {
                Row: Order;
                Insert: Omit<Order, 'id' | 'created_at' | 'temp_id'>;
                Update: Partial<Omit<Order, 'id' | 'created_at' | 'temp_id'>>;
            };
            order_items: {
                Row: OrderItem;
                Insert: Omit<OrderItem, 'id' | 'subtotal'>;
                Update: Partial<Omit<OrderItem, 'id' | 'subtotal'>>;
            };
            expenses: {
                Row: Expense;
                Insert: Omit<Expense, 'id' | 'created_at'>;
                Update: Partial<Omit<Expense, 'id' | 'created_at'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at'>;
                Update: Partial<Omit<Product, 'id' | 'created_at'>>;
            };
            bot_knowledge: {
                Row: BotKnowledge;
                Insert: Omit<BotKnowledge, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<BotKnowledge, 'id' | 'created_at' | 'updated_at'>>;
            };
            global_settings: {
                Row: { key: string; value: any; updated_at: string };
                Insert: { key: string; value: any; updated_at?: string };
                Update: { key?: string; value?: any; updated_at?: string };
            };
            bot_logs: {
                Row: {
                    id: string;
                    user_info: string | null;
                    platform: string | null;
                    question: string | null;
                    response: string | null;
                    confidence: number | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['bot_logs']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['bot_logs']['Row']>;
            };
        };
        Enums: {
            order_status: OrderStatus;
        };
    };
}
