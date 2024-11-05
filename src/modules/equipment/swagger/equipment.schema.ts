export const equipment = {
  name: { type: 'string', required: true, unique: true },
};

export const fullEquipmentSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...equipment,
  },
};
