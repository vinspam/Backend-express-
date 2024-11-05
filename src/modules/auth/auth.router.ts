import { Router } from 'express';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';

import * as mapProperty from '../../utils/interfaces';

import * as validate from './auth.validate';
// import * as mapProperty from './auth.interface';
import AuthController from './auth.controller';
import { ROLE } from '../user/user.constant';

export default class AuthRouter {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.routes();
  }

  public routes(): void {
    this.router.post(
      '/sign-up',
      validateSchema(validate.device, mapProperty.deviceInfo),
      validateSchema(validate.signUp, mapProperty.getBody),
      actionHandler(this.authController.signUp, [mapProperty.deviceInfo, mapProperty.getBody])
    );

    this.router.post(
      '/sign-in',
      validateSchema(validate.device, mapProperty.deviceInfo),
      validateSchema(validate.signIn, mapProperty.getBody),
      actionHandler(this.authController.signIn, [mapProperty.deviceInfo, mapProperty.getBody], ROLE.USER)
    );

    this.router.post(
      '/sign-in/admin',
      validateSchema(validate.device, mapProperty.deviceInfo),
      validateSchema(validate.signIn, mapProperty.getBody),
      actionHandler(this.authController.signIn, [mapProperty.deviceInfo, mapProperty.getBody], ROLE.ADMIN)
    );

    this.router.post(
      '/sign-in/temporary',
      validateSchema(validate.signIn, mapProperty.getBody),
      actionHandler(this.authController.createTempToken, [mapProperty.getBody], ROLE.USER)
    );
 
    this.router.post(
      '/sign-in/update-temp-token',
      validateSchema(validate.device, mapProperty.deviceInfo),
      validateSchema(validate.updateToken, mapProperty.getBody),
      actionHandler(this.authController.updateTempTokenWithLongLiveToken, [mapProperty.deviceInfo, mapProperty.getBody], ROLE.USER)
    );

    this.router.post(
      '/update-token',
      validateSchema(validate.device, mapProperty.deviceInfo),
      validateSchema(validate.updateToken, mapProperty.getBody),
      actionHandler(this.authController.updateToken, [mapProperty.deviceInfo, mapProperty.getBody])
    );

    this.router.post(
      '/logout',
      validateSchema(validate.device, mapProperty.deviceInfo),
      actionHandler(this.authController.logout, [mapProperty.deviceInfo, mapProperty.getUserInfo])
    );
  }
}
