import Joi from 'joi';

import { IQuestion } from './quiz_answer.types';

const answerObject: Joi.ObjectSchema<IQuestion> = Joi.object({
  questionId: Joi.number().required(),
  answer: Joi.array()
    .items(
      Joi.object({
        id: Joi.number(),
        text: Joi.string(),
      })
    )
    .required(),
});

export const saveAnswers = Joi.object({
  answers: Joi.array().items(answerObject).required(),
});
