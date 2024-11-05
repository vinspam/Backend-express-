import { Router } from 'express';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';

import DefaultSettingsController from './defaultSettings.controller';
import * as validate from './defaultSettings.validate';
import * as mapProperty from '../../utils/interfaces';
import checkPermissions from '../../middleware/checkPermissions';
import { ROLE } from '../user/user.constant';
import { PAYMENT_STATUS } from '../payment/payment.constant';

export default class DefaultSettingsRouter {
  public router: Router;
  private defaultSettingsController: DefaultSettingsController;

  constructor() {
    this.router = Router();
    this.defaultSettingsController = new DefaultSettingsController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.defaultSettingsController.getDefaultSettings)
    );

    this.router.post(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validate.updateDefaultSettingsValidate, mapProperty.getBody),
      actionHandler(this.defaultSettingsController.setDefaultSettings, mapProperty.getBody)
    );
  }
}
