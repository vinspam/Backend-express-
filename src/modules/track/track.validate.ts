import Joi from 'joi';
export const saveTrackSchemaValidate = Joi.object({
  totalDuration: Joi.number().required(),
  playedDuration: Joi.number().required(),
  currentPosition: Joi.number().required(),
  workoutId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('workoutId is not valid')
    .required()
});
