import * as errorResponse from '../../../utils/swagger/errors';
import { WorkoutBodyPart } from '../workout.constant';

import {
  workoutWithNotRequiredFields,
  updateVideoInWorkout as updateVideoInWorkoutSchema,
  createWorkout as createWorkoutSchema,
  workoutsRangeId,
  getWorkoutAllResponseSchema,
} from './workout.schema';

const tags = ['Workout'];
const urlPrefix = '/workout';

const getWorkoutAll = {
  get: {
    summary: 'get workouts | [ For user ]',
    tags,
    parameters: [
      {
        name: 'bodyPart',
        in: 'query',
        required: false,
        description: 'Filter workout by body part',
        schema: {
          type: 'string',
          enum: Object.keys(WorkoutBodyPart),
        },
      },

      {
        name: 'difficulty',
        in: 'query',
        required: false,
        example: 10,
        description: 'Filter workout by difficulty',
        schema: {
          type: 'integer',
        },
      },
      {
        name: 'lengthFrom',
        in: 'query',
        required: false,
        example: 10,
        description: 'Filter workout by time (minutes)',
        schema: {
          type: 'integer',
        },
      },
      {
        name: 'lengthTo',
        in: 'query',
        required: false,
        example: 10,
        description: 'Filter workout by time (minutes)',
        schema: {
          type: 'integer',
        },
      },

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
      {
        name: 'text',
        in: 'query',
        required: false,
        default: '',
      },
    ],
    responses: {
      200: {
        description: 'Successfully get all workouts!',
        content: {
          'application/json': {
            schema: getWorkoutAllResponseSchema,
          },
        },
      },
    },
  },
};

const getWorkoutAllForAdmin = {
  get: {
    summary: 'get workouts | [ For admin ]',
    tags,
    parameters: [
      {
        name: 'bodyPart',
        in: 'query',
        required: false,
        description: 'Filter workout by body part',
        schema: {
          type: 'string',
          enum: Object.keys(WorkoutBodyPart),
        },
      },

      {
        name: 'difficulty',
        in: 'query',
        required: false,
        example: 10,
        description: 'Filter workout by difficulty',
        schema: {
          type: 'integer',
        },
      },

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
        description: 'Successfully get all workouts!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/fullWorkoutSchema',
                  },
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

const getWorkoutById = {
  get: {
    summary: 'get workout by id | [ For all ]',
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
        description: 'Successfully get workout!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullWorkoutSchema',
            },
          },
        },
      },
      ...errorResponse.notFound,
    },
  },
};

const createWorkout = {
  post: {
    summary: 'Create workout | [ For admin ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: createWorkoutSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully created workout!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullWorkoutSchema',
            },
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
    },
  },
};

const updateWorkout = {
  put: {
    summary: 'Update workout | [ For admin ]',
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
            properties: workoutWithNotRequiredFields,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully created workout!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullWorkoutSchema',
            },
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

const updateVideoInWorkout = {
  put: {
    summary: 'Update video in workout | [ For admin ]',
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
            properties: updateVideoInWorkoutSchema,
          },
        },
      },
    },
    responses: {
      200: {
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
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
    },
  },
};

const deleteWorkout = {
  delete: {
    summary: 'Delete workout | [ For admin ]',
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
        description: 'Successfully deleted workout!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullWorkoutSchema',
            },
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

const getWorkoutsByRangeId = {
  post: {
    summary: 'get workouts by range id | [ For all ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: { workoutIdArr: workoutsRangeId },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully get workouts!',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/fullWorkoutSchema',
              },
              required: true,
            },
          },
        },
      },
      ...errorResponse.notFound,
    },
  },
};

const hrFromWatch = {
  get: {
    summary: 'Update hr from watch',
    tags,
    parameters: [
      {
        name: 'token',
        in: 'query',
        required: true,
      },
      {
        name: 'progressId',
        in: 'query',
        required: true,
      },
      {
        name: 'workoutId',
        in: 'query',
        required: true,
      },
      {
        name: 'dayNumber',
        in: 'query',
        required: true,
      },
      {
        name: 'startFromPart',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Save!',
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
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};

const setCustomThumbnail = {
  put: {
    summary: 'set Thumbnail to the Workout | [ For admin ]',
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
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              customThumbnail: { type: 'string', format: 'binary' },
            },
          },
        },
      },
    },
    responses: {
      200: {
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
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
    },
  },
};

const resetPartAverageHR = {
  put: {
    summary: 'Reset part\'s average heart rate | [ For admin ]',
    tags,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
      {
        name: 'partIndex',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Successfully reset part\'s average HR!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullWorkoutSchema',
            },
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
  [urlPrefix]: Object.assign({}, getWorkoutAll, createWorkout),
  [`${urlPrefix}/all`]: getWorkoutAllForAdmin,
  [`${urlPrefix}/watch`]: hrFromWatch,
  [`${urlPrefix}/range`]: getWorkoutsByRangeId,
  [`${urlPrefix}/{id}`]: Object.assign({}, getWorkoutById, updateWorkout, deleteWorkout),
  [`${urlPrefix}/{id}/video`]: updateVideoInWorkout,
  [`${urlPrefix}/{id}/set-custom-thumbnail`]: setCustomThumbnail,
  [`${urlPrefix}/{id}/parts/{partIndex}/reset-average-hr`]: resetPartAverageHR,
};
