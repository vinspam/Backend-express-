import { Router } from 'express';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';

import ForgotPasswordController from './forgot_password.controller';
import * as validate from './forgot_password.validate';
import * as mapProperty from '../../utils/interfaces';

export default class ForgotPasswordRouter {
  public router: Router;
  private forgotPasswordController: ForgotPasswordController;

  constructor() {
    this.router = Router();
    this.forgotPasswordController = new ForgotPasswordController();
    this.routes();
  }

  public routes(): void {
    this.router.post(
      '/',
      validateSchema(validate.forgotPassword, mapProperty.getBody),
      actionHandler(this.forgotPasswordController.forgotPassword, mapProperty.getBody)
    );

    this.router.post(
      '/:id/check-code',
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      validateSchema(validate.code, mapProperty.getBody),
      actionHandler(this.forgotPasswordController.checkCode, [mapProperty.getIdFromParams, mapProperty.getBody])
    );

    this.router.post(
      '/:id/reset',
      validateSchema(validate.Id, mapProperty.getIdFromParams),
      validateSchema(validate.resetPassword, mapProperty.getBody),
      actionHandler(this.forgotPasswordController.resetPassword, [mapProperty.getIdFromParams, mapProperty.getBody])
    );
  }
}
