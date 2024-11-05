import { Schema, model } from 'mongoose';
import { IEquipment } from './equipment.types';

const EquipmentSchema = new Schema<IEquipment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false }
);

export default model<IEquipment>('Equipment', EquipmentSchema, 'equipments');
