import { quizAnswersSchema, userAnswersListSchema } from './quiz_answer.schema';
import generateErrorSchemaForSwagger, * as errorResponse from '../../../utils/swagger/errors';

const tags = ['QuizAnswer'];
const urlPrefix = '/quiz-answer';

const getAnswers = {
  get: {
    summary: 'get user answers for quiz | [ For admin ]',
    tags,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'User id',
      },
    ],
    responses: {
      200: {
        description: 'Successfully!',
        content: {
          'application/json': {
            schema: userAnswersListSchema,
          },
        },
      },
      ...errorResponse.unauthorized,
    },
  },
};

const saveAnswers = {
  post: {
    summary: 'save answers for quiz | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: quizAnswersSchema,
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Success' },
              },
            },
          },
        },
      },
      ...generateErrorSchemaForSwagger(400, 'Validation error'),
      ...errorResponse.unauthorized,
    },
  },
};

const saveAnswersForAdmin = {
  post: {
    summary: 'save answers for quiz | [ For admin ]',
    tags,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'User id',
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: quizAnswersSchema,
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Success' },
              },
            },
          },
        },
      },
      ...generateErrorSchemaForSwagger(400, 'Validation error'),
      ...errorResponse.unauthorized,
    },
  },
};

export default {
  [urlPrefix]: saveAnswers,
  [`${urlPrefix}/{id}`]: saveAnswersForAdmin,
  [`${urlPrefix}/user/{id}`]: getAnswers,
};
