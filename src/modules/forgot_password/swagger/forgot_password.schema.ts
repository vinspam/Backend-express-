export const forgotPassword = {
  email: { type: 'string', required: true },
};

export const code = {
  code: { type: 'number', required: true },
};

export const resetPassword = {
  ...code,
  password: { type: 'string', required: true },
};

export const forgotPasswordResponseSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
  },
};
