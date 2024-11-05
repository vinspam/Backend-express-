import { Document, ObjectId, SchemaTimestampsConfig } from 'mongoose';
import { PLAN_TYPE } from './plan.constant';

export type workoutsPlan = Array<ObjectId | string | null>;

export interface IPlanWorkouts {
  workouts: workoutsPlan;
  altWorkouts: workoutsPlan;
}

export interface IPlanObject extends IPlanWorkouts {
  type: PLAN_TYPE;
  title: string;
  userId: ObjectId | string;
  description: string;
  difficulty: number;
  isPrimary: boolean;
  thumbnailName?: string;
  thumbnail?: string;
}

export interface IPlan extends IPlanObject, Document, SchemaTimestampsConfig {}

export interface IShortPlan {
  _id: ObjectId | string;
  type: PLAN_TYPE;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailName?: string;
}

export interface IAddPictures {
  thumbnailName?: string;
}
