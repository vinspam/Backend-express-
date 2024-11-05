import actionHandler from '../../middleware/actionHandler';
import checkPermissions from '../../middleware/checkPermissions';

import { BaseRouter } from '../../utils/base';
import * as mapProperty from '../../utils/interfaces';


import { LogsController } from '.';
import { ROLE } from '../user/user.constant';

export default class LogsRouter extends BaseRouter {
  private coachController: LogsController;

  constructor() {
    super();

    this.coachController = new LogsController();
    this.routes();
  }

  public routes(): void {
    this.router.get(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.coachController.list, mapProperty.getQuery)
    );

    this.router.get(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.coachController.get, mapProperty.getIdFromParams)
    );
  }
}
