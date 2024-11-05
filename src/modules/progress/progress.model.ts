import { Schema, model } from 'mongoose';
import { IProgress } from './progress.types';
import { WEEK_STATUS_TYPE } from './progress.constant';
import { PLAN_TYPE } from '../plan/plan.constant';
import { NodeDifficult } from '../workout/workout.constant';

const progressPartWorkout = {
  partIndex: {
    type: Number,
    required: true,
  },
  completedDifficult: {
    type: String,
    enum: NodeDifficult,
    required: true,
  },
  nextDifficult: {
    type: String,
    required: false,
    enum: NodeDifficult,
    default: NodeDifficult.MEDIUM,
  },
  _id: false,
};

const progressWorkout = {
  id: {
    type: Schema.Types.ObjectId,
    ref: 'Workout',
    required: false,
    default: null,
  },
  time: {
    type: Number,
    required: false,
    default: 0,
  },
  parts: [progressPartWorkout],
  percent: {
    type: Number,
    required: false,
    default: 0,
  },
  status: {
    type: String,
    enum: Object.keys(WEEK_STATUS_TYPE),
    default: WEEK_STATUS_TYPE.DAY_OF,
    required: false,
  },
  completedDate: {
    type: Date,
    required: false,
    default: null,
  },
  viewedTime: {
    type: Number,
    require: true,
    default: 0,
  },
  rate: {
    type: Number,
    required: true,
    default: 0,
  },
  difficulty: {
    type: Number,
    default: 0,
  },
  ratePrediction: {
    type: Number,
  },
  ratedAt: {
    type: Date,
  },
  calories:{
    type:Number,
    required:false,
    default:null,
  },
  caloriesPercent:{
    type: Number,
    required: false,
    default: 0,
  }
};

const progressDay = {
  _id: false,
  day: {
    type: Number,
    required: true,
  },
  skipped: {
    type: Boolean,
    required: false,
    default: false,
  },
  status: {
    type: String,
    enum: Object.keys(WEEK_STATUS_TYPE),
    default: WEEK_STATUS_TYPE.DAY_OF,
    required: true,
  },
  workout: progressWorkout,
  altWorkout: progressWorkout,
  isAbilityUpdated: {
    type: Boolean,
    required: true,
    default: false,
  },
};

const ProgressSchema = new Schema<IProgress>(
  {
    type: {
      type: String,
      required: true,
      enum: Object.keys(PLAN_TYPE),
    },
    active: {
      type: Boolean,
      required: false,
      default: true,
    },
    userId: {
      index: true,
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      index: true,
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    popupCount: {
      type: Number,
      default: 5,
    },
    days: [progressDay],
    dateStart: {
      type: Date,
      required: true,
    },
    userDifficultyRate: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

export default model<IProgress>('Progress', ProgressSchema, 'progress');
