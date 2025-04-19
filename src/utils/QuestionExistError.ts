export class QuestionExistError extends Error{
    statusCode= 200
    name="QuestionExistError"
    constructor(){
        super('Pregunta ya registrada');
        Object.setPrototypeOf(this, QuestionExistError.prototype)
    }
}