import { Router } from 'express';
import PaymentSettingsController from './payment_settings.controller';
import actionHandler from '../../middleware/actionHandler';
import * as mapProperty from '../../utils/interfaces';
import checkPermissions from '../../middleware/checkPermissions';
import validateSchema from '../../middleware/validateSchema';
import * as validate from './payment_settings.validate';
import { ROLE } from '../user/user.constant';

export default class PaymentSettingsRouter {
  public router: Router;
  private paymentSettingsController: PaymentSettingsController;

  constructor() {
    this.router = Router();
    this.paymentSettingsController = new PaymentSettingsController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/stripe',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.paymentSettingsController.getPaymentSettings)
    );

    this.router.get('/stripe/public-key', actionHandler(this.paymentSettingsController.getPublicKey));

    this.router.put(
      '/stripe/public-key',
      validateSchema(validate.publicKeyValidate, mapProperty.getBody),
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.paymentSettingsController.updatePublicKey, mapProperty.getBody)
    );

    this.router.put(
      '/stripe/secret-key',
      validateSchema(validate.secretKeyValidate, mapProperty.getBody),
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.paymentSettingsController.updateSecretKey, mapProperty.getBody)
    );
    this.router.put(
            '/stripe/free-subscribe',
            validateSchema(validate.updateFreeSubscribe, mapProperty.getBody),
            checkPermissions({ roles: [ROLE.ADMIN] }),
            actionHandler(this.paymentSettingsController.updateFreeSubscribe, [mapProperty.getBody])
          );
      
    this.router.get(
      '/stripe/free-subscribe',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.paymentSettingsController.getFreeSubscribe)
    );
    this.router.put(
      '/stripe/price/:id',
      validateSchema(validate.updatePrice, mapProperty.getBody),
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.paymentSettingsController.updatePrice, [mapProperty.getIdFromParams, mapProperty.getBody])
    );
  }
}
