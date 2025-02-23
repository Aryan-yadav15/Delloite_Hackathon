import express from 'express';
const router = express.Router();

// Helper function to parse email string
function parseEmailString(emailStr) {
    const subjectMatch = emailStr.match(/@#Subject -(.+?)@#/);
    const bodyMatch = emailStr.match(/@#Body-([^@#]+)@#From/s);
    const fromMatch = emailStr.match(/@#From -(.+)$/);

    console.log('Parsing matches:', {
        subject: subjectMatch ? subjectMatch[1] : 'no match',
        body: bodyMatch ? bodyMatch[1] : 'no match',
        from: fromMatch ? fromMatch[1] : 'no match'
    });

    return {
        subject: subjectMatch ? subjectMatch[1].trim() : '',
        body: bodyMatch ? bodyMatch[1].trim() : '',
        from: fromMatch ? fromMatch[1].trim() : '',
        timestamp: new Date().toISOString()
    };
}

// GET endpoint for testing
router.get('/test', (req, res) => {
    console.log('Received GET request with query params:', req.query);
    const parsedEmail = parseEmailString(req.query.emailDetails || '');
    res.json({
        message: 'Email parsed successfully',
        emailData: parsedEmail,
        status: 'success'
    });
});

// POST endpoint
router.post('/test', (req, res) => {
    console.log('Query params in POST:', req.query);
    console.log('Body in POST:', req.body);

    const emailDetails = req.query.emailDetails || req.body.emailDetails;
    const parsedEmail = parseEmailString(emailDetails || '');

    console.log(parsedEmail)
    res.json({
        message: 'Email parsed successfully',
        emailData: parsedEmail,
        status: 'success'
    });
});

export default router; 