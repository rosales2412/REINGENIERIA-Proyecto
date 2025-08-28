import { Router } from 'express';
import { pool } from '../db.js';
export const router = Router();

// List
router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
  res.json(rows);
});

// One
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'user not found' });
  res.json(rows[0]);
});

// Create
router.post('/', async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  try {
    const [r] = await pool.query('INSERT INTO users (name, email, role) VALUES (?, ?, ?)', [name, email, role || 'cashier']);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    await pool.query('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?', [name, email, role, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const [r] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'user not found' });
  res.json({ ok: true });
});
