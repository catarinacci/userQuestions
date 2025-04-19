export class AnswerError extends Error{
    statusCode= 404
    name="AnswerNotFoundError"
    constructor(){
        super('Respuesta no encontrada');
        Object.setPrototypeOf(this, AnswerError.prototype)
    }
}