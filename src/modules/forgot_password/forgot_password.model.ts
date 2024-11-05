import { Schema, model } from 'mongoose';
import { IForgotPassword } from './forgot_password.types';

const ForgotPasswordSchema = new Schema<IForgotPassword>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    code: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ForgotPasswordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default model<IForgotPassword>('ForgotPassword', ForgotPasswordSchema, 'forgot-passwords');
