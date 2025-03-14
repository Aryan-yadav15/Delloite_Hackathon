import express from 'express';
import fetch from 'node-fetch';
import supabase from '../../db/index.js';

const router = express.Router();

// Helper function to parse email metadata
function parseEmailMetadata(emailStr) {
    const subjectMatch = emailStr.match(/@#Subject -(.+?)@#/);
    const fromMatch = emailStr.match(/@#From -(.+?)@#To/);
    const toMatch = emailStr.match(/@#To-(.+?)$/);

    return {
        subject: subjectMatch ? subjectMatch[1].trim() : '',
        from: fromMatch ? fromMatch[1].trim() : '',
        to: toMatch ? toMatch[1].trim() : ''
    };
}

// Function to use the new parser API instead of local parser
async function parseOrderWithAPI(emailText, products) {
  try {
    const productNames = products.map(product => product.name);
    
    const parserResponse = await fetch('https://email-parser-livid.vercel.app/api/parser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: productNames,
        text: emailText
      }),
    });

    if (!parserResponse.ok) {
      throw new Error(`Parser API responded with status: ${parserResponse.status}`);
    }

    return await parserResponse.json();
  } catch (error) {
    console.error('Error calling parser API:', error);
    throw error;
  }
}

// Helper function to extract email metadata with improved regex matching
function extractEmailMetadata(emailDetails) {
  const subjectMatch = emailDetails.match(/@#Subject -\s*(.*?)(?=\s*@#|$)/);
  const fromMatch = emailDetails.match(/@#From -\s*(.*?)(?=\s*@#|$)/);
  
  // Fixed regex for "To" field - it was missing the dash
  const toMatch = emailDetails.match(/@#To -\s*(.*?)(?=\s*@#|$)/);
  
  // Extract email address from the matching strings
  const extractEmail = (str) => {
    if (!str) return '';
    // Look for email pattern with angle brackets
    const emailMatch = str.match(/<([^>]+)>/);
    if (emailMatch) return emailMatch[1].trim();
    // If no brackets, assume the whole string might be an email
    return str.trim();
  };

  return {
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    from: fromMatch ? extractEmail(fromMatch[1]) : '',
    to: toMatch ? extractEmail(toMatch[1]) : ''
  };
}

// Helper function to process an order
async function processOrder(req, res) {
  try {
    console.log('Query params in POST:', req.query);
    console.log('Body in POST:', req.body);

    const { emailDetails } = req.body;
    console.log('Email details to parse:', emailDetails);

    // Extract email metadata with improved function
    const emailMetadata = extractEmailMetadata(emailDetails);
    console.log('Email metadata:', emailMetadata);

    // Confirm we have both emails before proceeding
    if (!emailMetadata.from || !emailMetadata.to) {
      throw new Error(`Missing email addresses. From: ${emailMetadata.from}, To: ${emailMetadata.to}`);
    }

    // Fetch products from Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price');
      
    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }
    
    const productNames = products.map(product => product.name);
    
    // Extract email body content
    let emailText = '';
    const bodyMatch = emailDetails.match(/@#Body-(.*?)(@#|$)/s);
    if (bodyMatch && bodyMatch[1]) {
      emailText = bodyMatch[1].trim();
    }

    // Call the parser API
    const parserResponse = await fetch('https://email-parser-livid.vercel.app/api/parser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: productNames,
        text: emailText
      }),
    });

    if (!parserResponse.ok) {
      throw new Error(`Parser API responded with status: ${parserResponse.status}`);
    }

    const parsedOrder = await parserResponse.json();
    console.log('Parsed order:', parsedOrder);

    // Always check both parser flag and special request
    const HF_API_URL = 'https://api-inference.huggingface.co/models/harshitme08/email-classifier-distilbert';
    const hfToken = process.env.HUGGINGFACE_TOKEN;  // Get from environment

    const hfResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: emailText })
    });

    const hfResult = await hfResponse.json();
    const hfClassification = hfResult[0];
    const specialRequestLabel = hfClassification.find(item => item.label === 'LABEL_1');
    const normalRequestLabel = hfClassification.find(item => item.label === 'LABEL_0');

    // Store both results
    const specialRequest = specialRequestLabel.score > normalRequestLabel.score;
    const specialRequestConfidence = specialRequest ? specialRequestLabel.score : normalRequestLabel.score;
    const parserFlag = parsedOrder.flag || 0; // From parser API

    // Continue with order creation logic
    const emailContent = emailDetails;

    // Create final response structure
    const finalResponse = {
      emailMetadata: {
        ...emailMetadata,
        timestamp: new Date().toISOString(),
      },
      orderDetails: {
        products: { ...parsedOrder },
        specialRequest,
      },
      emailContent,
    };

    // Remove the flag property from the products object
    delete finalResponse.orderDetails.products.flag;

    // Add direct email parsing for quantities if API returns "unknown quantity"
    // This is a fallback mechanism when the API parser fails
    const directParsedQuantities = {};
    const quantityLines = emailText.split('\n').filter(line => line.trim() !== '');
    
    quantityLines.forEach(line => {
      const match = line.match(/^(.+?)\s*-\s*(\d+)\s*units/i);
      if (match) {
        const productName = match[1].trim();
        const quantity = parseInt(match[2], 10);
        directParsedQuantities[productName] = `${quantity} units`;
      }
    });
    
    console.log('Direct parsed quantities:', directParsedQuantities);

    // Replace "unknown quantity" with directly parsed quantities
    Object.keys(finalResponse.orderDetails.products).forEach(productName => {
      if (finalResponse.orderDetails.products[productName] === 'unknown quantity' && 
          directParsedQuantities[productName]) {
        finalResponse.orderDetails.products[productName] = directParsedQuantities[productName];
      }
    });

    console.log('Final response with fixed quantities:', finalResponse);

    // Look up retailer by email
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('id')
      .eq('email', emailMetadata.from)
      .single();
      
    if (retailerError || !retailer) {
      throw new Error(`Retailer not found: ${retailerError?.message || 'No retailer with email ' + emailMetadata.from}`);
    }
    
    // Look up manufacturer by email
    const { data: manufacturer, error: manufacturerError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('email', emailMetadata.to)
      .single();
      
    if (manufacturerError || !manufacturer) {
      throw new Error(`Manufacturer not found: ${manufacturerError?.message || 'No manufacturer with email ' + emailMetadata.to}`);
    }

    // Process order items and calculate total
    const processedProducts = new Set();
    const productEntries = Object.entries(finalResponse.orderDetails.products);
    const orderItems = [];
    let totalAmount = 0;

    for (const [productName, quantityStr] of productEntries) {
      // Skip if we've already processed this product
      if (processedProducts.has(productName)) {
        console.log(`Skipping duplicate product: ${productName}`);
        continue;
      }
      
      // Mark this product as processed
      processedProducts.add(productName);
      
      // Find product in the products array
      const product = products.find(p => p.name === productName);

      if (product) {
        console.log(`Debug - Product matched: "${productName}" (ID: ${product.id}, Price: ${product.price})`);
        // Parse quantity - extract just the number
        const quantity = parseInt(quantityStr.split(' ')[0], 10);
        const subtotal = product.price * quantity;
        totalAmount += subtotal;

        // Create a clean order item object
        orderItems.push({
          product_id: product.id,
          quantity,
          unit_price: product.price,
          total_price: subtotal
        });
      } else {
        console.log(`Warning: Product not found in database: "${productName}"`);
      }
    }

    // Generate a random order number
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the order in Supabase with ALL required fields
    const orderPayload = {
      order_number: orderNumber,
      retailer_id: retailer.id,
      manufacturer_id: manufacturer.id,
      total_amount: totalAmount,
      has_special_request: specialRequest,
      special_request_confidence: specialRequestConfidence,
      parser_flag: parserFlag,
      processing_status: 'pending',
      email_subject: emailMetadata.subject,
      email_body: emailContent,
      email_received_at: new Date().toISOString(),
      email_parsed_data: finalResponse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items in Supabase
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    const orderResult = {
      orderId: order.id,
      orderNumber,
      itemsCount: orderItems.length,
      totalAmount,
      hasSpecialRequest: specialRequest,
    };

    console.log('Order creation result:', orderResult);
    res.status(201).json(orderResult);
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ error: error.message });
  }
}

// POST endpoint at root path (for /api)
router.post('/', processOrder);

// Add a new route for /test path (for /api/test)
router.post('/test', processOrder);

// Add this new route
router.get('/db-check', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('id')
            .limit(1);

        if (error) throw error;
        
        res.json({
            success: true,
            connection: 'Database operational',
            results: data.length
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// Add this route to test Supabase connection
router.get('/supabase-test', async (req, res) => {
    try {
        console.log('Testing Supabase connection...');
        
        // Test manufacturer table access
        const { data: mData, error: mError } = await supabase
            .from('manufacturers')
            .select('id, email')
            .limit(1);
            
        console.log('Manufacturer test:', { data: mData, error: mError });

        // Test retailer table access
        const { data: rData, error: rError } = await supabase
            .from('retailers')
            .select('id, email')
            .limit(1);
            
        console.log('Retailer test:', { data: rData, error: rError });

        res.json({
            success: true,
            manufacturerTest: { data: mData, error: mError },
            retailerTest: { data: rData, error: rError }
        });
    } catch (error) {
        console.error('Supabase test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router; 