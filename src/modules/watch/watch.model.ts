import { Schema, model } from 'mongoose';

const WatchSchema = new Schema(
  {
    watchId: {
      type: String,
      required: true,
    },
    code: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    model: {
      type: String,
    },
    expireDate: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

export default model('Watch', WatchSchema, 'watches');
