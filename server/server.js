// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { connectDB } from './config/db.js';

import RegisterRoutes from './routes/RegisterRoutes.js'; 

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '..', 'vite')));

  // Usar as rotas
app.use('/db/register', RegisterRoutes);

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});