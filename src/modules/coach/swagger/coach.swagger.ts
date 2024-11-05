import * as errorResponse from '../../../utils/swagger/errors';
import { coachSchema, fullCoachSchema } from './coach.schema';

const tags = ['Coach'];

const getCoaches = {
  get: {
    summary: 'get all coach | [ For all ]',
    tags,
    parameters: [
      {
        name: 'offset',
        in: 'query',
        required: false,
        default: 0,
        schema: {
          type: 'integer',
        },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        default: 10,
        schema: {
          type: 'integer',
        },
      },
    ],
    responses: {
      200: {
        description: 'Successfully get all users!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: fullCoachSchema,
                },
                count: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
};

const createCoach = {
  post: {
    summary: 'create coach | [ For admin ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: coachSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully create coach!',
        content: {
          'application/json': {
            schema: fullCoachSchema,
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.notFound,
      default: {
        description: 'Error create coach!',
      },
    },
  },
};

const getCoach = {
  get: {
    summary: 'get coach | [ For all ]',
    tags,
    parameters: [
      {
        name: 'id',
        in: 'path',
        default: 'me',
        required: true,
        description: 'its coach id',
      },
    ],
    responses: {
      200: {
        description: 'Successfully get coach!',
        content: {
          'application/json': {
            schema: fullCoachSchema,
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.notFound,
      default: {
        description: 'Error get coach!',
      },
    },
  },
};

const editCoach = {
  put: {
    summary: 'edit user | [ For admin ]',
    tags,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', required: false },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully edit coach!',
        content: {
          'application/json': {
            schema: fullCoachSchema,
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
      default: {
        description: 'Error edit coach!',
      },
    },
  },
};

const deleteCoach = {
  delete: {
    summary: 'Delete coach | [ For admin ]',
    tags,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Successfully deleted coach!',
        content: {
          'application/json': {
            schema: fullCoachSchema,
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
    },
  },
};

export default {
  '/coach': Object.assign({}, getCoaches, createCoach),
  '/coach/{id}': Object.assign({}, getCoach, editCoach, deleteCoach),
};
