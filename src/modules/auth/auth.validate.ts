import Joi from 'joi';

import { PLATFORM } from './auth.constant';

export const device = Joi.object({
  deviceId: Joi.string().required().min(3),
  platform: Joi.string().valid(...Object.keys(PLATFORM)),
});

export const signUp = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email({ allowUnicode: true }).required(),
  password: Joi.string().required(),
});

export const signIn = Joi.object({
  email: Joi.string().email({ allowUnicode: true }).required(),
  password: Joi.string().required(),
});

export const updateToken = Joi.object({
  refreshToken: Joi.string(),
});
