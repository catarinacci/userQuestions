import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

// Interfaz base para errores de la aplicación
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any[];
}

// Clase base para errores personalizados
export class BaseError extends Error implements AppError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error para recursos no encontrados
export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

// Error para validación
export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
   // this.errors = errors;
  }
}

// Error para operaciones no autorizadas
export class UnauthorizedError extends BaseError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Error para problemas con la base de datos
export class DatabaseError extends BaseError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR');
  }
}

// Error para problemas con servicios externos
export class ExternalServiceError extends BaseError {
  constructor(service: string, message: string) {
    super(`Error en ${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

export const errorHandler: ErrorRequestHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error Handler:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Errores personalizados de la aplicación
  if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  // Errores de MongoDB
  if (error instanceof MongoError) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_KEY',
          message: 'Ya existe un registro con estos datos',
        }
      });
    }
  }

  // Errores de Mongoose
  if (error instanceof MongooseError.ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      }
    });
  }

  // Errores de Mongoose CastError (IDs inválidos)
  if (error instanceof MongooseError.CastError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `ID inválido para ${error.path}`,
      }
    });
  }

  // Error por defecto para errores no manejados
 if(!res.headersSent){
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor'
    }
  });
 }
};



// export const errorHandler: ErrorRequestHandler = (
//   error: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//     console.log("middleware",error.name, error.message)

//     if(error.name =="CastError"){
//       res.status(400).json({
//         messaje: "El id debe ser una cadena hexadecimal de 24 caracteres",
//         name: error.name
//     })
//     }if(error.name =="BSONError"){
//       res.status(400).json({
//         messaje: "El id debe ser una cadena hexadecimal de 24 caracteres",
//         name: error.name
//     })
//     }
//     if(error instanceof UserError){
//        res.status(error.statusCode).json({
//         messaje: error.message,
//         name: error.name
//     })
//     }
//     if(error instanceof QuestionError){
//       res.status(error.statusCode).json({
//        messaje: error.message,
//        name: error.name
//    })
//    }
//    if(error instanceof AnswerError){
//     res.status(error.statusCode).json({
//      messaje: error.message,
//      name: error.name
//  })
//  }
//  if(error instanceof QuestionExistError){
//   res.status(error.statusCode).json({
//    messaje: error.message,
//    name: error.name
// })
// }
// };
