import * as localizations from '../../utils/localizations';
import ILocalization from '../../utils/localizations/localizations.interface';

import PaymentService from './payment.service';

export default class PaymentController {
  private paymentService: PaymentService;
  private localizations: ILocalization;

  constructor() {
    this.paymentService = new PaymentService();
    this.localizations = localizations['en'];
  }
}
