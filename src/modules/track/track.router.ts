import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import checkPermissions from '../../middleware/checkPermissions';
import { BaseRouter } from '../../utils/base';
import TrackController from './track.controller';
import * as validate from './track.validate';
import * as mapProperty from '../../utils/interfaces';
import { PAYMENT_STATUS } from '../payment/payment.constant';

export default class TrackRouter extends BaseRouter {
  private trackController: TrackController;

  constructor() {
    super();
    this.trackController = new TrackController();
    this.routes();
  }

  public routes(): void {
    this.router.post(
      '/',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.saveTrackSchemaValidate, mapProperty.getBody),
      actionHandler(this.trackController.saveTrack, [mapProperty.getUserInfo, mapProperty.getBody])
    );
  }
}
