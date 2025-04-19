export class UserError extends Error{
    statusCode= 404
    name="UserNotFoundError"
    constructor(){
        super('Usuario no encontrado');
        Object.setPrototypeOf(this, UserError.prototype)
    }
}