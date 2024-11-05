import Joi from 'joi';
import { byEnum } from '../../utils/validations';
import { ACTION_LIST } from './progress.constant';
import { NodeDifficult } from '../workout/workout.constant';

export const saveProgressSchemaValidate = Joi.object({
  day: Joi.number().min(1).required(),
  time: Joi.number().min(1).required(),
  workoutId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('workoutId is not valid')
    .required(),
});

export const saveProgressV2SchemaValidate = Joi.object({
  day: Joi.number().min(1).required(),
  partIndex: Joi.number().required(),
  completeDifficult: byEnum(NodeDifficult).required(),
  nextDifficult: byEnum(NodeDifficult),
  workoutId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('workoutId is not valid')
    .required(),
  userHR: Joi.number(),
  ratePrediction: Joi.number().min(1).max(5),
});

export const saveUserRateValidate = Joi.object({
  userRate: Joi.number().min(1).max(5).required(),
  like: Joi.number().min(1).max(5).required(),
  reason: Joi.string().allow(''),
  workoutId: Joi.string().required(),
  day: Joi.number().required(),
});

export const changeDifficultyValidate = Joi.object({
  action: byEnum(ACTION_LIST),
});

export const changeDateSchemaValidate = Joi.object({
  day: Joi.number().min(1).required(),
});

export const resetDayValidate = Joi.object({
  day: Joi.number().min(1).required(),
  progressId: Joi.string().required(),
  workoutId: Joi.string().required(),
});

export const workoutDate=Joi.object({
  date:Joi.date().required()
})

export const workoutDates=Joi.object({
  startDate:Joi.date().required(),
  endDate:Joi.date().required()
})

export const removePartSchemaValidate = Joi.object({
  day: Joi.number().min(1).required(),
  partIndex: Joi.number().required(),
  workoutId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('workoutId is not valid')
    .required(),
});

export const viewTimeSchemaValidate = Joi.object({
  day: Joi.number().min(1).required(),
  viewedTime: Joi.number().min(1).required(),
  progress: Joi.number().min(1).required(),
  workoutId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('workoutId is not valid')
    .required(),
});
