import { Router } from 'express';
import { createPayment, handleWebhook } from '../controllers/payment';

const router = Router();

// Payment routes
router.post('/create', createPayment.check, createPayment.do);
router.post('/webhook', handleWebhook);

export default router;
