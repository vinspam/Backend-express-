import { Schema, model } from 'mongoose';
import { IPayment } from './payment.types';
import { PaymentType } from './payment.constant';

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    payloadData: {
      customerId: {
        type: String,
        required: true,
      },
      haveTrialDays: {
        type: Boolean,
        default: false,
        required: true,
      },
    },
    type: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    },
  },
  { versionKey: false }
);

export default model<IPayment>('Payment', PaymentSchema, 'payments');
