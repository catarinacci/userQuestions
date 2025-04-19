import { Schema, model } from "mongoose";
import answer from "./answer";
import { boolean } from "joi";

const QuestionShema = new Schema(
  {
    index:{
      type:Number
    },
    text: {
      type: String,
    },
    premium:{
      type:Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    answers: {
      type: [
        {
          answer_id: { type: Schema.Types.ObjectId, ref: "Answer" },
        },
      ],
    },
  },
  {
    collection: "questions",
    timestamps: true,
  }
);

const Question = model("Question", QuestionShema);

export default Question ;
