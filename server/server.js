// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './config/db.js';

import UsersRoutes from './routes/UsersRoutes.js'; 

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); 

  // Usar as rotas
app.use('/db/register', UsersRoutes);

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});