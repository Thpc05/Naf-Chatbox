import express from 'express';

import { updUser, getAllUsers, responderPergunta  } from '../controllers/UsersControle.js'; 

const router = express.Router();

router.post('/updUser', updUser);

router.get('/getAllUsers', getAllUsers);

router.post('/perguntar', responderPergunta);

export default router;
