import { Document, ObjectId } from 'mongoose';

export type Answer = {
  id?: number;
  text?: string;
};

export interface IQuestion {
  questionId: number;
  answer: Answer[];
}

export interface IBaseQuizAnswer extends Document {
  userId: ObjectId | string;
  answers: IQuestion[];
}

export interface IQuizAnswer extends Document, IBaseQuizAnswer {}
