const express = require('express');
const Product = require('../models/product');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        const product = new Product({ name, price, stock });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

module.exports = router;
