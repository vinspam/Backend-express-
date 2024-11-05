export const quizAnswersProperties = {
  questionId: { type: 'integer', required: true },
  answer: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'integer', required: false },
        text: { type: 'string', required: false },
      },
    },
  },
};

const userAnswersList = {
  questionId: { type: 'integer', required: true },
  title: { type: 'string', required: false },
  subtitle: { type: 'string', required: true },
  description: { type: 'string', required: true },
  answer: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'integer', required: false },
        text: { type: 'string', required: false },
      },
    },
  },
};

export const userAnswersListSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: userAnswersList,
      },
    },
  },
};

export const quizAnswersSchema = {
  type: 'object',
  properties: {
    answers: {
      type: 'array',
      items: {
        type: 'object',
        properties: quizAnswersProperties,
      },
    },
  },
};
