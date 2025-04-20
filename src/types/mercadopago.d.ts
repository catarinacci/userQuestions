declare module 'mercadopago' {
    interface MercadoPagoConfig {
        access_token: string;
    }

    interface PreferenceItem {
        id: string;
        title: string;
        unit_price: number;
        quantity: number;
        currency_id: string;
    }

    interface PreferenceBackUrls {
        success: string;
        failure: string;
        pending: string;
    }

    interface PreferenceData {
        items: PreferenceItem[];
        back_urls: PreferenceBackUrls;
        auto_return: string;
        binary_mode: boolean;
        notification_url: string;
    }

    interface PreferenceResponse {
        body: {
            id: string;
            init_point: string;
            sandbox_init_point: string;
        };
    }

    interface PaymentResponse {
        body: {
            id: number;
            status: string;
            status_detail: string;
            transaction_amount: number;
            payment_method_id: string;
            payment_type_id: string;
            external_reference: string;
        };
    }

    interface MercadoPagoStatic {
        configure(config: MercadoPagoConfig): void;
        preferences: {
            create(data: PreferenceData): Promise<PreferenceResponse>;
        };
        payment: {
            findById(id: number): Promise<PaymentResponse>;
        };
    }

    const mercadopago: MercadoPagoStatic;
    export default mercadopago;
}
