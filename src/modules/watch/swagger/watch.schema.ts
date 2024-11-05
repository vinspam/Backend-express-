export const subscribeInfo = {
  id: { type: 'string', required: true },
  currency: { type: 'string', required: true },
  name: { type: 'string', required: true },
  interval: { type: 'string', required: true },
  intervalCount: { type: 'string', required: true },
  price: { type: 'string', required: true },
  trialDays: { type: 'string', required: true },
};

export const getAllSubscriptions = {
  type: 'object',
  properties: {
    monthly: {
      type: 'object',
      required: true,
      properties: {
        ...subscribeInfo,
      },
    },
    yearly: {
      type: 'object',
      required: true,
      properties: {
        ...subscribeInfo,
      },
    },
  },
};
