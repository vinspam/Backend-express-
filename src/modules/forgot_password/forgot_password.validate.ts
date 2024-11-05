import Joi from 'joi';

import { validateId } from '../../utils/validations';
import { IForgotPassword } from './forgot_password.types';

export const Id = Joi.custom((value, helper) => validateId(value, helper));

export const forgotPassword: Joi.ObjectSchema<IForgotPassword> = Joi.object({
  email: Joi.string().email().not().empty().required(),
});

export const code: Joi.ObjectSchema<IForgotPassword> = Joi.object({
  code: Joi.number().not().empty().required(),
});

export const resetPassword: Joi.ObjectSchema<IForgotPassword> = Joi.object({
  code: Joi.number().not().empty().required(),
  password: Joi.string().not().empty().required(),
});
