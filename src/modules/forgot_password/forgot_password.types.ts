import { Document, ObjectId } from 'mongoose';

export interface IForgotPassword extends Document {
  userId: ObjectId;
  code: number;
}
