const tags = ['Watch'];
const urlPrefix = '/watch';

const getCode = {
  get: {
    summary: 'get code for link watch and user',
    tags,
    parameters: [
      { name: 'watchId', in: 'query', required: true },
      { name: 'name', in: 'query' },
      { name: 'model', in: 'query' },
    ],
    responses: {
      200: {
        description: 'Successfully get code!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: { type: 'number', example: 4423 },
                name: { type: 'string', example: 'watch name' },
                model: { type: 'string', example: 'watch model' },
              },
            },
          },
        },
      },
      400: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Generate code error' },
              },
            },
          },
        },
        description: 'Generate code error!',
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Get code error' },
              },
            },
          },
        },
        description: 'Error get code!',
      },
    },
  },
};

const getOwnerInfo = {
  get: {
    summary: 'get owner info by watch id',
    tags,
    parameters: [
      {
        name: 'watchId',
        in: 'query',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Successfully get owner info!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userName: { type: 'string', example: 'User Name' },
                userAge:{type: 'date', example: 'Birthday Date'},
                userWeight:{type: 'number', example: 'User Weight'},
                userGender:{type:'string',example:'MALE'}
              },
            },
          },
        },
      },
      404: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Owner not found' },
              },
            },
          },
        },
        description: 'Owner not found!',
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Get owner error' },
              },
            },
          },
        },
        description: 'Get owner error!',
      },
    },
  },
};

const unsubscribeWatch = {
  delete: {
    summary: 'unsubscribe watch by id',
    tags,
    parameters: [
      {
        name: 'watchId',
        in: 'query',
        required: true,
      },
    ],

    responses: {
      200: {
        description: 'Successfully unsubscribe!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'unsubscribe' },
              },
            },
          },
        },
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Unsubscribe error' },
              },
            },
          },
        },
        description: 'Unsubscribe error!',
      },
    },
  },
};

const setWatch = {
  put: {
    summary: 'set watch for user by code',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: { type: 'number', example: 4455 },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully get code!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Save' },
              },
            },
          },
        },
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Save watch error' },
              },
            },
          },
        },
        description: 'Error save watch!',
      },
    },
  },
};

const setHR = {
  put: {
    summary: 'set ht for user watch id',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              watchId: { type: 'string', example: 'asdc23fd1123123' },
              hr: { type: 'number', example: 112 },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully set hr!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Save' },
              },
            },
          },
        },
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Save hr error' },
              },
            },
          },
        },
        description: 'Error save hr!',
      },
    },
  },
};
const setCalorie = {
  put: {
    summary: 'set calorie for user watch id',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              watchId: { type: 'string', example: 'asdc23fd1123123' },
              calorie: { type: 'number', example: 112 },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully set calorie!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Successfully Updated' },
              },
            },
          },
        },
      },
      400: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Progress not found!' },
              },
            },
          },
        },
        description: 'Error save hr!',
      }, 
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Save calorie error' },
              },
            },
          },
        },
        description: 'Error save hr!',
      },
    },
  },
};

const deleteWatch = {
  delete: {
    summary: 'delete watch for user',
    tags,
    responses: {
      200: {
        description: 'Successfully delete watch!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Delete' },
              },
            },
          },
        },
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Delete watch error' },
              },
            },
          },
        },
        description: 'Error delete watch!',
      },
    },
  },
};

export default {
  [`${urlPrefix}/`]: Object.assign({}, setWatch, deleteWatch),
  [`${urlPrefix}/owner`]: Object.assign({}, getOwnerInfo),
  [`${urlPrefix}/unsubscribe`]: Object.assign({}, unsubscribeWatch),
  [`${urlPrefix}/code`]: Object.assign({}, getCode),
  [`${urlPrefix}/heart-rate`]: Object.assign({}, setHR),
  [`${urlPrefix}/add-calorie`]: Object.assign({}, setCalorie),
};
