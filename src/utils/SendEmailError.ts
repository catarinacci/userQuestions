export class SendEmailError extends Error{
    statusCode= 400
    name="SendEmailErrorError"
    constructor(){
        super('Error al enviar el correo');
        Object.setPrototypeOf(this, SendEmailError.prototype)
    }
}