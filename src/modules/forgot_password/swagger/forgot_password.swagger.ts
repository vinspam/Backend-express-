import generateErrorSchemaForSwagger, * as errorResponse from '../../../utils/swagger/errors';
import { forgotPassword, code, resetPassword } from './forgot_password.schema';
const tags = ['Forgot password'];
const urlPrefix = '/forgot-password';

const forgotPasswordRequest = {
  post: {
    summary: 'Forgot password request',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: forgotPassword,
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
              $ref: '#/components/schemas/forgotPasswordResponseSchema',
            },
          },
        },
      },
      ...errorResponse.badRequest,
    },
  },
};

const checkCode = {
  post: {
    summary: 'Check code',
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
            properties: code,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Check code successful!',
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
      ...generateErrorSchemaForSwagger(400, 'Invalid code'),
      ...errorResponse.notFound,
    },
  },
};

const resetPasswordRequest = {
  post: {
    summary: 'Reset password',
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
            properties: resetPassword,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Reset password successful!',
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
      ...generateErrorSchemaForSwagger(400, 'Error with reset password'),
      ...errorResponse.notFound,
    },
  },
};

export default {
  [urlPrefix]: forgotPasswordRequest,
  [`${urlPrefix}/{id}/check-code`]: checkCode,
  [`${urlPrefix}/{id}/reset`]: resetPasswordRequest,
};
