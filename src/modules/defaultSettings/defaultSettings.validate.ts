import Joi from 'joi';

import { IDefaultSetting } from './defaultSettings.types';

export const updateDefaultSettingsValidate: Joi.ObjectSchema<IDefaultSetting> = Joi.object({
  passedVideoTime: Joi.number(),
  countRepeatWorkoutForWeek: Joi.number(),
  numberRepeatWorkoutInMonth: Joi.number(),
  percentPartForCompleteDay: Joi.number(),
  needRepeatCountForChangeDiff: Joi.number(),
  percentOfAboveORBelowForHR: Joi.number(),
  percentOfSectionAboveForHR: Joi.number(),
  percentOfSectionBelowForHR: Joi.number(),
  rateWorkoutForRegenerate: Joi.array().items(
    Joi.object({
      rate: Joi.number().required(),
      answerAfter: Joi.number().required(),
    })
  ),
});
