import { Schema, model} from "mongoose";

const AnswerShema = new Schema(
  {
    index:{
      type:Number
    },
    text: {
      type: String,
    }, 
    score:{
      type:Number
    }
  },
  {
    collection: "answers",
    timestamps: true,
  }
);

const Answer = model('Answer', AnswerShema);

export default Answer