import { Watch } from '../../utils/db';
import BaseService from '../../utils/base/service';
import { IWatch } from './watch.types';

export default class WatchService extends BaseService<IWatch> {
  constructor() {
    super(Watch);
  }

  public checkCode = async ({ code }) => {
    const date = new Date();
    const expireDate = date.getTime();

    return this.database.findOne({ code, expireDate: { $gt: expireDate } });
  };

  public saveWatch = async ({ watchId, name, model, code }) => {
    const date = new Date();
    const expireDate = date.getTime() + 60 * 5 * 1000;

    return this.database.create({ watchId, name: name || '', model: model || '', code, expireDate: expireDate });
  };

  public getWatchOnCode = async ({ code }) => {
    const date = new Date();
    const expireDate = date.getTime();

    return this.database.findOne({ code, expireDate: { $gt: expireDate } }).sort({ expiredDate: 1 });
  };
}
