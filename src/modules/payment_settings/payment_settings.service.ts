import { PaymentSettings } from '../../utils/db';
import BaseService from '../../utils/base/service';
import { IFreeSubscribe,IPaymentSettings } from './payment_settings.types';

export default class PaymentSettingsService extends BaseService<IPaymentSettings> {
  constructor() {
    super(PaymentSettings);
  }

  //@todo сюди треба кешування на великий термін
  public getPaymentSettings = async (): Promise<IPaymentSettings> => {
    return this.database.findOne();
  };

  public updatePublicKey = async ({ publicKey }: { publicKey: string }): Promise<any> => {
    return this.database.updateOne({ type: 'stripe' }, { publicKey });
  };

  public updateSecretKey = async ({ secretKey }: { secretKey: string }): Promise<any> => {
    return this.database.updateOne({ type: 'stripe' }, { secretKey });
  };

  public updateFreeSubscribe = async (freeSubscribeInfo: IFreeSubscribe): Promise<any> => {
        return this.database.updateOne({ type: 'stripe' }, { freeSubscribe: freeSubscribeInfo });
      };
  public createDefault = () => {
    return this.database.create({
      publicKey: 'pk_test_51Mt8L3DSt2yJPOpEfwSxbIHHS87v7ZfurQwM0bU9vZH4gfMYirqHqQqosZHbd2xrnJNMHGXT7BD7xuMCGcFC2uX700sc8QetMm',
      secretKey: 'sk_test_51Mt8L3DSt2yJPOpE78P7TNjWTSSO4dwzKlKDVAtaRWLDXsGvB0dJsz1EpC7Dz9JUPa52XBbK16IhbuD1hKpmvbZ500p7w1nNJT',
      prices: [
        {
          priceId: 'price_1Mt8NEDSt2yJPOpEwbgGyHk3',
          trialDays: 3,
          type: 'monthly',
        },
        {
          priceId: 'price_1Mt8NEDSt2yJPOpEwbgGyHk3',
          trialDays: 3,
          type: 'yearly',
        },
      ],
      type: 'stripe',
    });
  };
}
