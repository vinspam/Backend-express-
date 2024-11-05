import Joi from 'joi';

export const publicKeyValidate = Joi.object({
  publicKey: Joi.string().required(),
});

export const secretKeyValidate = Joi.object({
  secretKey: Joi.string().required(),
});

export const updatePrice = Joi.object({
  newPriceId: Joi.string(),
  trialDays: Joi.number().integer().min(0),
});

export const updateFreeSubscribe = Joi.object({
    available: Joi.boolean(),
    priceId: Joi.string(),
    payment: Joi.object({
      card: Joi.string(),
      cvc: Joi.string(),
      expireYear: Joi.number(),
      expireMonth: Joi.number(),
    }),
  });