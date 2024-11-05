import { Document, ObjectId, SchemaTimestampsConfig } from 'mongoose';

export interface ITrackObject {
  userId: ObjectId | string;
  workoutId: ObjectId | string;
  totalDuration: number;
  playedDuration: number;
  currentPosition: number;
}

export interface ITrack extends Document, SchemaTimestampsConfig, ITrackObject {}
 