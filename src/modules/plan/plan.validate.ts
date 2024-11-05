import Joi from 'joi';

import { validateId } from '../../utils/validations';
import { IPlan } from './plan.types';
import { PLAN_TYPE } from './plan.constant';

export const Id = Joi.custom((value, helper) => validateId(value, helper));

const workouts = Joi.array().items(
  Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('workoutId is not valid')
    .required(),
  Joi.allow(null)
);

export const planSchemaValidate: Joi.ObjectSchema<IPlan> = Joi.object({
  type: Joi.string().valid(...Object.keys(PLAN_TYPE)),
  title: Joi.string().required(),
  description: Joi.string(),
  difficulty: Joi.number().min(1).max(10).required(),
  workouts: workouts,
  altWorkouts: workouts,
  isPrimary: Joi.boolean(),
  thumbnail: Joi.string(),
  thumbnailName: Joi.string(),
});

export const updatePlanSchemaValidate: Joi.ObjectSchema<IPlan> = Joi.object({
  type: Joi.string().valid(...Object.keys(PLAN_TYPE)),
  title: Joi.string(),
  description: Joi.string(),
  difficulty: Joi.number().min(1).max(10),
  workouts: workouts,
  altWorkouts: workouts,
  isPrimary: Joi.boolean(),
  thumbnail: Joi.string(),
  thumbnailName: Joi.string(),
});

export const setPicturesSchemaValidate = Joi.object({
  thumbnailName: Joi.string(),
});
