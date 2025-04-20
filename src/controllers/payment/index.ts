import { Request, Response, NextFunction } from "express";
import { mercadoPagoService } from "../../services/mercadopago.service";
import * as Joi from "joi";
import { validateBody } from "../../helpers/validateBody";
import {
  ExternalServiceError,
  ValidationError,
} from "../../middlewares/errorHandler";

interface PaymentRequest {
  title: string;
  price: number;
  quantity: number;
}

export const createPayment = {
  check: async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      price: Joi.number().positive().required(),
      quantity: Joi.number().positive().required(),
    });

    validateBody(req, next, res, schema);
  },
  do: async (
    req: Request<{}, {}, PaymentRequest>,
    res: Response
  ): Promise<void> => {
    try {
      const { title, price, quantity } = req.body;

      // Create payment preference
      const preference = await mercadoPagoService.createPreference({
        title,
        price: Number(price),
        quantity: Number(quantity),
      });

      res.json({
        success: true,
        preference,
      });
    } catch (error) {
      console.error("Error in createPayment:", error);
      throw new ExternalServiceError(
        "MercadoPago",
        error instanceof Error ? error.message : "Error desconocido"
      );
      //res.status(500).json({ error: "Error creating payment" });
    }
  },
};

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, data } = req.body;
    console.log("handlewebhook", "type", { type }, "data", { data });
    // We're only interested in payment webhooks
    if (
      type === "payment" &&
      data &&
      typeof data === "object" &&
      "id" in data
    ) {
      const paymentId = String(data.id);
      const paymentInfo = await mercadoPagoService.handleWebhook(paymentId);
      console.log("Payment Info:", paymentInfo);

      // Here you can handle different payment statuses
      // e.g., update your database, send confirmation emails, etc.
      if (paymentInfo.status === "approved") {
        // Handle successful payment
        console.log("Payment approved");
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error in webhook:", error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ExternalServiceError(
      "MercadoPago Webhook",
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
};
