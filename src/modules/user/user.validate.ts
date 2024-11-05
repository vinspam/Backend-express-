import Joi from 'joi';

import { byEnum, validateId } from '../../utils/validations';
import { ROLE, STATUS, GENDER, ACTION_FOR_SAVED_VIDEO, UNITS } from './user.constant';
import { WorkoutBodyPart, WorkoutStyle } from '../workout/workout.constant';

export const Id = Joi.custom((value, helper) => validateId(value, helper));

export const main = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ allowUnicode: true }).required(),
  password: Joi.string().required(),
  role: Joi.string().valid(...Object.keys(ROLE)),
  status: Joi.string().valid(...Object.keys(STATUS)),
});

export const addition = Joi.object({
  avatar: Joi.string(),
  name: Joi.string(),
  gender: Joi.string().valid(...Object.keys(GENDER)),
  height: Joi.string(),
  weight: Joi.number(),
  email: Joi.string().email({ allowUnicode: true }),
  heartRate: Joi.object({
    above: Joi.number(),
    below: Joi.number(),
  }),
  unit : Joi.string().valid(...Object.keys(UNITS)),
});

export const additionAdmin = Joi.object({
  avatar: Joi.string(),
  name: Joi.string(),
  gender: Joi.string().valid(...Object.keys(GENDER)),
  height: Joi.string(),
  weight: Joi.number(),
  status: Joi.string().valid(...Object.keys(STATUS)),
  role: Joi.string().valid(...Object.keys(ROLE)),
  abilityLevel: Joi.number().min(1).max(10),
  percentHeartRate: Joi.number(),
  bodyPartList: Joi.array().items(byEnum(WorkoutBodyPart)),
  workoutStyleList: Joi.array().items(byEnum(WorkoutStyle)),
  heartRate: Joi.object({
    above: Joi.number(),
    below: Joi.number(),
  }),
});

export const addOrRemoveSavedVideo = Joi.object({
  id: Joi.custom((value, helper) => validateId(value, helper)),
  action: Joi.string().valid(ACTION_FOR_SAVED_VIDEO.ADD, ACTION_FOR_SAVED_VIDEO.REMOVE),
});

export const full = Joi.object().concat(main).concat(addition);
