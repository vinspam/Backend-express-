import { Document, ObjectId } from 'mongoose';
import { GENDER, ROLE, STATUS, UNITS } from './user.constant';
import { WorkoutBodyPart, WorkoutStyle } from '../workout/workout.constant';

interface IUserWatch {
  id: string;
  model: string;
  brand: string;
}

export interface IFreeChallenge{
  startDay: Date;
  endDay: Date;
  isCompleted: boolean;
  inProgress: boolean;
}

interface IHeartRate {
  above: number;
  below: number;
}

export interface IHints {
  altWorkout: boolean;
  player: boolean;
  ratePopup: boolean;
  viewPlan: boolean;
  weekData: boolean;
}

export interface IUser extends Document {
  abilityLevel?: number;
  avatar?: string;
  birthday?: Date;
  bodyPartList?: Array<WorkoutBodyPart>;
  countWorkoutRepeat: number;
  email: string;
  gender?: GENDER;
  height?: number | string;
  name: string;
  password?: string;
  percentHeartRate?: number;
  role: ROLE;
  savedWorkouts: Array<ObjectId>;
  status: STATUS;
  weight?: number | string;
  unit?: UNITS;
  watch?: IUserWatch;
  freeChallenge?:IFreeChallenge;
  heartRate: IHeartRate;
  workoutStyleList?: Array<WorkoutStyle>;
  hints: IHints;
}
