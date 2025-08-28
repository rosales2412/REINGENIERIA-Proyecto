import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import { router as usersRouter } from './routes/users.js';
import { router as customersRouter } from './routes/customers.js';
import { router as productsRouter } from './routes/products.js';
import { router as salesRouter } from './routes/sales.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'POS Practica API' });
});

app.use('/api/users', usersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);

// Not found
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API listening on port ' + PORT));
