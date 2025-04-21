import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import * as Joi from "joi";
import { validateBody } from "../../helpers/validateBody";
import mongoose from "mongoose";
import Question from "../../models/question";
import { emailService } from "../../services/email.service";
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "../../middlewares/errorHandler";

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    //validar usuario, con error
    if (!user) {
      throw new NotFoundError("Usuario");
    }

    const premiumFilter = user?.premium ? {} : { premium: { $eq: false } };

    const questions = await Question.aggregate([
      {
        $match: premiumFilter,
      },

      {
        $lookup: {
          from: "answers",
          localField: "answers.answer_id",
          foreignField: "_id",
          as: "answers",
        },
      },
      {
        $unwind: "$answers",
      },
      {
        $group: {
          _id: "$_id",

          text: {
            $first: "$text",
          },
          answers: {
            $push: "$answers",
          },
          premium: {
            $first: "$premium",
          },
        },
      },
      {
        $project: {
          text: 1,
          premium: 1,
          answers: {
            $map: {
              input: "$answers",
              as: "ans",
              in: {
                _id: "$$ans._id",
                text: "$$ans.text",
              },
            },
          },
        },
      },
    ]);
    console.log(questions);

    if (!questions || questions.length === 0) {
      throw new NotFoundError("Preguntas");
    }
    res.json({ questions });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError("Error al obtener las preguntas");
  }
};

export const addQuestion = {
  check: (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      id_user: Joi.string().alphanum().length(24).required(),
      id_question: Joi.string().alphanum().length(24).required(),
      id_answer: Joi.string().alphanum().length(24).required(),
    });

    validateBody(req, next, res, schema);
  },
  do: async (req: Request, res: Response) => {

    try {
      const response = req.body;

    //pregunto si existe el usuario
    const user = await User.findById(
      new mongoose.Types.ObjectId(response.id_user)
    );
    if (!user) {
      throw new NotFoundError("Usuario");
    }

    //pregunto si existe la pregunta
    const question = await Question.findById(
      new mongoose.Types.ObjectId(response.id_question)
    );
    if (!question) {
      throw new NotFoundError("Pregunta");
    }

    //pregunto si la respuesta corresponde a la pregunta
    const answer = question.answers.findIndex(
      (questionAnswer) => questionAnswer.answer_id == response.id_answer
    );
    //console.log("answerrrrr",answer)
    if (answer === -1) {
      throw new NotFoundError('Respuesta');
    }

    //pregunto si ya existe la pregunta en el usuario
    const questionExist = user.questions.findIndex(
      (userQuestion) => userQuestion._id == response.id_question
    );
    
    if (questionExist !== -1) {
      throw new ValidationError('Pregunta ya registrada');
    }

    const questionAnswer = await Question.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(response.id_question),
        },
      },
      {
        $unwind: "$answers",
      },
      {
        $match: {
          "answers.answer_id": new mongoose.Types.ObjectId(response.id_answer),
        },
      },
      {
        $lookup: {
          from: "answers",
          localField: "answers.answer_id",
          foreignField: "_id",
          as: "answers",
        },
      },
      {
        $project: {
          text: 1,
          index: 1,
          premium: 1,
          answers: {
            $map: {
              input: "$answers",
              as: "ans",
              in: {
                answer_id: "$$ans._id",
                text: "$$ans.text",
                index: "$$ans.index",
                score: "$$ans.score",
              },
            },
          },
        },
      },
      {
        $unwind: "$answers",
      },
    ]);

    const usuarioActualizado = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(response.id_user) },
      { $push: { questions: questionAnswer[0] } },
      { new: true }
    );
    if (!usuarioActualizado) {
      throw new DatabaseError('Error al actualizar el usuario');
    }
    res.json({ usuarioActualizado });
      
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Error al agregar la pregunta');
    }
  },
};

export const register = {
  check: (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    validateBody(req, next, res, schema);
  },
  do: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;
      const { name, email, role } = body;

      // Check if email is already registered
      const targetUser = await User.find({ email: email });

      if (targetUser.length > 0) {
        res.json({ user: targetUser[0] });
      } else {
        const newUser = new User({ name, email, role });
        await newUser.save();
        res.json({ user: newUser });
      }
    } catch (error) {
      throw new DatabaseError("Error al registrar usuario");
    }
  },
};

export const sendEmail = async (req: Request, res: Response) => {
  const { body } = req;

  const user = await User.findById(body.id_user);
  if (!user) {
    throw new NotFoundError("Usuario");
  }
  // Example of sending an email
  await emailService.sendEmail({
    to: user.email,
    subject: "Bienvenido a la plataforma",
    template: "welcome",
    context: {
      name: user.name,
      message:
        "Gracias por realizar el cuestionario, tus respuestas ya fueron analizadas",
      questions: user.questions,
    },
  });
  res.json({ user: user });
};

export const error = async (next: NextFunction) => {
  //throw new Error("Error creado")
  try {
    //throw new Error("Error creado")
    //throw Error
    await mongoose.connect("sasas", {});
    //throw new Error("Error creado")
    console.log("DB online");
  } catch (error) {
    console.log("aaaaa", error);
    throw new Error("Error a la hora de iniciar la BD ver logs");
    //throw Error
  }

  try {
    throw new Error("Error creado");
  } catch (error) {
    console.log(error);
    //next(error)
  }
};
