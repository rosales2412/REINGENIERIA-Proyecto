import { Router } from 'express';
import { pool } from '../db.js';
export const router = Router();

router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'product not found' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { name, sku, price, stock, status } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name and price required' });
  try {
    const [r] = await pool.query('INSERT INTO products (name, sku, price, stock, status) VALUES (?, ?, ?, ?, ?)', [name, sku || null, price, stock ?? 0, status ?? 1]);
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, sku, price, stock, status } = req.body;
  try {
    await pool.query('UPDATE products SET name = COALESCE(?, name), sku = COALESCE(?, sku), price = COALESCE(?, price), stock = COALESCE(?, stock), status = COALESCE(?, status) WHERE id = ?', [name, sku, price, stock, status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'product not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  const [r] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'product not found' });
  res.json({ ok: true });
});
