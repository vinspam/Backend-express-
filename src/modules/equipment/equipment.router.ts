import { Router } from 'express';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import * as mapProperty from '../../utils/interfaces';
import { getNameFromParam } from './equipment.interface';

import EquipmentController from './equipment.controller';
import { equipmentName as validateEquipmentName } from './equipment.validate';
import checkPermissions from '../../middleware/checkPermissions';
import { ROLE } from '../user/user.constant';
import { PAYMENT_STATUS } from '../payment/payment.constant';

export default class EquipmentRouter {
  public router: Router;
  private equipmentController: EquipmentController;

  constructor() {
    this.router = Router();
    this.equipmentController = new EquipmentController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.equipmentController.getAll, mapProperty.getQuery)
    );

    this.router.post(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateEquipmentName, mapProperty.getBody),
      actionHandler(this.equipmentController.create, mapProperty.getBody)
    );
    this.router.get(
      '/:name',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.equipmentController.getByName, getNameFromParam)
    );

    this.router.put(
      '/:name',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateEquipmentName, mapProperty.getBody),
      actionHandler(this.equipmentController.update, [mapProperty.getNameFromParam, mapProperty.getBody])
    );

    this.router.delete(
      '/:name',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.equipmentController.delete, mapProperty.getNameFromParam)
    );
  }
}
