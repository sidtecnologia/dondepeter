import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const initSupabase = async () => {
  if (supabaseInstance) return supabaseInstance;

  try {
    const response = await fetch('/api/get-config');
    if (!response.ok) throw new Error('Error fetching config');
    
    const config = await response.json();
    if (!config.url || !config.anonKey) throw new Error('Missing credentials');

    supabaseInstance = createClient(config.url, config.anonKey);
    return supabaseInstance;
  } catch (error) {
    console.error('API Initialization Error:', error);
    throw error;
  }
};

export const getProducts = async () => {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};

export const placeOrderAPI = async (orderDetails, products) => {
  const response = await fetch('/api/place-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderDetails, products })
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error procesando la orden');
  }
  return await response.json();
};

export const saveOrderToDB = async (orderData) => {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('orders').insert([orderData]).select();
  if (error) throw error;
  return data;
};