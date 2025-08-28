import { Router } from 'express';
import { pool } from '../db.js';
export const router = Router();

// List sales
router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT s.*, c.name as customer_name FROM sales s LEFT JOIN customers c ON c.id = s.customer_id ORDER BY s.id DESC');
  res.json(rows);
});

// Sale detail
router.get('/:id', async (req, res) => {
  const [sales] = await pool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
  if (!sales.length) return res.status(404).json({ error: 'sale not found' });
  const [items] = await pool.query('SELECT si.*, p.name as product_name FROM sale_items si LEFT JOIN products p ON p.id = si.product_id WHERE sale_id = ?', [req.params.id]);
  res.json({ ...sales[0], items });
});

// Create sale (reduces stock)
router.post('/', async (req, res) => {
  const { customer_id, items } = req.body; // items: [{product_id, qty, price?}]
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Verify products and stock
    let total = 0;
    for (const it of items) {
      const [rows] = await conn.query('SELECT id, price, stock FROM products WHERE id = ? FOR UPDATE', [it.product_id]);
      if (!rows.length) throw new Error(`Product ${it.product_id} not found`);
      const prod = rows[0];
      const price = it.price != null ? it.price : prod.price;
      if (it.qty > prod.stock) throw new Error(`Insufficient stock for product ${it.product_id}`);
      total += price * it.qty;
    }
    // Insert sale
    const [r] = await conn.query('INSERT INTO sales (customer_id, total) VALUES (?, ?)', [customer_id || null, total]);
    const saleId = r.insertId;
    // Insert items & update stock
    for (const it of items) {
      const [rows] = await conn.query('SELECT price, stock FROM products WHERE id = ? FOR UPDATE', [it.product_id]);
      const current = rows[0];
      const price = it.price != null ? it.price : current.price;
      await conn.query('INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (?, ?, ?, ?, ?)', [saleId, it.product_id, it.qty, price, price * it.qty]);
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [it.qty, it.product_id]);
    }
    await conn.commit();
    const [sale] = await pool.query('SELECT * FROM sales WHERE id = ?', [saleId]);
    res.status(201).json(sale[0]);
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Delete sale (optional): does NOT restock (simple practice)
router.delete('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM sale_items WHERE sale_id = ?', [req.params.id]);
    const [r] = await conn.query('DELETE FROM sales WHERE id = ?', [req.params.id]);
    await conn.commit();
    if (!r.affectedRows) return res.status(404).json({ error: 'sale not found' });
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});
