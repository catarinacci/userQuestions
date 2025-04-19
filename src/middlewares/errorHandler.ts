import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { UserError } from "../utils/UserError";
import { QuestionError } from "../utils/QuestionError";
import { AnswerError } from "../utils/AnswerError";
import { QuestionExistError } from "../utils/QuestionExistError";

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    console.log("middleware",error.name, error.message)

    if(error.name =="CastError"){
      res.status(400).json({
        messaje: "El id debe ser una cadena hexadecimal de 24 caracteres",
        name: error.name
    })
    }if(error.name =="BSONError"){
      res.status(400).json({
        messaje: "El id debe ser una cadena hexadecimal de 24 caracteres",
        name: error.name
    })
    }
    if(error instanceof UserError){
       res.status(error.statusCode).json({
        messaje: error.message,
        name: error.name
    })
    }
    if(error instanceof QuestionError){
      res.status(error.statusCode).json({
       messaje: error.message,
       name: error.name
   })
   }
   if(error instanceof AnswerError){
    res.status(error.statusCode).json({
     messaje: error.message,
     name: error.name
 })
 }
 if(error instanceof QuestionExistError){
  res.status(error.statusCode).json({
   messaje: error.message,
   name: error.name
})
}
};
