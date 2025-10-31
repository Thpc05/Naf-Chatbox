import express from 'express';

import { updChatRegister } from '../controllers/RegisterControle.js'; 

const router = express.Router();

router.post('/updChatRegister', updChatRegister);

export default router;
