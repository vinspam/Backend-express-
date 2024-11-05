import { Schema, model } from 'mongoose';
import { ICoach } from './coach.types';

const ExampleSchema = new Schema<ICoach>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

export default model<ICoach>('Coach', ExampleSchema, 'coachs');
