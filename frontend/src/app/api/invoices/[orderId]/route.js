import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    // Get data from request
    const { orderId, manufacturerId } = await request.json()
    
    if (!orderId || !manufacturerId) {
      return NextResponse.json(
        { error: 'Order ID and Manufacturer ID are required' }, 
        { status: 400 }
      )
    }

    // Fetch order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('manufacturer_id', manufacturerId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      )
    }

    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity, 
        unit_price,
        total_price,
        products (name, sku)
      `)
      .eq('order_id', orderId)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch order items' }, 
        { status: 500 }
      )
    }

    // Fetch retailer data
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', order.retailer_id)
      .single()

    if (retailerError || !retailer) {
      return NextResponse.json(
        { error: 'Retailer not found' }, 
        { status: 404 }
      )
    }

    // Fetch manufacturer data
    const { data: manufacturer, error: manufacturerError } = await supabase
      .from('manufacturers')
      .select('*')
      .eq('id', manufacturerId)
      .single()

    if (manufacturerError || !manufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer not found' }, 
        { status: 404 }
      )
    }

    // Format date
    const orderDate = new Date(order.created_at).toLocaleDateString();
    const generatedDate = new Date().toLocaleString();
    
    // Generate TEXT invoice
    const textInvoice = `
      INVOICE ${order.order_number}
      Date: ${orderDate}
      
      FROM: ${manufacturer.company_name}
      ${manufacturer.address || ''}
      ${manufacturer.email || ''}
      
      BILL TO: ${retailer.business_name}
      ${retailer.address || ''}
      ${retailer.email}
      
      ITEMS:
      ${orderItems.map(item => `
      - ${item.products?.name || 'Unknown Product'} (${item.products?.sku || 'N/A'})
        Qty: ${item.quantity} @ $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}
      `).join('')}
      
      TOTAL: $${order.total_amount.toFixed(2)}
      
      Generated on ${generatedDate}
    `;

    // Return the text as a downloadable file
    return new Response(textInvoice, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="invoice-${order.order_number}.txt"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate invoice', 
        message: error.message
      }, 
      { status: 500 }
    );
  }
} 