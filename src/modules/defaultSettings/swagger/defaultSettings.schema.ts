export const shortDefaultSettings = {
  passedVideoTime: { type: 'number', required: false },
  countRepeatWorkoutForWeek: { type: 'number', required: false },
  numberRepeatWorkoutInMonth: { type: 'number', required: false },
  percentPartForCompleteDay: { type: 'number', required: true },
  needRepeatCountForChangeDiff: { type: 'number', required: false },
  percentOfAboveORBelowForHR: { type: 'number', required: false },
  percentOfSectionAboveForHR: { type: 'number', required: false },
  percentOfSectionBelowForHR: { type: 'number', required: false },
  rateWorkoutForRegenerate: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        rate: { type: 'number', required: true, default: 1 },
        answerAfter: { type: 'number', required: true, default: 1 },
      },
    },
    required: false,
  },
};

export const fullDefaultSettingsSchema = {
  type: 'object',
  properties: {
    // _id: { type: 'string', required: true },
    ...shortDefaultSettings,
  },
};
