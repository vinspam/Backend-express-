import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import checkPermissions from '../../middleware/checkPermissions';

import { BaseRouter } from '../../utils/base';
import * as mapProperty from '../../utils/interfaces';
import * as validations from '../../utils/validations';

import * as mapPropertyExample from './example.interface';
import { ExampleController, CreateExampleSchema, UpdateExampleSchema } from './';
import { ROLE } from '../user/user.constant';

export default class ExampleRouter extends BaseRouter {
  private exampleController: ExampleController;

  constructor() {
    super();

    this.exampleController = new ExampleController();
    this.routes();
  }

  public routes(): void {
    this.router.get('/', checkPermissions(), actionHandler(this.exampleController.getAll));

    this.router.post(
      '/',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(CreateExampleSchema, mapProperty.getBody),
      actionHandler(this.exampleController.create, mapProperty.getBody)
    );

    this.router.get(
      '/name/:name',
      checkPermissions(),
      actionHandler(this.exampleController.getByName, mapProperty.getNameFromParam)
    );

    this.router.get(
      '/:id',
      checkPermissions(),
      validateSchema(validations.byId, mapPropertyExample.getIdFromParamsWithMe),
      validateSchema(CreateExampleSchema, mapProperty.getBody),
      actionHandler(this.exampleController.getById, mapPropertyExample.getIdFromParamsWithMe)
    );

    this.router.put(
      '/:name',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(UpdateExampleSchema, mapProperty.getBody),
      actionHandler(this.exampleController.update, [mapProperty.getNameFromParam, mapProperty.getBody])
    );

    this.router.delete(
      '/:name',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      actionHandler(this.exampleController.delete, mapProperty.getNameFromParam)
    );
  }
}
