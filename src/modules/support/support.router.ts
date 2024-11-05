import { Router } from 'express';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import * as mapProperty from '../../utils/interfaces';

import SupportController from './support.controller';
import { supportMessageValidation } from './support.validate';

export default class EquipmentRouter {
  public router: Router;
  private supportController: SupportController;

  constructor() {
    this.router = Router();
    this.supportController = new SupportController();
    this.routes();
  }

  public routes(): void {
    this.router.post(
      '/',
      validateSchema(supportMessageValidation, mapProperty.getBody),
      actionHandler(this.supportController.sendEmail, mapProperty.getBody)
    );
  }
}
