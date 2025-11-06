import express from 'express';

import { updUser, getAllUsers } from '../controllers/UsersControle.js'; 

const router = express.Router();

router.post('/updUser', updUser);

router.get('/getAllUsers', getAllUsers);

export default router;
