import { ObjectId } from 'mongoose'
import Stripe from 'stripe';

import { Payment } from '../../../utils/db';
import BaseService from '../../../utils/base/service';
import { IPayment } from '../payment.types';

export default class StripeService extends BaseService<IPayment> {
  constructor() {
    super(Payment);
  }

  private stripe(secretKey) {
    return new Stripe(secretKey, {
      apiVersion: '2020-08-27',
      typescript: true,
    });
  }

  public bindUserIdWithStripe = async (data: IPayment): Promise<IPayment> => {
    return this.database.create(data);
  };

  public createCustomer = async (secretKey: string, { email, name }: { email: string; name: string }) => {
    return this.stripe(secretKey).customers.create({
      name,
      email,
    });
  };

  public getCustomerInfo = async (secretKey: string, customerId: string): Promise<Stripe.Response<Stripe.Customer>> => {
    return <Promise<Stripe.Response<Stripe.Customer>>>(
      this.stripe(secretKey).customers.retrieve(customerId, { expand: ['subscriptions'] })
    );
  };

  public getCustomerByUserId = async (userId): Promise<{ customerId: string; haveTrialDays: boolean }> => {
    const { payloadData } = await this.database.findOne({ userId });

    return <{ customerId: string; haveTrialDays: boolean }>payloadData;
  };

  async replaceCustomer(secretKey: string, userId: string | ObjectId, customerId: string) {
    const payment = await this.database.findOne({ userId })
    const updatedPayment = await this.database.updateOne({ userId }, { $set: { 'payloadData.customerId': customerId }})

    await this.stripe(secretKey).customers.del(payment.payloadData.customerId) 

    return updatedPayment;
  }
  
  public createPaymentMethod = async (
      secretKey: string,
      { cvc, card, expireMonth, expireYear }: { cvc: string; card: string; expireMonth: number; expireYear: number }
    ) => {
      return this.stripe(secretKey).paymentMethods.create({
        type: 'card',
        card: {
          cvc,
          number: card,
          exp_month: expireMonth,
          exp_year: expireYear,
        },
      }
    );
  };

  public createSubscribe = async (paymentSettings, customerId: string, priceId: string, trialDays?: number) => {
    const priceSettings = paymentSettings.prices.find((price) => price.priceId === priceId);

    if (!priceSettings.priceId || typeof priceSettings.trialDays !== 'number') {
      throw new Error('Price id invalid');
    }

    const payment = await this.getItem({ 'payloadData.customerId': customerId });
    const bufTrialDays = payment.payloadData.haveTrialDays ? 0 : priceSettings.trialDays;

    return await this.stripe(paymentSettings.secretKey).subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays ? trialDays : bufTrialDays,
    });
  };

  public createFreeSubscribe = async (paymentSettings, customerId, isChallenge = false) => {
      return await this.stripe(paymentSettings.secretKey).subscriptions.create({
        customer: customerId,
        items: [{ price: paymentSettings.freeSubscribe.priceId }],
        trial_period_days: isChallenge? 0 : 30,
      }
    );
  };

  public getPaymentMethod = async (secretKey: string, customerId: string) => {
    return this.stripe(secretKey)
      .paymentMethods.list({ customer: customerId, type: 'card' })
      .then((response) => response.data);
  };

  public attachPaymentMethod = async (secretKey, paymentMethodId, customerId) => {
    await this.stripe(secretKey).paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  };

  public detachPaymentMethod = async (secretKey, paymentMethodId) => {
    await this.stripe(secretKey).paymentMethods.detach(paymentMethodId);
  };

  public changeDefaultPaymentMethod = async (secretKey, paymentMethodId, customerId) => {
    await this.stripe(secretKey).customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  };

  public getSubscriptions = async (paymentSettings) => {
    const prices = paymentSettings.prices;

    const promises = prices.map((price) => this.stripe(paymentSettings.secretKey).prices.retrieve(price.priceId));

    //@todo переписати на allSettled
    const stripePricesInfo = await Promise.all(promises);

    const result = {};
    prices.forEach((price) => {
      const stripePrice = stripePricesInfo.find((priceInfo) => priceInfo.id === price.priceId);
      console.log(stripePrice)
      Object.assign(result, {
        [price.type]: {
          id: stripePrice.id,
          currency: stripePrice.currency,
          name: stripePrice.nickname,
          interval:  stripePrice.recurring == null ? 0 :stripePrice.recurring.interval,
          intervalCount: stripePrice.recurring == null ? 0 : stripePrice.recurring.interval_count,
          price: stripePrice.unit_amount / 100,
          trialDays: price.trialDays,
        },
      });
    });

    return result;
  };

  public deleteSubscribe = async (secretKey: string, subscribeId: string) => {
    return this.stripe(secretKey).subscriptions.del(subscribeId);
  };

  public unsubscribe = async (secretKey: string, subscribeId: string) => {
    return this.stripe(secretKey).subscriptions.update(subscribeId, {
      cancel_at_period_end: true,
    });
  };
}
