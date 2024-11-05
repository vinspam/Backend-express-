import { Stripe } from 'stripe';
import { Document, ObjectId } from 'mongoose';
import { PaymentType } from './payment.constant';

export interface IData {
  customerId: string;
  haveTrialDays?: boolean;
}

export interface IPayment extends Document {
  userId: ObjectId | string;
  payloadData: IData;
  type: PaymentType;
}

export interface ISubscribeData {
  id: string;
  price: number;
  currency: string;
  interval: Stripe.Plan.Interval;
  intervalCount: number;
  name: string;
  start: number;
  end: number;
  trialStart: number;
  trialEnd: number;
  status: Stripe.Subscription.Status;
  priceId: string;
  cancelAtPeriodEnd: boolean;
}

export interface IWeeks {
  title: string,
  description: string,
  indexCurrentWeek : number,
  weeksPlan : [[any]],
  completedWeek: any[]
}