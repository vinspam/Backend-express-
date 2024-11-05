import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import checkPermissions from '../../middleware/checkPermissions';

import { BaseRouter } from '../../utils/base';
import * as mapProperty from '../../utils/interfaces';
import * as validations from '../../utils/validations';

import { CoachController, CreateCoachSchema, UpdateCoachSchema, GetAllCoach } from './';
import { ROLE } from '../user/user.constant';
import { PAYMENT_STATUS } from '../payment/payment.constant';

export default class CoachRouter extends BaseRouter {
  private coachController: CoachController;

  constructor() {
    super();

    this.coachController = new CoachController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(GetAllCoach, mapProperty.getQuery),
      actionHandler(this.coachController.getAll, mapProperty.getQuery)
    );

    this.router.post(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(CreateCoachSchema, mapProperty.getBody),
      actionHandler(this.coachController.create, mapProperty.getBody)
    );

    this.router.get(
      '/:id',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      validateSchema(validations.byId, mapProperty.getIdFromParams),
      actionHandler(this.coachController.getById, mapProperty.getIdFromParams)
    );

    this.router.put(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validations.byId, mapProperty.getIdFromParams),
      validateSchema(UpdateCoachSchema, mapProperty.getBody),
      actionHandler(this.coachController.update, [mapProperty.getIdFromParams, mapProperty.getBody])
    );

    this.router.delete(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.coachController.delete, mapProperty.getIdFromParams)
    );
  }
}
