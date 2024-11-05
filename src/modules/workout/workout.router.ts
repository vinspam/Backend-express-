import { Router } from 'express';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import * as mapProperty from '../../utils/interfaces';
import * as mapPropertyWorkout from './workout.interface';

import WorkoutController from './workout.controller';
import * as validateWorkout from './workout.validate';
import checkPermissions from '../../middleware/checkPermissions';
import { ROLE } from '../user/user.constant';
import sseWorkoutEventsHandler from '../../middleware/sseWorkout';
import { PAYMENT_STATUS } from '../payment/payment.constant';
import { fileHelpers } from '../../utils/helpers';
import addDirForUpload from '../../middleware/addDirForUpload';

export default class WorkoutRouter {
  public router: Router;
  private workoutController: WorkoutController;

  constructor() {
    this.router = Router();
    this.workoutController = new WorkoutController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validateWorkout.listWorkouts, mapProperty.getQuery),
      actionHandler(this.workoutController.getAllWorkouts, [mapProperty.getUserInfo, mapProperty.getQuery])
    );
    this.router.get(
      '/all',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validateWorkout.allWorkouts, mapProperty.getQuery),
      actionHandler(this.workoutController.getAllWorkoutsForAdmin, mapProperty.getQuery)
    );
    this.router.get(
      '/all_workouts',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.workoutController.getAllWorkoutsForAdminWithoutPagination, mapProperty.getQuery)
    );

    this.router.post(
      '/range',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validateWorkout.workoutsIds, mapProperty.getBody),
      actionHandler(this.workoutController.getRangeWorkouts, mapProperty.getBody)
    );

    this.router.get('/watch', sseWorkoutEventsHandler());

    this.router.post(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateWorkout.createWorkout, mapProperty.getBody),
      actionHandler(this.workoutController.createWorkout, mapProperty.getBody)
    );
    this.router.get(
      '/:id',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validateWorkout.Id, mapProperty.getIdFromParams),
      actionHandler(this.workoutController.getWorkoutById, mapProperty.getIdFromParams)
    );
    this.router.put(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateWorkout.Id, mapProperty.getIdFromParams),
      validateSchema(validateWorkout.updateWorkout, mapProperty.getBody),
      actionHandler(this.workoutController.updateWorkout, [mapProperty.getIdFromParams, mapProperty.getBody])
    );
    this.router.put(
      '/:id/video',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateWorkout.Id, mapProperty.getIdFromParams),
      validateSchema(validateWorkout.videoValidation, mapProperty.getBody),
      actionHandler(this.workoutController.updateVideoInWorkout, [mapProperty.getIdFromParams, mapProperty.getBody])
    );

    this.router.put(
      '/:id/set-custom-thumbnail',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateWorkout.Id, mapProperty.getIdFromParams),
      addDirForUpload('workoutThumbnail'),
      fileHelpers.single('customThumbnail'),
      validateSchema(validateWorkout.setThumbnailSchemaValidate, mapPropertyWorkout.getBodyWithFile),
      actionHandler(this.workoutController.setThumbnail, [
        mapProperty.getIdFromParams,
        mapPropertyWorkout.getBodyWithFile,
      ])
    );

    this.router.put(
      '/:id/parts/:partIndex/reset-average-hr',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateWorkout.resetPartAverageHRParams, mapPropertyWorkout.getParamsResetPartAverageHR),
      actionHandler(this.workoutController.resetAverageHR, [mapPropertyWorkout.getParamsResetPartAverageHR])
    );

    this.router.put(
      '/:id/reset-difficulty',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateWorkout.Id, mapProperty.getIdFromParams),
      actionHandler(this.workoutController.resetDifficulty, [mapProperty.getIdFromParams])
    );

    this.router.delete(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateWorkout.Id, mapProperty.getIdFromParams),
      actionHandler(this.workoutController.deleteWorkout, [mapProperty.getIdFromParams, mapProperty.getBody])
    );
  }
}
