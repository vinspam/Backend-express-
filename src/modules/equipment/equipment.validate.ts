import Joi from 'joi';

import { IEquipment } from './equipment.types';

export const equipmentName: Joi.ObjectSchema<IEquipment> = Joi.object({
  name: Joi.string().not().empty().required(),
});
