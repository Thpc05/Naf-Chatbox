// server/server.js
import express from 'express';
import dotenv from 'dotenv';

import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { connectDB } from './config/db.js';

dotenv.config();
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '..', 'Front')));
  
connectDB();


app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});