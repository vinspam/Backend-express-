import { Schema, model } from 'mongoose';
import { IQuizAnswer, Answer, IQuestion } from './quiz_answer.types';

const AnswerSchema = new Schema<Answer>(
  {
    id: {
      type: Number,
      require: false,
    },
    text: {
      type: String,
      required: false,
    },
  },
  { timestamps: false, versionKey: false, _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    questionId: {
      type: Number,
      required: true,
    },
    answer: {
      type: [AnswerSchema],
    },
  },
  { timestamps: false, versionKey: false, _id: false }
);

const QuizAnswerSchema = new Schema<IQuizAnswer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    answers: {
      type: [QuestionSchema],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<IQuizAnswer>('QuizAnswer', QuizAnswerSchema, 'quiz-answers');
