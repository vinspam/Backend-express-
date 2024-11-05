import * as errorResponse from '../../../utils/swagger/errors';

const tags = ['Quiz'];
const urlPrefix = '/quiz';

const getQuiz = {
  get: {
    summary: 'get quiz | [ For user ]',
    tags,
    responses: {
      200: {
        description: 'Successfully get quiz!',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/fullQuizSchema',
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

export default {
  [urlPrefix]: Object.assign({}, getQuiz),
};
