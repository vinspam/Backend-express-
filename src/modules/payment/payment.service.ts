import Stripe from 'stripe';

import { Payment } from '../../utils/db';
import BaseService from '../../utils/base/service';
import { IPayment } from './payment.types';

export default class PaymentService extends BaseService<IPayment> {
  constructor() {
    super(Payment);
  }

  private stripe(secretKey) {
    return new Stripe(secretKey, {
      apiVersion: '2020-08-27',
      typescript: true,
    });
  }

  // keep
  public getCustomerInfo = async (secretKey: string, customerId: string): Promise<Stripe.Response<Stripe.Customer>> => {
    return <Promise<Stripe.Response<Stripe.Customer>>>(
      this.stripe(secretKey).customers.retrieve(customerId, { expand: ['subscriptions'] })
    );
  };

  // keep
  public getCustomerByUserId = async (userId): Promise<{ customerId: string; haveTrialDays: boolean }> => {
    const { payloadData } = await this.database.findOne({ userId });

    return <{ customerId: string; haveTrialDays: boolean }>payloadData;
  };
}
