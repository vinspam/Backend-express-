import { Document, ObjectId } from 'mongoose';

import { ROLE, STATUS } from '../user/user.constant';
import { PLATFORM } from './auth.constant';

export interface IAuthInfo {
  deviceId?: string;
  platform?: PLATFORM;
  role: ROLE;
  status: STATUS;
  userId: ObjectId | string;
}

export interface IUpdateOrCreate {
  deviceId: string;
  platform: PLATFORM;
  userId: ObjectId;
}

export interface IGenerateParams {
  deviceId?: string;
  platform?: PLATFORM;
  role: ROLE;
  status: STATUS;
  userId: ObjectId;
}

export interface IAuth extends Document {
  userId: ObjectId;
  deviceId: string;
  platform: PLATFORM;
  refreshToken?: string;
}
