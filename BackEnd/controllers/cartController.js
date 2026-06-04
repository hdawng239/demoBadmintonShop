const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');

const getMyCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.getByUserId(userId);
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }
        res.status(200).json(cart);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};
const createCart = async (req, res) => {
    try { res.status(201).json(await Cart.create(req.body.user_id)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

const clearCart = async (req, res) => {
    try { res.status(200).json(await Cart.clearCart(req.params.id)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

const addItemToCart = async (req, res) => {
    try { res.status(201).json(await CartItem.createOrUpdate(req.body)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

const updateItemQuantity = async (req, res) => {
    try { res.status(200).json(await CartItem.updateQuantity(req.params.id, req.body.quantity)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

const removeItem = async (req, res) => {
    try { res.status(200).json(await CartItem.delete(req.params.id)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getMyCart, createCart, clearCart, addItemToCart, updateItemQuantity, removeItem };