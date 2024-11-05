import { Document, ObjectId, SchemaTimestampsConfig } from 'mongoose';
import { WEEK_STATUS_TYPE } from './progress.constant';
import { PLAN_TYPE } from '../plan/plan.constant';
import { NodeDifficult } from '../workout/workout.constant';

type TUserRate = number;

export type IProgressWorkoutType = 'workout' | 'altWorkout';

export interface IProgressPartWorkout {
  partIndex: number;
  completedDifficult?: NodeDifficult;
  nextDifficult?: NodeDifficult;
  completedHR?: number
}

export interface IProgressWorkout {
  id: ObjectId | string;
  time: number;
  parts: IProgressPartWorkout[];
  percent: number;
  status: WEEK_STATUS_TYPE;
  completedDate: Date;
  viewedTime: number;
  rate: number;
  ratedAt: Date;
  score:number;
  reason:string;
  difficulty: number;
  ratePrediction?: number;
  calories?:number;
  caloriesPercent?:number;
}

export interface IProgressDay {
  day: number;
  skipped?: boolean; // дата коли виконання воркаута
  status: WEEK_STATUS_TYPE;
  workout: IProgressWorkout;
  altWorkout: IProgressWorkout;
  isAbilityUpdated: boolean;
}

export interface IProgressObject {
  type: PLAN_TYPE;
  active: boolean;
  userId: ObjectId | string;
  planId: ObjectId;
  dateStart: Date;
  days: IProgressDay[];
  userDifficultyRate: number;
  popupCount: number;
}

export interface IProgress extends Document, SchemaTimestampsConfig, IProgressObject {}

export interface IProgressInfo {
  day: number;
  time: number;
  workoutId: string;
}

export interface IProgressInfoV2 {
  day: number;
  partIndex: number;
  completeDifficult: NodeDifficult;
  nextDifficult?: NodeDifficult;
  userRate?: TUserRate;
  workoutId: string;
  userHR?: number;
  ratePrediction?: number;
}

export interface IUserRate {
  userRate: TUserRate;
}

export interface IRemovePartInfo {
  day: number;
  partIndex: number;
  completeDifficult: NodeDifficult;
  nextDifficult?: NodeDifficult;
  workoutId: string;
}

export interface IUpdateViewTimeInfo {
  workoutId: string;
  day: number;
  viewedTime: number;
  progress: number;
}
