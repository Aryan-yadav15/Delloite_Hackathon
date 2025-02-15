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
    // Validate request body
    const validatedData = orderSchema.parse(req.body);

    // Find manufacturer and retailer by email
    const { data: manufacturer, error: mError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('email', validatedData.manufacturer_email)
      .single();

    if (mError) throw new Error('Manufacturer not found');

    const { data: retailer, error: rError } = await supabase
      .from('retailers')
      .select('id')
      .eq('email', validatedData.retailer_email)
      .single();

    if (rError) throw new Error('Retailer not found');

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_number: validatedData.order_number,
          order_date: validatedData.order_date,
          manufacturer_id: manufacturer.id,
          retailer_id: retailer.id,
          po_document_url: validatedData.po_document_url,
          additional_notes: validatedData.additional_notes,
          status: 'PENDING'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order products
    const orderProducts = validatedData.products.map(product => ({
      order_id: order.id,
      sku: product.sku,
      quantity: product.quantity,
      unit_price: product.unit_price,
      description: product.description
    }));

    const { error: productsError } = await supabase
      .from('order_products')
      .insert(orderProducts);

    if (productsError) throw productsError;

    // Fetch complete order with relationships
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        manufacturer:manufacturers (name, email),
        retailer:retailers (name, email),
        order_products (*)
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json(completeOrder);

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ error: error.message });
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

export default router; 