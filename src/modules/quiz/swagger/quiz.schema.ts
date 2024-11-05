import { BODY_TYPE, LIST_OF_YEARS, QUESTION_TYPE, UNIT } from '../quiz.constant';

const answers = {
  id: { type: 'integer', required: true },
  text: { type: 'string', required: true },
  unit: { type: 'string', enum: Object.keys(UNIT), required: false },
};

const quizProperties = {
  id: { type: 'integer', required: true },
  type: { type: 'string', enum: Object.keys(QUESTION_TYPE), required: false },
  title: { type: 'string', required: false },
  save: { type: 'boolean', required: true },
  subtitle: { type: 'string', required: false },
  description: { type: 'string', required: false },
  body: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        data: { type: 'string', required: true },
        type: { type: 'string', enum: Object.keys(BODY_TYPE), required: true },
      },
    },
  },
  enum: { type: 'array', required: false, items: { type: 'string' }, default: LIST_OF_YEARS },
  answers: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: answers,
    },
  },
};

export const fullQuizSchema = {
  type: 'object',
  properties: quizProperties,
};
