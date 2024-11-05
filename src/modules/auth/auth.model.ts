import { Schema, model, Document } from 'mongoose';

import * as AuthConstant from './auth.constant';
import { IAuth } from './auth.types';

const AuthSchema = new Schema<IAuth>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceId: { type: String, required: true },
    platform: {
      type: String,
      enum: Object.keys(AuthConstant.PLATFORM),
      required: true,
    },
    refreshToken: { type: String, required: false },
  },
  { versionKey: false, timestamps: false }
);

export default model<IAuth>('Auth', AuthSchema, 'auths');
