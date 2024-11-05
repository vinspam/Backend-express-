import { Document, ObjectId, QuerySelector } from 'mongoose';
import { WorkoutBodyPart, WorkoutStyle } from './workout.constant';
import { Response } from 'express';
import { ACTION_LIST } from '../progress/progress.constant';

type PrependNextNum<A extends Array<unknown>> = A['length'] extends infer T
  ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
    ? X
    : never
  : never;
type EnumerateInternal<A extends Array<unknown>, N extends number> = {
  0: A;
  1: EnumerateInternal<PrependNextNum<A>, N>;
}[N extends A['length'] ? 0 : 1];
export type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[] ? E : never;
export type Range<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>;

export interface IVideoNode {
  timeStart: number;
  timeEnd: number;
  difficult: string;
  hr?: number;
}

export interface IVideoPart {
  name: string;
  completed: boolean;
  targetHR: number;
  nodes: IVideoNode[];
  averageHR?: number;
  completedNum?: number; // how many users completed this part
}

export interface IVideo {
  link: string;
  thumbnail: string;
  customThumbnail:string;
  duration: number;
  parts: IVideoPart[];
}

export interface IWorkout extends Document {
  title: string;
  difficulty: Range<1, 11>;
  difficultyResetAt: Date;
  bodyPart: WorkoutBodyPart[];
  style: WorkoutStyle;
  video?: IVideo;
  instructor?: string;
  calory?: number;
  hr?: number;
  equipments: string[];
  prioritizeWhenWatchConnected: boolean;
  priority: Range<1, 11>;
}

export interface IAllWorkoutParam {
  difficulty: Range<1, 11>;
  bodyPart: WorkoutBodyPart;
  offset: number;
  limit: number;
  lengthFrom: number;
  lengthTo: number;
  priority: Range<1, 11>;
}

export interface IWorkoutSSE {
  userId: string;
  progressId: string;
  workoutId: string;
  allowDisconnect: boolean;
  dayNumber: number;
  actionAfterWorkout: ACTION_LIST;
  percentHeartRate: number;
  hrDefault: {
    above: number;
    below: number;
  };
  needClearProgress: boolean;
  startFromPart: number;
  expire: number;
  response: Response;
}

export interface IGetAllWorkoutForUser {
  _id?: ObjectId | string | QuerySelector<ObjectId | string>;
  bodyPart?: WorkoutBodyPart;
  difficulty?: number;
  videoLength?: {
    from?: number;
    to?: number;
  };
  range?: { offset: number; limit: number };
}
