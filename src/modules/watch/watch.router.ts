import { Router } from 'express';
import WatchController from './watch.controller';
import actionHandler from '../../middleware/actionHandler';
import * as mapProperty from '../../utils/interfaces';
import checkPermissions from '../../middleware/checkPermissions';
import validateSchema from '../../middleware/validateSchema';
import * as validate from './watch.validate';
import { PAYMENT_STATUS } from '../payment/payment.constant';

export default class WatchRouter {
  public router: Router;
  private watchController: WatchController;

  constructor() {
    this.router = Router();
    this.watchController = new WatchController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/code',
      validateSchema(validate.codeValidate, mapProperty.getQuery),
      actionHandler(this.watchController.getCode, [mapProperty.getQuery])
    );

    this.router.put(
      '/',
      //validateSchema(validate.codeValidate, mapProperty.getBody),
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.watchController.setWatch, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.put(
      '/heart-rate',
      actionHandler(this.watchController.setHeartRate, [mapProperty.getBody, mapProperty.getUTCFromHeader])
    );
    this.router.put(
      '/add-calorie',
      actionHandler(this.watchController.addUpdateCalorie, [mapProperty.getBody, mapProperty.getUTCFromHeader])
    );

    this.router.delete(
      '/',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.watchController.deleteWatchByUser, [mapProperty.getUserInfo])
    );

    this.router.delete(
      '/unsubscribe',
      validateSchema(validate.watchIdValidate, mapProperty.getBody),
      actionHandler(this.watchController.deleteWatchById, [mapProperty.getBody])
    );

  

    this.router.get('/owner', actionHandler(this.watchController.getOwnerInfo, [mapProperty.getQuery]));
  }
}
