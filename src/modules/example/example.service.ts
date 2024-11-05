// need add model to mongo index file
import { Example } from '../../utils/db';
import BaseService from '../../utils/base/service';

// need add types
import { IExample } from './example.types';

export class ExampleService extends BaseService<IExample> {
  constructor() {
    super(Example);
  }

  // Do,read,write something with DB
  async exampleFunc() {
    return this.database.aggregate([
      // something doing in DB
    ]);
  }
}
