import { Document } from 'mongoose';

export interface IWatch extends Document {
  watchId: string;
  code: number;
  expireDate: number;
}
