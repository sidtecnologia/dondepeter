import { createClient } from '@supabase/supabase-js';


export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Estas variables deben ser configuradas en el entorno de tu servidor (e.g., Vercel)
  const supabaseUrl = process.env.SB_URL;
  // CRÍTICO: Usar la clave de "Service Role" (Admin) para actualizar stock de forma segura
  const supabaseServiceRoleKey = process.env.SB_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(500).json({ error: 'Error de configuración del servidor. Faltan claves privadas.' });
  }

  try {
    // Inicializa Supabase con la Service Role Key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
    
    const { orderDetails, products: currentProducts } = req.body;

    if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
      return res.status(400).json({ error: 'Datos de la orden inválidos o vacíos.' });
    }

    // 1. Validar y actualizar stock de forma segura
    const updates = orderDetails.items.map(item => {
        const product = currentProducts.find(p => p.id === item.id);

        if (!product) {
            throw new Error(`Producto con ID ${item.id} no encontrado.`);
        }
        
        if (product.stock < item.qty) {
            throw new Error(`No hay suficiente stock para ${product.name}. Stock disponible: ${product.stock}`);
        }

        const newStock = product.stock - item.qty;

        // Actualizar el stock
        return supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.id)
            .select(); 
    });

    const updateResults = await Promise.all(updates);

    for (const result of updateResults) {
        if (result.error) {
            throw new Error('Error al actualizar el stock: ' + result.error.message);
        }
    }

    
    res.status(200).json({ success: true, message: 'Orden procesada con éxito.' });
  } catch (error) {
    console.error('Error al procesar la orden:', error.message);
    res.status(500).json({ error: error.message });
  }
};