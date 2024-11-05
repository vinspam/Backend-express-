import Joi from 'joi';
import * as validations from '../../utils/validations';

export const GetAllCoach = Joi.object({
  offset: Joi.number(),
  limit: Joi.number(),
});

export const CreateCoachSchema = Joi.object({
  name: Joi.string(),
});

export const UpdateCoachSchema = Joi.object({
  id: validations.byId,
  name: Joi.string(),
});
