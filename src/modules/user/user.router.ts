import { BaseRouter } from '../../utils/base';
import { fileHelpers } from '../../utils/helpers';
import * as mapProperty from '../../utils/interfaces';
import * as validations from '../../utils/validations';

import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import checkPermissions from '../../middleware/checkPermissions';
import addDirForUpload from '../../middleware/addDirForUpload';

import UserController from './user.controller';
import * as validateUser from './user.validate';
import * as mapPropertyUser from './user.interface';
import { ROLE } from './user.constant';

export default class UserRouter extends BaseRouter {
  private userController: UserController;

  constructor() {
    super();

    this.userController = new UserController();

    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validations.getListValidation, mapProperty.getQuery),
      actionHandler(this.userController.getUsers, mapProperty.getQuery)
    );

    this.router.get(
      '/permissions',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.userController.getPermissions)
    );

    this.router.get(
      '/saved-workouts',
      checkPermissions(),
      actionHandler(this.userController.getSavedWorkouts, [mapProperty.getUserInfo, mapProperty.getQuery])
    );

    this.router.put(
      '/saved-workouts',
      checkPermissions(),
      validateSchema(validateUser.addOrRemoveSavedVideo, mapProperty.getBody),
      actionHandler(this.userController.addOrRemoveSavedWorkout, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.put(
      '/hints',
      checkPermissions(),
      actionHandler(this.userController.editUserHintById, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.get(
      '/hints',
      checkPermissions(),
      actionHandler(this.userController.getUserHintById, [mapProperty.getUserInfo])
    );

    this.router.get(
      '/:id',
      checkPermissions(),
      validateSchema(validateUser.Id, mapPropertyUser.getId),
      actionHandler(this.userController.getUserById, [
        mapPropertyUser.getId,
        mapProperty.getUserInfo,
        mapProperty.getUTCFromHeader,
      ])
    );

    this.router.put(
      '/me',
      checkPermissions(),
      addDirForUpload('avatars'),
      fileHelpers.single('avatar'),
      validateSchema(validateUser.addition, mapPropertyUser.user),
      actionHandler(this.userController.editUser, [mapPropertyUser.user, mapProperty.getUserInfo])
    );

    this.router.put(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validations.byId, mapPropertyUser.getId),
      addDirForUpload('avatars'),
      fileHelpers.single('avatar'),
      validateSchema(validateUser.additionAdmin, mapPropertyUser.user),
      actionHandler(this.userController.editUserForAdmin, [mapPropertyUser.getId, mapProperty.getBody])
    );

    this.router.delete(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validateUser.Id, mapPropertyUser.getId),
      actionHandler(this.userController.deleteUser, mapPropertyUser.getId)
    );

    this.router.get(
      '/permissions',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.userController.getPermissions)
    );
  }
}
