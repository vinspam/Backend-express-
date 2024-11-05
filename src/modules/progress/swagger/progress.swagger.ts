import * as errorResponse from '../../../utils/swagger/errors';
import {
  progressActionSchema,
  progressChangeDate,
  progressInfoV2,
  progressRemovePart,
  progressWorkoutByDate,
  progressWorkoutDates,
  progressWorkoutDateSchema,
  progressWorkoutSchema,
  resetDaySchema,
  saveUserRateForProgressSchema,
} from './progress.schema';
import { WEEK_STATUS_TYPE } from '../progress.constant';

const tags = ['Progress'];
const urlPrefix = '/progress';

const saveProgressV2 = {
  post: {
    summary: 'Save progress in workout | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: progressInfoV2,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully save progress!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                isPopupShow: { type: 'boolean', example: true },
                status: { type: 'string', default: WEEK_STATUS_TYPE.NO_PASSED },
                message: { type: 'string', default: 'Success' },
                nextPart: {
                  type: 'object',
                  properties: {
                    available: { type: 'boolean', example: true },
                    index: { type: 'number', example: 1 },
                    node: { type: 'string', example: 'MEDIUM' },
                  },
                },
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

const saveUserRateForProgress = {
  post: {
    summary: 'calculate progress by user rate | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: saveUserRateForProgressSchema,
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully change difficulty!',
        content: {
          'application/json': {
            schema: progressActionSchema,
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};

const changeDateProgress = {
  post: {
    summary: 'Change date in progress | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: progressChangeDate,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully save progress!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', default: 'Success' },
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

const changeDifficulty = {
  post: {
    summary: 'Change difficulty | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: progressActionSchema,
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully change difficulty!',
        content: {
          'application/json': {
            schema: progressActionSchema,
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};

const getProgress = {
  get: {
    summary: 'Get progress | [ For user ]',
    tags,
    responses: {
      200: {
        description: 'Successfully get progress!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/progressSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
    },
  },
};

const resetDay = {
  put: {
    summary: 'Reset day in progress | [ For admin (only testers or dev using) ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: resetDaySchema,
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully reset day in progress!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', default: 'Nice' },
              },
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

const removePart = {
  patch: {
    summary: 'Remove part from progress | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: progressRemovePart,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully remove part from progress!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', default: 'Success' },
                status: { type: 'string', default: WEEK_STATUS_TYPE.NO_PASSED },
                isPopupShow: { type: 'boolean', example: true },
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

const workoutByDate = {
  post: {
    summary: 'Get Workout Progress By Date | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: progressWorkoutByDate ,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully fetched the progress workouts by date!',
        content: {
          'application/json': {
            schema: progressWorkoutSchema
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};
const workoutByDates = {
  post: {
    summary: 'Get Workout Progress Dates | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: progressWorkoutDates ,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully fetched the progress workouts by date!',
        content: {
          'application/json': {
            schema: progressWorkoutDateSchema
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};

export default {
  [`${urlPrefix}/current`]: getProgress,
  [`${urlPrefix}/save-v2`]: saveProgressV2,
  [`${urlPrefix}/save-user-rate`]: saveUserRateForProgress,
  [`${urlPrefix}/change-date`]: changeDateProgress,
  [`${urlPrefix}/change-difficulty`]: changeDifficulty,
  [`${urlPrefix}/reset-day`]: resetDay,
  [`${urlPrefix}/remove-part`]: removePart,
  [`${urlPrefix}/get-completed-workout`]:workoutByDate,
  [`${urlPrefix}/get-completed-workout-dates`]:workoutByDates

};
