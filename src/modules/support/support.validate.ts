import Joi from 'joi';

export const supportMessageValidation = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100),
  comment: Joi.string().min(2).required(),
});
