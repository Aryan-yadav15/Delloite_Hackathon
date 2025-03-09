import express from 'express';
import supabase from '../../db/index.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const orderProductSchema = z.object({
  sku: z.string(),
  quantity: z.number().positive(),
  unit_price: z.number().optional(),
  description: z.string().optional()
});

const orderSchema = z.object({
  retailer_email: z.string().email(),
  manufacturer_email: z.string().email(),
  order_number: z.string(),
  order_date: z.string().datetime(),
  products: z.array(orderProductSchema),
  po_document_url: z.string().url().optional(),
  additional_notes: z.string().optional()
});

// Create new order
router.post('/', async (req, res) => {
  try {
    console.log('➡️ Received POST to /api/orders');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { emailMetadata, orderDetails } = req.body;
    
    if (!emailMetadata || !orderDetails) {
      console.error('❌ Missing required data:', { emailMetadata, orderDetails });
      return res.status(400).json({
        error: 'Invalid request structure - missing emailMetadata or orderDetails'
      });
    }

    console.log('📧 Email metadata:', emailMetadata);
    console.log('📦 Order details:', orderDetails);

    // Manufacturer lookup
    console.log(`🔍 Looking up manufacturer with email: ${emailMetadata.to}`);
    const { data: manufacturer, error: mError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('email', emailMetadata.to)
      .single();

    console.log('Manufacturer lookup result:', { manufacturer, mError });
    if (mError || !manufacturer) {
      console.error('❌ Manufacturer lookup failed:', mError || 'Not found');
      return res.status(400).json({
        error: `Manufacturer lookup failed: ${mError?.message || 'Not found'}`
      });
    }

    // Retailer lookup
    console.log(`🔍 Looking up retailer with email: ${emailMetadata.from}`);
    const { data: retailer, error: rError } = await supabase
      .from('retailers')
      .select('id')
      .eq('email', emailMetadata.from)
      .single();

    console.log('Retailer lookup result:', { retailer, rError });
    if (rError || !retailer) {
      throw new Error(`Retailer lookup failed: ${rError?.message || 'Not found'}`);
    }

    // Create order
    console.log('🛒 Creating order...');
    const orderPayload = {
      manufacturer_id: manufacturer.id,
      retailer_id: retailer.id,
      order_number: `ORD-${Date.now()}`,
      email_subject: emailMetadata.subject,
      email_body: JSON.stringify(req.body),
      email_received_at: new Date(emailMetadata.timestamp),
      processing_status: 'pending',
      email_parsed_data: req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Order payload:', orderPayload);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    console.log('Order creation result:', { order, orderError });
    if (orderError) {
      throw new Error(`Order creation failed: ${orderError.message}`);
    }

    // Create order items
    console.log('📦 Creating order items...');
    const orderItems = Object.entries(orderDetails.products).map(([productName, quantity]) => {
      const qty = parseInt(quantity.replace(/\D/g, ''));
      if (isNaN(qty)) {
        console.warn(`⚠️ Invalid quantity for ${productName}: ${quantity}`);
        return null;
      }
      
      return {
        order_id: order.id,
        product_name: productName,
        quantity: qty,
        created_at: new Date()
      };
    }).filter(Boolean);

    console.log('Order items payload:', orderItems);
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items error:', itemsError);
      throw new Error(`Partial failure: Order created but items failed (${itemsError.message})`);
    }

    console.log('✅ Order processed successfully');
    return res.status(200).json({
      success: true,
      orderId: order.id,
      itemsCount: orderItems.length
    });

  } catch (error) {
    console.error('‼️ Critical error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  const { processing_status, validation_errors } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        processing_status,
        validation_errors,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select(`
        id,
        order_number,
        processing_status,
        validation_errors
      `)
      .single();

    if (error) throw error;
    
    // If status is invalid, trigger error logging
    if (processing_status === 'invalid') {
      await supabase
        .from('processing_logs')
        .insert([{
          order_id: req.params.id,
          log_type: 'validation',
          message: 'Invalid order detected',
          details: validation_errors
        }]);
    }

    res.json(data);
  } catch (error) {
    res.status(400).json({ 
      error: `Status update failed: ${error.message}` 
    });
  }
});

// Get orders by manufacturer with filters
router.get('/manufacturer/:id', async (req, res) => {
  const { status, start_date, end_date } = req.query;
  
  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        email_subject,
        processing_status,
        created_at,
        retailers!inner(business_name)
      `)
      .eq('manufacturer_id', req.params.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('processing_status', status);
    if (start_date && end_date) {
      query = query
        .gte('created_at', start_date)
        .lte('created_at', end_date);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ 
      error: `Failed to fetch orders: ${error.message}` 
    });
  }
});

// GET single order with details
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        retailers (id, business_name, email),
        order_items (
          id, 
          quantity, 
          unit_price, 
          total_price,
          products (id, name, sku)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 