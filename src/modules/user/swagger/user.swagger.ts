import * as errorResponse from '../../../utils/swagger/errors';
import { GENDER, ROLE, STATUS, ACTION_FOR_SAVED_VIDEO } from '../user.constant';
import { permissionsSchema } from './user.schema';
import { WorkoutBodyPart, WorkoutStyle } from '../../workout/workout.constant';

const getUsers = {
  get: {
    summary: 'get users list | [ For admin ]',
    tags: ['User'],
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
      {
        name: 'text',
        in: 'query',
        required: false,
        default: '',
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
                  items: {
                    $ref: '#/components/schemas/shortUserSchemaWithoutPassword',
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

const editUser = {
  put: {
    summary: 'edit user | [ For user ]',
    tags: ['User'],
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              avatar: { type: 'string', format: 'binary' },
              name: { type: 'string', required: false },
              gender: { type: 'string', enum: Object.keys(GENDER), required: false },
              status: { type: 'string', enum: Object.keys(STATUS), required: false },
              height: { type: 'string', required: false },
              weight: { type: 'number', required: false },
              email: { type: 'string', required: false },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully edit user!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullUserSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
      default: {
        description: 'Error edit user!',
      },
    },
  },
};

const editUserAdmin = {
  put: {
    summary: 'edit user | [ For admin ]',
    tags: ['User'],
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
              avatar: { type: 'string', format: 'binary' },
              name: { type: 'string', required: false },
              gender: { type: 'string', enum: Object.keys(GENDER), required: false },
              role: { type: 'string', enum: Object.keys(ROLE), required: false },
              status: { type: 'string', enum: Object.keys(STATUS), required: false },
              height: { type: 'string', required: false },
              weight: { type: 'number', required: false },
              abilityLevel: { type: 'number', min: 1, max: 10, required: false },
              percentHeartRate: { type: 'number', required: false },
              bodyPartList: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: Object.keys(WorkoutBodyPart),
                },
                required: false,
              },
              workoutStyleList: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: Object.keys(WorkoutStyle),
                },
                required: false,
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully edit user!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullUserSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
      default: {
        description: 'Error edit user!',
      },
    },
  },
};

const getUser = {
  get: {
    summary: 'get user | [ For all ]',
    tags: ['User'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        default: 'me',
        required: true,
        description:
          'if you want to get the data of another user, then pass id, but you need administrator rights,' +
          "if you want to get your data, you can send 'me'",
      },
    ],
    responses: {
      200: {
        description: 'Successfully get user!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullUserSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.notFound,
      default: {
        description: 'Error get user!',
      },
    },
  },
};

const getSavedWorkouts = {
  get: {
    summary: "get user's saved workouts | [ For user ]",
    tags: ['User'],
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
      ...errorResponse.unauthorized,
      default: {
        description: 'Error get user!',
      },
    },
  },
};

const addOrRemoveWorkouts = {
  put: {
    summary: 'Add or remove workout to saved | [ For user ]',
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', required: true, description: 'Workout id' },
              action: { type: 'string', enum: Object.keys(ACTION_FOR_SAVED_VIDEO), required: true },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Logout successful!',
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
      ...errorResponse.notFound,
      default: {
        description: 'Error get user!',
      },
    },
  },
};

const getPermissions = {
  get: {
    summary: 'get all permissions | [ For admin ]',
    tags: ['User'],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: permissionsSchema,
          },
        },
      },
      ...errorResponse.unauthorized,
      default: {
        description: 'Error get permissions!',
      },
    },
  },
};

const getHints = {
  get: {
    summary: 'get hints for user',
    tags: ['User'],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                altWorkout: { type: 'boolean', example: false },
                player: { type: 'boolean', example: false },
                ratePopup: { type: 'boolean', example: false },
                viewPlan: { type: 'boolean', example: false },
                weekData: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      default: {
        description: 'Error get permissions!',
      },
    },
  },
};

const editHints = {
  put: {
    summary: 'update hints for user',
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              altWorkout: { type: 'boolean', example: false },
              player: { type: 'boolean', example: false },
              ratePopup: { type: 'boolean', example: false },
              viewPlan: { type: 'boolean', example: false },
              weekData: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                altWorkout: { type: 'boolean', example: false },
                player: { type: 'boolean', example: false },
                ratePopup: { type: 'boolean', example: false },
                viewPlan: { type: 'boolean', example: false },
                weekData: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      default: {
        description: 'Error get permissions!',
      },
    },
  },
};

export default {
  '/user': getUsers,
  '/user/{id}': Object.assign({}, getUser, editUserAdmin),
  '/user/me': editUser,
  '/user/saved-workouts': Object.assign({}, getSavedWorkouts, addOrRemoveWorkouts),
  '/user/permissions': getPermissions,
  '/user/hints': Object.assign({}, getHints, editHints),
};
