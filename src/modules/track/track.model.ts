import { Schema, model } from 'mongoose';
import { ITrack } from './track.types';
 
const ProgressSchema = new Schema<ITrack>(
  {
      userId: {
      index: true,
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workoutId: {
      index: true,
      type: Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    playedDuration: {
      type: Number,
      default: 0,
    },
    currentPosition:{
      type: Number,
      default: 0,
    }
  },
  { versionKey: false, timestamps: true }
);

export default model<ITrack>('Track', ProgressSchema, 'track');
