import Joi from 'joi';

import { validateId } from '../../utils/validations';
import { WorkoutBodyPart, WorkoutStyle, VIMEO_VIDEO_URL_REGEXP, NodeDifficult } from './workout.constant';
import { IWorkout } from './workout.types';

export const Id = Joi.custom((value, helper) => validateId(value, helper));

const JoiBodyPart = Joi.custom((value, helper) => {
  const bodyPartsArr = value.split(',');

  bodyPartsArr.forEach((bodyPart) => Joi.string().valid(...Object.keys(WorkoutBodyPart)).validate(bodyPart));
})

export const createWorkout: Joi.ObjectSchema<IWorkout> = Joi.object({
  title: Joi.string().not().empty().required(),
  difficulty: Joi.number().min(1).max(10).required(),
  priority: Joi.number().min(1).max(10).required(),
  // bodyPart: Joi.string().valid(...Object.keys(WorkoutBodyPart)), 
  bodyPart: Joi.array().required().items(Joi.valid(...Object.keys(WorkoutBodyPart))),
  style: Joi.string().valid(...Object.keys(WorkoutStyle)),
  instructor: Joi.string(),
  hr: Joi.number().min(0).required(),
  calory: Joi.number().min(0).required(),
  equipments: Joi.array().items(Joi.string()),
  prioritizeWhenWatchConnected: Joi.boolean(),
});

export const updateWorkout: Joi.ObjectSchema<IWorkout> = Joi.object({
  title: Joi.string().not().empty(),
  difficulty: Joi.number().min(1).max(10),
  priority: Joi.number().min(1).max(10),
  bodyPart: Joi.string().valid(...Object.keys(WorkoutBodyPart)),
  style: Joi.string().valid(...Object.keys(WorkoutStyle)),
  instructor: Joi.string(),
  calory: Joi.number().min(0),
  hr: Joi.number().min(0),
  equipments: Joi.array().items(Joi.string()),
});

const videoPartNode = Joi.object({
  timeStart: Joi.number().required(),
  timeEnd: Joi.number().required(),
  difficult: Joi.string().valid(...Object.keys(NodeDifficult)),
});

const videoPartValidation = Joi.object({
  name: Joi.string().required(),
  targetHR: Joi.number().required(),
  nodes: Joi.array().items(videoPartNode),
});

export const videoValidation = Joi.object({
  url: Joi.string().regex(VIMEO_VIDEO_URL_REGEXP).message('Url not valid').required(),
  parts: Joi.array().items(videoPartValidation),
  thumbnailBaseLink:Joi.string()
});

export const setThumbnailSchemaValidate = Joi.object({
  customThumbnail: Joi.string(),
  difficulty:Joi.number().required(),
  priority:Joi.number().required(),
  workoutStyle:Joi.string().required(),
  parts:Joi.string()
});


export const workoutsIds = Joi.object({
  workoutIdArr: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('workoutId is not valid')
        .required()
    )
    .required(),
});

export const allWorkouts = Joi.object({
  difficulty: Joi.number().min(1).max(5),
  bodyPart: Joi.string().valid(...Object.keys(WorkoutBodyPart)),
  offset: Joi.number(),
  limit: Joi.number(),
  lengthFrom: Joi.number(),
  lengthTo: Joi.number(),
  text: Joi.string().allow(''),
});

export const listWorkouts = Joi.object({
  difficulty: Joi.number().min(1).max(5),
  bodyPart: JoiBodyPart,
  offset: Joi.number(),
  limit: Joi.number(),
  lengthFrom: Joi.number(),
  lengthTo: Joi.number(),
  text: Joi.string().allow(''),
});

export const resetPartAverageHRParams = Joi.object({
  id: Id,
  partIndex: Joi.number().required(),
});
