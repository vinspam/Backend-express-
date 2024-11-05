import { SchemaTimestampsConfig, Document } from 'mongoose';

export interface ICoachObject {
  name: string;
}

export interface ICoach extends ICoachObject, Document, SchemaTimestampsConfig {}
