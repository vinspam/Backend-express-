import { Schema, model } from 'mongoose';
import { IDefaultSettingDocument, IRateWorkoutForRegenerate } from './defaultSettings.types';

const RateWorkoutForRegenerate = new Schema<IRateWorkoutForRegenerate>(
  {
    rate: {
      type: Number,
      required: true,
    },
    answerAfter: {
      type: Number,
      required: true,
    },
  },
  { timestamps: false, versionKey: false, _id: false }
);

const DefaultSettingsSchema = new Schema<IDefaultSettingDocument>(
  {
    percentPartForCompleteDay: {
      type: Number,
      default: 70,
      required: true,
    },
    passedVideoTime: {
      type: Number,
      required: true,
    },
    countRepeatWorkoutForWeek: {
      type: Number,
      required: true,
    },
    numberRepeatWorkoutInMonth: {
      type: Number,
      required: true,
    },
    needRepeatCountForChangeDiff: {
      type: Number,
      required: true,
    },
    percentOfAboveORBelowForHR: {
      type: Number,
      required: true,
    },
    percentOfSectionBelowForHR: {
      type: Number,
      required: true,
    },
    percentOfSectionAboveForHR: {
      type: Number,
      required: true,
    },
    rateWorkoutForRegenerate: [
      {
        type: RateWorkoutForRegenerate,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<IDefaultSettingDocument>('DefaultSettings', DefaultSettingsSchema, 'default-settings');
