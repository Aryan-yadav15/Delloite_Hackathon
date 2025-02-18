import express from 'express';
const router = express.Router();

// GET endpoint for testing
router.get('/test', (req, res) => {
    console.log('Received GET request with query params:', req.query);
    res.json({
        message: `We received your GET request with data: ${JSON.stringify(req.query)}`,
        status: 'success'
    });
});

// POST endpoint for testing
router.post('/test', (req, res) => {
    console.log('Received POST request with body:', req.body);
    res.json({
        message: `We received your POST request with data: ${JSON.stringify(req.body)}`,
        status: 'success'
    });
});

export default router; 