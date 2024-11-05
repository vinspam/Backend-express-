import Joi from 'joi';

export const userIdValidate = Joi.object({
  userId: Joi.string().required(),
});