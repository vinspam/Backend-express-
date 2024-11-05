import Joi from 'joi';

export const watchIdValidate = Joi.object({
  watchId: Joi.string().required(),
});

export const codeValidate = Joi.object({
  watchId: Joi.string().required().not().empty(),
  name: Joi.string().not().empty(),
  model: Joi.string().not().empty(),
});
