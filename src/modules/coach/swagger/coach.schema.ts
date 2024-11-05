export const coachSchema = {
  name: { type: 'string', required: true },
};

export const fullCoachSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...coachSchema,
  },
};
