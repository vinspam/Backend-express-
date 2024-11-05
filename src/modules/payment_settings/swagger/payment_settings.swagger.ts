import * as errorResponse from '../../../utils/swagger/errors';

const tags = ['Payment-settings'];
const urlPrefix = '/payment-setting';

const getStripeSettings = {
  get: {
    summary: 'get stripe settings | [ By Admin ]',
    tags,
    responses: {
      200: {
        description: 'Successfully get stripe settings!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  example: '6244229218562049260a8681',
                },
                publicKey: {
                  type: 'string',
                  example: 'pk_test_CukxeTBzwIJjw6gNlJMu75wv00KcwOTbYx',
                },
                secretKey: {
                  type: 'string',
                  example: 'sk_test_yiTDfnymdp8ragq6NM7zAXnY00mw3hHnt1',
                },
                type: {
                  type: 'string',
                  example: 'stripe',
                },
                prices: {
                  type: 'array',
                  items: {
                    properties: {
                      priceId: {
                        type: 'string',
                        example: 'price_1KfiUoHg9aJN9B0bIhepyu7b',
                      },
                      trialDays: {
                        type: 'number',
                        example: 3,
                      },
                      type: {
                        type: 'string',
                        example: 'yearly',
                      },
                    },
                  },
                },
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
                error: { type: 'string', example: 'Get payment settings error' },
              },
            },
          },
        },
        description: 'Get payment settings error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const getPublicKey = {
  get: {
    summary: 'get stripe publicKey | [ By User ]',
    tags,
    responses: {
      200: {
        description: 'Successfully get stripe public key!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                publicKey: {
                  type: 'string',
                  example: 'pk_test_CukxeTBzwIJjw6gNlJMu75wv00KcwOTbYx',
                },
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
                error: { type: 'string', example: 'Get payment settings error' },
              },
            },
          },
        },
        description: 'Get payment settings error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const updatePublicKey = {
  put: {
    summary: 'update stripe public key | [ By Admin ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              publicKey: { type: 'string', example: 'pk_test_CukxeTBzwIJjw6gNlJMu75wv00KcwOTbYx' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully update stripe public key!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Update',
                },
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
                error: { type: 'string', example: 'Get payment settings error' },
              },
            },
          },
        },
        description: 'Get payment settings error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const updateFreeSubscribe = {
  put: {
    summary: 'update free subscribe public key | [ By Admin ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              available: { type: 'boolean', default: false },
              priceId: { type: 'string', default: '' },
              payment: {
                type: 'object',
                properties: {
                  card: { type: 'string', default: '' },
                  cvc: { type: 'string', default: '' },
                  expireYear: { type: 'number', default: 0 },
                  expireMonth: { type: 'number', default: 0 },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully update free subscribe!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Update',
                },
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
                error: { type: 'string', example: 'Get payment settings error' },
              },
            },
          },
        },
        description: 'Get payment settings error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const getFreeSubscribe = {
  get: {
    summary: 'get free subscribe | [ By Admin ]',
    tags,
    responses: {
      200: {
        description: 'Successfully update free subscribe!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {},
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
                error: { type: 'string', example: 'Get payment settings error' },
              },
            },
          },
        },
        description: 'Get payment settings error!',
      },
      ...errorResponse.unauthorized,
    },
  },
 };
const updateSecretKey = {
  put: {
    summary: 'update stripe secret key | [ By Admin ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              secretKey: { type: 'string', example: 'sk_test_yiTDfnymdp8ragq6NM7zAXnY00mw3hHnt1' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully update stripe secret key!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Update',
                },
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
                error: { type: 'string', example: 'Get payment settings error' },
              },
            },
          },
        },
        description: 'Get payment settings error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const updatePrice = {
  put: {
    summary: 'update price | [ By Admin ]',
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
            properties: {
              trialDays: { type: 'number', example: 3 },
              newPriceId: { type: 'string', example: 'price_1KfiUoHg9aJN9B0bNxkOwz9s' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully update trial days!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Update',
                },
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
                error: { type: 'string', example: 'Update price error' },
              },
            },
          },
        },
        description: 'Update price error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

export default {
  [`${urlPrefix}/stripe`]: Object.assign({}, getStripeSettings),
  [`${urlPrefix}/stripe/secret-key`]: Object.assign({}, updateSecretKey),
  [`${urlPrefix}/stripe/public-key`]: Object.assign({}, updatePublicKey, getPublicKey),
  [`${urlPrefix}/stripe/price/{id}`]: Object.assign({}, updatePrice),
  [`${urlPrefix}/stripe/free-subscribe`]: Object.assign({}, updateFreeSubscribe, getFreeSubscribe),

};
