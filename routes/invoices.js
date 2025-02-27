const express = require('express');
const Invoice = require('../models/Invoice');
const Product = require('../models/product');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, items } = req.body;
        let total = 0;
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            if (type === 'sale' && product.stock < item.quantity) {
                return res.status(400).json({ message: 'Not enough stock' });
            }
            total += product.price * item.quantity;
        }
        
        for (let item of items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: type === 'sale' ? -item.quantity : item.quantity } });
        }
        
        const invoice = new Invoice({ userId: req.user.userId, type, items, total });
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    const invoices = await Invoice.find({} , {__v:0}).populate('userId', 'name').populate('items.productId', 'name price stock');
    res.json(invoices);
});

module.exports = router;