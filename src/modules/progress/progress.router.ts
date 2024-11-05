import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import checkPermissions from '../../middleware/checkPermissions';
import { BaseRouter } from '../../utils/base';
import * as validations from '../../utils/validations';

import ProgressController from './progress.controller';
import * as validate from './progress.validate';
import * as mapProperty from '../../utils/interfaces';
import { ROLE } from '../user/user.constant';
import { PAYMENT_STATUS } from '../payment/payment.constant';

export default class ProgressRouter extends BaseRouter {
  private progressController: ProgressController;

  constructor() {
    super();

    this.progressController = new ProgressController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/current',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.progressController.getCurrentProgress, mapProperty.getUserInfo)
    );

    this.router.post(
      '/save-v2',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.saveProgressV2SchemaValidate, mapProperty.getBody),
      actionHandler(this.progressController.saveV2, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.patch(
      '/remove-part',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.removePartSchemaValidate, mapProperty.getBody),
      actionHandler(this.progressController.removePart, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.post(
      '/save-user-rate',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.saveUserRateValidate, mapProperty.getBody),
      actionHandler(this.progressController.saveUserRate, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.post(
      '/change-difficulty',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.changeDifficultyValidate, mapProperty.getBody),
      actionHandler(this.progressController.changeDifficulty, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.post(
      '/change-date',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.changeDateSchemaValidate, mapProperty.getBody),
      actionHandler(this.progressController.changeDate, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.get(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validations.byId, mapProperty.getIdFromParams),
      actionHandler(this.progressController.getProgressById, mapProperty.getIdFromParams)
    );

    this.router.put(
      '/reset-day',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validate.resetDayValidate, mapProperty.getBody),
      actionHandler(this.progressController.resetDay, mapProperty.getBody)
    );
    
    this.router.post(
      '/get-completed-workout',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.workoutDate, mapProperty.getBody),
      actionHandler(this.progressController.getCompletedWorkoutByDate, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.post(
      '/get-completed-workout-dates',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.workoutDates, mapProperty.getBody),
      actionHandler(this.progressController.getDateOfCompleteWorkout, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.put(
      '/view-time',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.viewTimeSchemaValidate, mapProperty.getBody),
      actionHandler(this.progressController.updateViewTime, [mapProperty.getUserInfo, mapProperty.getBody])
    );
  }
}
