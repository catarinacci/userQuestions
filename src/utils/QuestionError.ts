export class QuestionError extends Error{
    statusCode= 404
    name="QuestionNotFoundError"
    constructor(){
        super('Pregunta no encontrada');
        Object.setPrototypeOf(this, QuestionError.prototype)
    }
}