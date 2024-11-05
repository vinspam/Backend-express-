import * as errorResponse from '../../../utils/swagger/errors';
import { equipment } from './equipment.schema';
const tags = ['Equipment'];
const urlPrefix = '/equipment';

const getEquipmentAll = {
  get: {
    summary: 'get equipment | [ For user ]',
    tags,
    parameters: [
      {
        name: 'text',
        in: 'query',
        required: false,
        default: '',
      },
    ],
    responses: {
      200: {
        description: 'Successfully get all equipment!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/fullEquipmentSchema',
                  },
                },
                count: { type: 'number' },
              },
            },
          },
        },
      },
      ...errorResponse.unauthorized,
    },
  },
};

const getEquipmentByName = {
  get: {
    summary: 'get equipment by name | [ For user ]',
    tags,
    parameters: [
      {
        name: 'name',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Successfully get equipment!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullEquipmentSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.notFound,
    },
  },
};

const createEquipment = {
  post: {
    summary: 'Create equipment | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: equipment,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully created equipment!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullEquipmentSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.conflict,
    },
  },
};

const updateEquipment = {
  put: {
    summary: 'Update equipment | [ For user ]',
    tags,
    parameters: [
      {
        name: 'name',
        in: 'path',
        required: true,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: equipment,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully created equipment!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullEquipmentSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
      ...errorResponse.conflict,
    },
  },
};

const deleteEquipment = {
  delete: {
    summary: 'Delete equipment | [ For user ]',
    tags,
    parameters: [
      {
        name: 'name',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Successfully deleted equipment!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullEquipmentSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
      ...errorResponse.forbidden,
      ...errorResponse.notFound,
    },
  },
};

export default {
  [urlPrefix]: Object.assign({}, getEquipmentAll, createEquipment),
  [`${urlPrefix}/{name}`]: Object.assign({}, getEquipmentByName, updateEquipment, deleteEquipment),
};
