import { Router } from 'express';
import { pool } from '../db.js';
export const router = Router();

router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'customer not found' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const [r] = await pool.query('INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)', [name, phone || null, email || null, address || null]);
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    await pool.query('UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email), address = COALESCE(?, address) WHERE id = ?', [name, phone, email, address, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'customer not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  const [r] = await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'customer not found' });
  res.json({ ok: true });
});
