import { Schema, model } from 'mongoose';
import * as UserConstant from './user.constant';
import { IUser } from './user.types';
import { WorkoutBodyPart, WorkoutStyle } from '../workout/workout.constant';
import { boolean } from 'joi';

const UserSchema = new Schema<IUser>(
  {
    avatar: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: Object.keys(UserConstant.GENDER),
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
    weight: {
      type: Number,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: false,
    },
    abilityLevel: {
      type: Number,
      required: false,
      default: 0,
    },
    percentHeartRate: {
      type: Number,
      required: false,
      default: 0,
    },
    role: {
      type: String,
      enum: Object.keys(UserConstant.ROLE),
      default: UserConstant.ROLE.USER,
    },
    unit: {
      type: String,
      enum: Object.keys(UserConstant.UNITS),
      default: UserConstant.UNITS.LBS,
    },
    savedWorkouts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'workouts',
      },
    ],
    status: {
      type: String,
      enum: Object.keys(UserConstant.STATUS),
      default: UserConstant.STATUS.VERIFIED,
    },
    bodyPartList: [
      {
        type: String,
        enum: Object.keys(WorkoutBodyPart),
      },
    ],
    workoutStyleList: [
      {
        type: String,
        enum: Object.keys(WorkoutStyle),
      },
    ],
    countWorkoutRepeat: {
      type: Number,
      required: false,
      default: 0,
    },
    watch: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      model: {
        type: String,
      },
    },
    freeChallenge:{
      startDay:{
        type: Date
      },
      endDay:{
        type: Date
      },
      isCompleted:{
        type: Boolean,
        default: false // if true => it means it is used once
      },
      inProgress:{
        type: Boolean,
        default: false // if true => it is being used.
      }
    },
    heartRate: {
      above: {
        type: Number,
        default: 0,
      },
      below: {
        type: Number,
        default: 0,
      },
    },
    hints: {
      altWorkout: {
        type: Boolean,
        default: false,
      },
      player: {
        type: Boolean,
        default: false,
      },
      ratePopup: {
        type: Boolean,
        default: false,
      },
      viewPlan: {
        type: Boolean,
        default: false,
      },
      weekData: {
        type: Boolean,
        default: true,
      },
    },
  },
  { versionKey: false, timestamps: true }
);

export default model<IUser>('User', UserSchema, 'users');
