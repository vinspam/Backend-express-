import { CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';

import PaymentSettingsService from './payment_settings.service';
import {IFreeSubscribe, IPaymentSettings } from './payment_settings.types';

export default class PaymentSettingsController {
  private paymentSettingsService: PaymentSettingsService;
  private localizations: ILocalization;

  constructor() {
    this.paymentSettingsService = new PaymentSettingsService();
    this.localizations = localizations['en'];
  }

  public getPaymentSettings = async (): Promise<IPaymentSettings> => {
    let paymentSettings;
    try {
      paymentSettings = await this.paymentSettingsService.getPaymentSettings();
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT_SETTINGS.GET);
    }

    if (!paymentSettings) {
      paymentSettings = await this.paymentSettingsService.createDefault();
    }

    return paymentSettings;
  };

  public getPublicKey = async (): Promise<{ status: number; payload: { publicKey: string } }> => {
    let paymentSettings;
    try {
      paymentSettings = await this.paymentSettingsService.getPaymentSettings();
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT_SETTINGS.GET);
    }

    return {
      status: 200,
      payload: {
        publicKey: paymentSettings?.publicKey || '',
      },
    };
  };

  public updatePublicKey = async ({
    publicKey,
  }: {
    publicKey: string;
  }): Promise<{ status: number; payload: object }> => {
    try {
      await this.paymentSettingsService.updatePublicKey({ publicKey });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT_SETTINGS.UPDATE_PUBLIC_KEY);
    }

    return {
      status: 200,
      payload: {
        message: 'Update',
      },
    };
  };

  public updateSecretKey = async ({
    secretKey,
  }: {
    secretKey: string;
  }): Promise<{ status: number; payload: object }> => {
    try {
      await this.paymentSettingsService.updateSecretKey({ secretKey });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT_SETTINGS.UPDATE_SECRET_KEY);
    }

    return {
      status: 200,
      payload: {
        message: 'Update',
      },
    };
  };

  public updatePrice = async (priceId, { trialDays, newPriceId }): Promise<{ status: number; payload: object }> => {
    try {
      await this.paymentSettingsService.update(
        { type: 'stripe', 'prices.priceId': priceId },
        {
          $set: {
            'prices.$.priceId': newPriceId,
            'prices.$.trialDays': trialDays,
          },
        }
      );
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }

    return {
      status: 200,
      payload: {
        message: 'Update',
      },
    };
  };

  public getFreeSubscribe = async () => {
    let paymentSettings;
    try {
      paymentSettings = await this.paymentSettingsService.get({ type: 'stripe' }).then((data) => data[0].freeSubscribe);
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }

    const view = {
      available: paymentSettings.available,
      priceId: paymentSettings.priceId,
      payment: {
        cvc: paymentSettings.payment.cvc.replace(/[0-9](?=([0-9]{2}))/g, '*'),
        card: paymentSettings.payment.card.replace(/[0-9](?=([0-9]{4}))/g, '*'),
        expireMonth: paymentSettings.payment.expireMonth,
        expireYear: paymentSettings.payment.expireYear,
      },
    };

    return {
      paymentSetting: view,
    };
  };
  public updateFreeSubscribe = async (freeSubscribeInfo: IFreeSubscribe) => {
    try {
      await this.paymentSettingsService.updateFreeSubscribe(freeSubscribeInfo);
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }

    return {
      status: 200,
      payload: {
        message: 'Update',
      },
    };
  };
}


