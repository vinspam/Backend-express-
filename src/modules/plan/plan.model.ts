import { Schema, model } from 'mongoose';
import { PLAN_TYPE } from './plan.constant';
import { IPlan } from './plan.types';

const workoutId = {
  type: Schema.Types.ObjectId,
  ref: 'Workout',
  required: false,
  default: null,
};

const PlanSchema = new Schema<IPlan>(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.keys(PLAN_TYPE),
      default: PLAN_TYPE.CHALLENGE,
    },
    description: {
      type: String,
      required: false,
    },
    difficulty: {
      type: Number,
      required: false,
      min: 1,
      max: 10,
    },
    workouts: {
      type: [workoutId],
    },
    altWorkouts: {
      type: [workoutId],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    isPrimary: {
      type: Boolean,
      required: false,
    },
    thumbnailName: {
      type: String,
      required: false,
      default: null,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<IPlan>('Plan', PlanSchema, 'plans');
