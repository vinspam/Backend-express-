import * as errorResponse from '../../../utils/swagger/errors';
import { shortDefaultSettings } from './defaultSettings.schema';

const tags = ['Default settings'];
const urlPrefix = '/default-setting';

const getDefaultSettings = {
  get: {
    summary: 'Get default settings | [ For all ]',
    tags,
    responses: {
      200: {
        description: 'Successfully getting default settings!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/fullDefaultSettingsSchema',
            },
          },
        },
      },
      ...errorResponse.unauthorized,
    },
  },
};

const setDefaultSettings = {
  post: {
    summary: 'Set default settings | [ For admin ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: shortDefaultSettings,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Set default setting successful!',
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

export default {
  [urlPrefix]: Object.assign({}, getDefaultSettings, setDefaultSettings),
};
