import mercadopago from 'mercadopago';

interface CreatePreferenceOptions {
    title: string;
    price: number;
    quantity: number;
}

class MercadoPagoService {
    constructor() {
        mercadopago.configure({
            access_token: process.env.MP_ACCESS_TOKEN || ''
        });
    }

    async createPreference({ title, price, quantity }: CreatePreferenceOptions) {
        try {
            const preferenceData = {
                items: [
                    {
                        id: '1',
                        title,
                        unit_price: price,
                        quantity,
                        currency_id: 'ARS'
                    }
                ],
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/payment/success`,
                    failure: `${process.env.FRONTEND_URL}/payment/failure`,
                    pending: `${process.env.FRONTEND_URL}/payment/pending`
                },
                auto_return: "approved",
                binary_mode: true,
                notification_url: `${process.env.FRONTEND_URL}/api/payments/webhook`
            };

            const { body } = await mercadopago.preferences.create(preferenceData);
            
            return {
                id: body.id,
                init_point: body.init_point,
                sandbox_init_point: body.sandbox_init_point
            };
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    async handleWebhook(paymentId: string) {
        try {
            const { body } = await mercadopago.payment.findById(Number(paymentId));
            return body;
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }
}

export const mercadoPagoService = new MercadoPagoService();
