import { Router } from "express";
import { addQuestion, error, getQuestions, register, sendEmail } from "../../controllers/user";


const userRoutes = Router();

userRoutes.post("/register",register.check, register.do);
userRoutes.get("/get-questions/:id", getQuestions)
userRoutes.post("/add-question", addQuestion)
userRoutes.post("/send-email", sendEmail)

export default userRoutes;
