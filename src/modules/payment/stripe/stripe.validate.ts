import Joi from 'joi';

export const subscribeIdValidate = Joi.object({
  subscribeId: Joi.string().required(),
});

export const priceIdValidate = Joi.object({
  priceId: Joi.string().required(),
});

export const paymentMethodIdValidate = Joi.object({
  paymentMethodId: Joi.string().required(),
});

export const replaceCustomerValidate = Joi.object({
  customerId: Joi.string().required(),
});
