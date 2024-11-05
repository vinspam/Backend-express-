import * as errorResponse from '../../../utils/swagger/errors';
import { fullChallengeViewPlanForWeeks, fullPlan, schemaForTestV2, shortPlanForUserWithIdSchema } from './plan.schema';

const tags = ['Plan'];
const urlPrefix = '/plan';

const getAllPlans = {
  get: {
    summary: 'Get all plan | [ For admin ]',
    tags,
    parameters: [
      {
        name: 'offset',
        in: 'query',
        required: false,
        default: 0,
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        default: 10,
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
        description: 'Successfully get all plans!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/shortPlanWithIdSchema',
                  },
                },
                count: { type: 'number', description: 'count plans in data base' },
              },
            },
          },
        },
      },
      ...errorResponse.unauthorized,
    },
  },
};

const getAllPlansForUser = {
  get: {
    summary: 'Get all plan | [ For user ]',
    tags,
    parameters: [
      {
        name: 'offset',
        in: 'query',
        required: false,
        default: 0,
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        default: 10,
      },
    ],
    responses: {
      200: {
        description: 'Successfully get all plans for user!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                plans: {
                  type: 'array',
                  items: shortPlanForUserWithIdSchema,
                },
                count: { type: 'number', description: 'count plans for user' },
              },
            },
          },
        },
      },
      ...errorResponse.unauthorized,
    },
  },
};

const getPlanByIdForAdmin = {
  get: {
    summary: 'Get plan by id  | [ For admin ]',
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
        description: 'Successfully sending request!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullPlanWithIdSchema',
            },
          },
        },
      },
      ...errorResponse.notFound,
      ...errorResponse.unauthorized,
    },
  },
};

// change schema after new func (Create new schema for this endpoint with new fields)
const viewPlan = {
  get: {
    summary: 'Get plan by id for view plan | [ For all ]',
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
        description: 'Successfully sending request!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullPlanWithIdAndWithWorkoutInfoSchema',
            },
          },
        },
      },
      ...errorResponse.notFound,
      ...errorResponse.unauthorized,
    },
  },
};

const viewPlanWeeks = {
  get: {
    summary: 'Get plan by id for view plan | [ For all ]',
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
        description: 'Successfully sending request!',
        content: {
          'application/json': {
            schema: fullChallengeViewPlanForWeeks,
          },
        },
      },
      ...errorResponse.notFound,
      ...errorResponse.unauthorized,
    },
  },
};

const createPlan = {
  post: {
    summary: 'Create new plan | [ For admin ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: fullPlan,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully sending request!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullPlanWithIdSchema',
            },
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};

const updatePlan = {
  put: {
    summary: 'Update plan | [ For admin ]',
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
            properties: fullPlan,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully sending request!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullPlanWithIdSchema',
            },
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};

const setPicturesForPlan = {
  put: {
    summary: 'set pictures to the plan | [ For admin ]',
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
              thumbnail: { type: 'string', format: 'binary' },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully sending request!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullPlanWithIdSchema',
            },
          },
        },
      },
      ...errorResponse.badRequest,
      ...errorResponse.unauthorized,
    },
  },
};

const deletePlan = {
  delete: {
    summary: 'Delete plan | [ For admin ]',
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
        description: 'Successfully deleted plan!',
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
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
    },
  },
};

const joinToPlan = {
  post: {
    summary: 'Join to plan | [ For user ]',
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
        description: 'Successfully deleted plan!',
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
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
    },
  },
};

const viewPlanForWeek = {
  get: {
    summary: 'View plan for week | [ For user ]',
    tags,
    responses: {
      200: {
        description: 'Successfully view plan for week!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullViewPlanForWeekSchema',
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

const viewPlanForWeekAdmin = {
  get: {
    summary: 'View plan for week | [ For admin ]',
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
        description: 'Successfully view plan for week!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullViewPlanForWeekSchema',
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

const viewPlanForWeeks = {
  get: {
    summary: 'View plan for weeks | [ For user ]',
    tags,
    responses: {
      200: {
        description: 'Successfully view plan for weeks!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullViewPlanForWeeksSchema',
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

const testCustomPlan = {
  get: {
    summary: 'Test generate custom plan without save | [ For admin ( dev & tester) ]',
    tags,
    parameters: [
      {
        name: 'userId',
        in: 'query',
        required: true,
      },
      {
        name: 'abilityLevel',
        in: 'query',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Successfully generate custom plan without save!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullPlanWithIdSchema',
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

const testCustomPlanV2 = {
  get: {
    summary: 'Test generate custom plan without save V2 | [ For admin ( dev & tester) ]',
    tags,
    parameters: [
      {
        name: 'userId',
        in: 'query',
        required: true,
      },
      {
        name: 'abilityLevel',
        in: 'query',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Successfully generate custom plan without save!',
        content: {
          'application/json': {
            schema: schemaForTestV2,
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
  [urlPrefix]: Object.assign({}, getAllPlans, createPlan),
  [`${urlPrefix}/for-user`]: getAllPlansForUser,
  [`${urlPrefix}/{id}`]: Object.assign({}, getPlanByIdForAdmin, updatePlan, deletePlan),
  [`${urlPrefix}/{id}/set-pictures`]: setPicturesForPlan,
  [`${urlPrefix}/{id}/join`]: joinToPlan,
  [`${urlPrefix}/{id}/view`]: viewPlan,
  [`${urlPrefix}/{id}/view-weeks`]: viewPlanWeeks,
  [`${urlPrefix}/week`]: viewPlanForWeek,
  [`${urlPrefix}/{id}/week`]: viewPlanForWeekAdmin,
  [`${urlPrefix}/weeks`]: viewPlanForWeeks,
  [`${urlPrefix}/test-custom`]: testCustomPlan,
  [`${urlPrefix}/test-custom-v2`]: testCustomPlanV2,
};
