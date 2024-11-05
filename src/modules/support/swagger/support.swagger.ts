import * as errorResponse from '../../../utils/swagger/errors';
import { supportBody } from './support.schema';
const tags = ['Support'];
const urlPrefix = '/support';

const createEquipment = {
  post: {
    summary: 'Send message to support | [ For user ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: supportBody,
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
    },
  },
};

export default {
  [urlPrefix]: createEquipment,
};
