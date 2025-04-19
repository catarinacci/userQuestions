import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please provide a valid email"],
    },
    role: {
      type: String,
      //enum: ["admin", "user", "moderator"],
      default: "",
    },
    premium: {
      type: Boolean,
      default: false,
    },
    questions: {
      type: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
          },
          text: { type: String },
          answers: {
            answer_id: {
              type: Schema.Types.ObjectId,
              ref: "Answer",
            },
            text: { type: String },
            score:{type:Number}
          },
        },
      ],
      default: [],
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

//UserSchema.index({ email: 1 }, { unique: true });

const User = model("User", UserSchema);

export default User;
