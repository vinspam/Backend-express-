import { BaseRouter } from '../../utils/base';
import { fileHelpers } from '../../utils/helpers';
import * as mapProperty from '../../utils/interfaces';
import * as validations from '../../utils/validations';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import checkPermissions from '../../middleware/checkPermissions';
import addDirForUpload from '../../middleware/addDirForUpload';

import PlanController from './plan.controller';
import CustomPlan from './custom_plan';
import * as validate from './plan.validate';
import * as mapPropertyPlan from './plan.interface';
import { ROLE } from '../user/user.constant';
import { PAYMENT_STATUS } from '../payment/payment.constant';

export default class ForgotPasswordRouter extends BaseRouter {
  private planController: PlanController;
  private customPlan: CustomPlan;

  constructor() {
    super();

    this.planController = new PlanController();
    this.customPlan = new CustomPlan();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validations.getListValidation, mapProperty.getQuery),
      actionHandler(this.planController.getAll, mapProperty.getQuery)
    );
    
    this.router.get(
      '/get-basic',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.planController.getBasic, [mapProperty.getUserInfo, mapProperty.getQuery])
    );
    this.router.get(
      '/for-user',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.planController.getAllForUser, [mapProperty.getUserInfo, mapProperty.getQuery])
    );

    this.router.get(
      '/week',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.planController.getWeek, [mapProperty.getUserInfo, mapProperty.getUTCFromHeader])
    );
    this.router.get(
      '/weeks',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.planController.getWeeks, [mapProperty.getUserInfo, mapProperty.getUTCFromHeader])
    );

    this.router.get(
      '/test-custom',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.customPlan.testCustom, mapProperty.getQuery)
    );

    this.router.get(
      '/test-custom-v2',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.customPlan.testCustomV2, mapProperty.getQuery)
    );

    this.router.get(
      '/:id',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      actionHandler(this.planController.getByIdForAdmin, mapProperty.getIdFromParams)
    );

    this.router.get(
      '/:id/view',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      actionHandler(this.planController.getByIdForViewPlan, mapProperty.getIdFromParams)
    );

    this.router.get(
      '/:id/view-weeks',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      actionHandler(this.planController.getByIdForUser, mapProperty.getIdFromParams)
    );

    this.router.get(
      '/:id/week',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      actionHandler(this.planController.getWeekForAdmin, mapProperty.getIdFromParams)
    );

    this.router.post(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validate.planSchemaValidate, mapProperty.getBody),
      actionHandler(this.planController.create, mapProperty.getBody)
    );

    this.router.post(
      '/:id/join',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      actionHandler(this.planController.joinToPlan, [mapProperty.getUserInfo, mapProperty.getIdFromParams])
    );

    this.router.put(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      validateSchema(validate.updatePlanSchemaValidate, mapProperty.getBody),
      actionHandler(this.planController.update, [mapProperty.getIdFromParams, mapProperty.getBody])
    );

    this.router.put(
      '/:id/set-pictures',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      addDirForUpload('plans'),
      fileHelpers.single('thumbnail'),
      validateSchema(validate.setPicturesSchemaValidate, mapPropertyPlan.getBodyWithFile),
      
      actionHandler(this.planController.setPictures, [mapProperty.getIdFromParams, mapPropertyPlan.getBodyWithFile])
    );

    this.router.delete(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      actionHandler(this.planController.delete, mapProperty.getIdFromParams)
    );
  }
}
