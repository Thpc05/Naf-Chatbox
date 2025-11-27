// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// import bodyParser from 'body-parser'; // Não é necessário se usar express.json configurado

import { connectDB } from './config/db.js';
import UsersRoutes from './routes/UsersRoutes.js'; 

dotenv.config();
const app = express();

app.use(cors()); 

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Usar as rotas
app.use('/db/register', UsersRoutes);

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});