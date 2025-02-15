import express from 'express';
import supabase from '../../db/index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Register new manufacturer
router.post('/register', async (req, res) => {
    const { company_name, email, password } = req.body;
    try {
        const password_hash = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('manufacturers')
            .insert([
                { company_name, email, password_hash }
            ])
            .select('id, company_name, email')
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get manufacturer's retailers
router.get('/:id/retailers', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('retailers')
            .select('*')
            .eq('manufacturer_id', req.params.id)
            .order('business_name');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 