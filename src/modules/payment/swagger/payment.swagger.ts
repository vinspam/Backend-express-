import * as errorResponse from '../../../utils/swagger/errors';

const tags = ['Payment'];
const urlPrefix = '/payment-v2';

const getSubscribesAll = {
  get: {
    summary: 'get subscribes | [ By User ]',
    tags,
    parameters: [{ in: 'query', name: 'forUser', type: 'boolean', required: false }],
    responses: {
      200: {
        description: 'Successfully get all subscribe!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                monthly: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'price_1KfiUoHg9aJN9B0bIhepyu7b' },
                    currency: { type: 'string', example: 'usd' },
                    name: { type: 'string', example: 'Premium Monthly Membership' },
                    interval: { type: 'string', example: 'month' },
                    intervalCount: { type: 'number', example: 1 },
                    price: { type: 'number', example: 40.55 },
                    trialDays: { type: 'number', example: 3 },
                  },
                },
                yearly: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'price_1KfiUoHg9aJN9B0bNxkOwz9s' },
                    currency: { type: 'string', example: 'usd' },
                    name: { type: 'string', example: 'Premium Yearly Membership' },
                    interval: { type: 'string', example: 'year' },
                    intervalCount: { type: 'number', example: 1 },
                    price: { type: 'number', example: 270.55 },
                    trialDays: { type: 'number', example: 3 },
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
                error: { type: 'string', example: 'Get subscribe error' },
              },
            },
          },
        },
        description: 'Error get all subscribe!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const getSubscribe = {
  get: {
    summary: 'get user subscribe | [ By User ]',
    tags,
    responses: {
      200: {
        description: 'Successfully get user card!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'sub_1KgPbZHg9aJN9B0beqq3UNMA' },
                price: { type: 'number', example: 270.55 },
                currency: { type: 'string', example: 'usd' },
                interval: { type: 'string', example: 'year' },
                intervalCount: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Premium Yearly Membership' },
                start: { type: 'number', example: 1648024305 },
                end: { type: 'number', example: 1648283505 },
                trialStart: { type: 'number', example: 1648024305 },
                trialEnd: { type: 'number', example: 1648283505 },
                status: { type: 'string', example: 'trialing' },
                cancelAtPeriodEnd: { type: 'boolean', example: true },
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
                error: { type: 'string', example: 'Get customer error' },
              },
            },
          },
        },
        description: 'Error get user cards!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const unsubscribe = {
  put: {
    summary: 'unsubscribe | [ By User ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              subscribeId: { type: 'string', example: 'sub_1KgtW5Hg9aJN9B0bo5LiNZlA' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully unsubscribe subscribe!',
      },
      403: {
        description: 'The subscription does not belong to this user',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'The subscription does not belong to this user' },
              },
            },
          },
        },
      },
      404: {
        description: 'Subscribe not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Subscribe not found' },
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
                error: { type: 'string', example: 'unsubscribe error' },
              },
            },
          },
        },
        description: 'unsubscribe error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const createSubscribe = {
  post: {
    summary: 'Create new subscribe | [ By User ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              priceId: { type: 'string', example: 'price_1KfiUoHg9aJN9B0bNxkOwz9s' },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully create subscribe!',
      },
      400: {
        description: 'User have subscribe',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'User have subscribe' },
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
                error: { type: 'string', example: 'Create subscribe error' },
              },
            },
          },
        },
        description: 'Delete subscribe error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const createSubscribeFree = {
    post: {
      summary: 'Create new free subscribe | [ By User ]',
      tags,
      responses: {
        201: {
          description: 'Successfully create free subscribe!',
        },
        400: {
          description: 'User have subscribe',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'User have subscribe' },
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
                  error: { type: 'string', example: 'Create subscribe error' },
                },
              },
            },
          },
          description: 'Delete subscribe error!',
        },
        ...errorResponse.unauthorized,
      },
    },
  };
  

const attachPaymentMethod = {
  post: {
    summary: 'Attach payment method | [ By User ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              paymentMethodId: { type: 'string', example: 'pm_1Ko8GVHg9aJN9B0bRJ9aebDs' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully attach payment method!',
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Attach payment method error!' },
              },
            },
          },
        },
        description: 'Attach payment method error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const detachPaymentMethod = {
  delete: {
    summary: 'Detach payment method | [ By User ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              paymentMethodId: { type: 'string', example: 'pm_1Ko8GVHg9aJN9B0bRJ9aebDs' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully detach payment method!',
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Detach payment method error!' },
              },
            },
          },
        },
        description: 'Detach payment method error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const changePaymentMethod = {
  put: {
    summary: 'Change default payment method | [ By User ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              paymentMethodId: { type: 'string', example: 'pm_1Ko8GVHg9aJN9B0bRJ9aebDs' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully change default payment method!',
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Change default payment method error!' },
              },
            },
          },
        },
        description: 'Change default payment method error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const replaceCustomer = {
  put: {
    summary: 'Change connected customer in Stripe | [ By User ]',
    tags,
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              customerId: { type: 'string', example: 'cus_OmRdoGNzd3uzkt' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully replaced customer!',
      },
      500: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Replace customer error!' },
              },
            },
          },
        },
        description: 'Replace customer error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

const getPaymentMethod = {
  get: {
    summary: 'Get user payments method | [ By User ]',
    tags,
    responses: {
      200: {
        description: 'Successfully get user payment method!',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'pm_1Ko8GVHg9aJN9B0bRJ9aebDs' },
                  expMonth: { type: 'number', example: 2 },
                  expYear: { type: 'number', example: 2040 },
                  lastNumber: { type: 'string', example: '4242' },
                  brand: { type: 'string', example: 'mastercard' },
                  cvcCheck: { type: 'string', example: 'pass' },
                  default: { type: 'boolean', example: true },
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
                message: { type: 'string', example: 'Change default payment method error!' },
              },
            },
          },
        },
        description: 'Change default payment method error!',
      },
      ...errorResponse.unauthorized,
    },
  },
};

export default {
  [`${urlPrefix}/stripe/`]: Object.assign({}, getSubscribe, createSubscribe, unsubscribe),
  [`${urlPrefix}/stripe/subscribes`]: Object.assign({}, getSubscribesAll),
  [`${urlPrefix}/stripe/free`]: Object.assign({}, createSubscribeFree),
  [`${urlPrefix}/stripe/payment-method`]: Object.assign(
    {},
    getPaymentMethod,
    attachPaymentMethod,
    detachPaymentMethod,
    changePaymentMethod
  ),
  [`${urlPrefix}/stripe/customer`]: Object.assign({}, replaceCustomer),
};
