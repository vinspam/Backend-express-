import generateErrorSchemaForSwagger, * as errorResponse from '../../../utils/swagger/errors';

const signUp = {
  post: {
    summary: 'sign-up',
    tags: ['Auth'],
    parameters: [
      {
        $ref: '#/components/parameters/deviceId',
      },
      {
        $ref: '#/components/parameters/platform',
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', required: true },
              email: { type: 'string', required: true, example: 'string@gmail.com' },
              password: { type: 'string', required: true },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully auth!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/signUpResponse',
            },
          },
        },
      },
      ...generateErrorSchemaForSwagger(400, 'User not created'),
      ...generateErrorSchemaForSwagger(409, 'User already exists'),
      default: {
        description: 'Error auth!',
      },
    },
  },
};

const signIn = {
  post: {
    summary: 'sign-in',
    tags: ['Auth'],
    parameters: [
      {
        $ref: '#/components/parameters/deviceId',
      },
      {
        $ref: '#/components/parameters/platform',
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', required: true, example: 'string@gmail.com' },
              password: { type: 'string', required: true },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully auth!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/signInResponse',
            },
          },
        },
      },

      ...generateErrorSchemaForSwagger(400, 'Email or password is not valid'),
      default: {
        description: 'Error auth!',
      },
    },
  },
};

const signInUser = JSON.parse(JSON.stringify(signIn));
signInUser.post.summary = 'signIn | [ For user ]';

const signInAdmin = JSON.parse(JSON.stringify(signIn));
signInAdmin.post.summary = 'signIn | [ For admin ]';

const signInUserTemp = {
  post: {
    summary: 'sign-in',
    tags: ['Auth'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', required: true, example: 'string@gmail.com' },
              password: { type: 'string', required: true },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully auth!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/signInTempResponse',
            },
          },
        },
      },

      ...generateErrorSchemaForSwagger(400, 'Email or password is not valid'),
      default: {
        description: 'Error auth!',
      },
    },
  },
};

const updateToken = {
  post: {
    summary: 'update token',
    tags: ['Auth'],
    parameters: [
      {
        $ref: '#/components/parameters/deviceId',
      },
      {
        $ref: '#/components/parameters/platform',
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              refreshToken: { type: 'string', required: true },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully created user!',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/authResponse',
            },
          },
        },
      },
      ...generateErrorSchemaForSwagger(400, 'Refresh token not valid!'),
      ...errorResponse.forbidden,
      default: {
        description: 'Error update token!',
      },
    },
  },
};

const logout = {
  post: {
    summary: 'logout',
    tags: ['Auth'],
    parameters: [
      {
        $ref: '#/components/parameters/deviceId',
      },
      {
        $ref: '#/components/parameters/platform',
      },
    ],
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
      ...generateErrorSchemaForSwagger(400, 'Error logout user'),
      ...errorResponse.unauthorized,
      default: {
        description: 'Error update token!',
      },
    },
  },
};

// todo: create response for endpoint
export default {
  '/auth/sign-up': signUp,
  '/auth/sign-in': signInUser,
  '/auth/sign-in/admin': signInAdmin,
  '/auth/sign-in/temporary': signInUserTemp,
  '/auth/sign-in/update-temp-token': updateToken,
  '/auth/update-token': updateToken,
  '/auth/logout': logout,
};
