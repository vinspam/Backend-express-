import { Document } from 'mongoose';

export interface IPaymentPrices {
  priceId: string;
  trialDays: number;
  type: string;
}

export interface IFreeSubscribe {
    available: boolean;
    priceId: string;
    payment: {
      card: string;
      cvc: string;
      expireYear: number;
      expireMonth: number;
    };
  }
export interface IPaymentSettings extends Document {
  publicKey: string;
  secretKey: string;
  prices: [IPaymentPrices];
  type: string;
  freeSubscribe: IFreeSubscribe;

}
