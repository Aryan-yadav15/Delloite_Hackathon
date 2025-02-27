import supabase from '../db/index.js';

export async function createOrder(orderData) {
    const { emailMetadata, orderDetails } = orderData;

    // Manufacturer lookup
    const { data: manufacturer, error: mError } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('email', emailMetadata.to)
        .single();

    if (mError || !manufacturer) {
        throw new Error(`Manufacturer lookup failed: ${mError?.message || 'Not found'}`);
    }

    // Retailer lookup
    const { data: retailer, error: rError } = await supabase
        .from('retailers')
        .select('id')
        .eq('email', emailMetadata.from)
        .single();

    if (rError || !retailer) {
        throw new Error(`Retailer lookup failed: ${rError?.message || 'Not found'}`);
    }

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            manufacturer_id: manufacturer.id,
            retailer_id: retailer.id,
            order_number: `ORD-${Date.now()}`,
            email_subject: emailMetadata.subject,
            email_body: JSON.stringify(orderData),
            email_received_at: new Date(emailMetadata.timestamp),
            processing_status: 'pending',
            email_parsed_data: orderData,
            created_at: new Date(),
            updated_at: new Date()
        })
        .select()
        .single();

    if (orderError) {
        throw new Error(`Order creation failed: ${orderError.message}`);
    }

    // Process order items
    const orderItemsPromises = Object.entries(orderDetails.products).map(async ([productName, quantity]) => {
        // Look up product by name for this manufacturer
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, price')
            .eq('manufacturer_id', manufacturer.id)
            .eq('name', productName)
            .single();

        if (productError || !product) {
            console.warn(`Product not found: ${productName}`);
            return null;
        }

        const qty = parseInt(quantity.replace(/\D/g, ''));
        return {
            order_id: order.id,
            product_id: product.id,
            quantity: qty,
            unit_price: product.price,
            total_price: product.price * qty,
            created_at: new Date()
        };
    });

    // Wait for all product lookups and create order items
    const orderItems = (await Promise.all(orderItemsPromises)).filter(Boolean);

    if (orderItems.length === 0) {
        throw new Error('No valid products found for order items');
    }

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        throw new Error(`Order items creation failed: ${itemsError.message}`);
    }

    // Update order total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + Number(item.total_price), 0);
    
    const { error: updateError } = await supabase
        .from('orders')
        .update({ total_amount: totalAmount })
        .eq('id', order.id);

    if (updateError) {
        console.error('Failed to update order total:', updateError);
    }

    return {
        orderId: order.id,
        itemsCount: orderItems.length,
        totalAmount
    };
} 