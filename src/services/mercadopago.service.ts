import mercadopago from 'mercadopago';
import { ExternalServiceError } from '../middlewares/errorHandler';

interface CreatePreferenceOptions {
    title: string;
    price: number;
    quantity: number;
}

class MercadoPagoService {
    constructor() {
        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            throw new ExternalServiceError('MercadoPago', 'Token de acceso no configurado');
        }
        mercadopago.configure({
            access_token: accessToken
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
            console.log("Preference data",preferenceData)
            const { body } = await mercadopago.preferences.create(preferenceData);
            if (!body || !body.id) {
                throw new ExternalServiceError('MercadoPago', 'Error al crear la preferencia de pago');
            }
            
            return {
                id: body.id,
                init_point: body.init_point,
                sandbox_init_point: body.sandbox_init_point
            };
        } catch (error) {
            console.error('Error creating payment:', error);
            throw new ExternalServiceError(
                'MercadoPago',
                error instanceof Error ? error.message : 'Error al crear el pago'
            );
        }
    }

    async handleWebhook(paymentId: string) {
        try {
            if (!paymentId) {
                throw new ExternalServiceError('MercadoPago', 'ID de pago no proporcionado');
            }
            const { body } = await mercadopago.payment.findById(Number(paymentId));
            if (!body) {
                throw new ExternalServiceError('MercadoPago', 'No se encontró información del pago');
            }
            return body;
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw new ExternalServiceError(
                'MercadoPago',
                error instanceof Error ? error.message : 'Error al procesar el webhook'
            );
        }
    }
}

export const mercadoPagoService = new MercadoPagoService();
