import { Request, Response } from 'express';
import { mercadoPagoService } from '../../services/mercadopago.service';

interface PaymentRequest {
    title: string;
    price: number;
    quantity: number;
}

export const createPayment = async (req: Request<{}, {}, PaymentRequest>, res: Response): Promise<void> => {
    try {
        const { title, price, quantity } = req.body;

        // Validate required fields
        if (!title || !price || !quantity) {
            res.status(400).json({ 
                error: 'Missing required fields', 
                required: ['title', 'price', 'quantity'] 
            });
            return;
        }

        // Create payment preference
        const preference = await mercadoPagoService.createPreference({
            title,
            price: Number(price),
            quantity: Number(quantity)
        });

        res.json({
            success: true,
            preference
        });
    } catch (error) {
        console.error('Error in createPayment:', error);
        res.status(500).json({ error: 'Error creating payment' });
    }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, data } = req.query;
        
        // We're only interested in payment webhooks
        if (type === 'payment' && data && typeof data === 'object' && 'id' in data) {
            const paymentId = String(data.id);
            const paymentInfo = await mercadoPagoService.handleWebhook(paymentId);
            console.log('Payment Info:', paymentInfo);
            
            // Here you can handle different payment statuses
            // e.g., update your database, send confirmation emails, etc.
            if (paymentInfo.status === 'approved') {
                // Handle successful payment
                console.log('Payment approved');
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error in webhook:', error);
        res.sendStatus(500);
    }
};
