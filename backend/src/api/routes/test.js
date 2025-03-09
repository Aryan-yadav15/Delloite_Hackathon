import express from 'express';
import parseOrder from '../../lib/parser.js';
import ordersRouter from './orders.js';  // Import the orders router
import supabase from '../../db/index.js';
import { createOrder } from '../../services/orderService.js';  // Create this service

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

// POST endpoint
router.post('/test', async (req, res) => {
    try {
        console.log('Query params in POST:', req.query);
        console.log('Body in POST:', req.body);

        const emailDetails = req.query.emailDetails || req.body.emailDetails;
        
        if (!emailDetails) {
            return res.status(400).json({
                error: 'No email details provided'
            });
        }

        console.log('Email details to parse:', emailDetails);

        // Parse email metadata
        const emailMetadata = parseEmailMetadata(emailDetails);
        console.log('Email metadata:', emailMetadata);

        // Parse order details
        const parsedOrder = parseOrder(emailDetails);
        console.log('Parsed order:', parsedOrder);

        // Construct final response
        const finalResponse = {
            emailMetadata: {
                subject: emailMetadata.subject,
                from: emailMetadata.from,
                to: emailMetadata.to,
                timestamp: new Date().toISOString()
            },
            orderDetails: {
                products: Object.entries(parsedOrder).reduce((acc, [key, value]) => {
                    if (key !== 'flag') {
                        acc[key] = value;
                    }
                    return acc;
                }, {}),
                specialRequest: parsedOrder.flag === 1
            },
            emailContent: emailDetails // Pass the full email body
        };

        console.log('Final response:', finalResponse);

        // Create order using service
        const result = await createOrder(finalResponse);
        console.log('Order creation result:', result);

        res.json({
            message: 'Order processed successfully',
            data: result,
            status: 'success'
        });

    } catch (error) {
        console.error('‼️ Full processing error:', error);
        res.status(500).json({
            error: 'Order processing pipeline failed',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

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