import { Schema, model } from 'mongoose';
import { IPaymentSettings } from './payment_settings.types';

const PaymentSettingsSchema = new Schema<IPaymentSettings>({
  publicKey: {
    type: String,
  },
  secretKey: {
    type: String,
  },
  prices: [],
  type: {
    type: String,
  },
  freeSubscribe: {
    available: {
      type: Boolean,
      default: false,
    },
    priceId: {
      type: String,
      default: '',
    },
    payment: {
      card: { type: String },
      cvc: { type: String },
      expireMonth: { type: Number },
      expireYear: { type: Number },
    },
  },
});

export default model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema, 'payment-settings');
