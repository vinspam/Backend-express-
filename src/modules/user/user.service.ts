import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongoose';

import { User } from '../../utils/db';
import BaseService from '../../utils/base/service';
import { validateFunc } from '../../utils/validations';

import { IUser } from './user.types';
import * as validateUser from './user.validate';

import logger from '../../utils/logger';

export default class UserService extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  async getHeartRateParams(userId) {
    const user = await this.getItemById(userId);
    return user.percentHeartRate;
  }

  async create(user: IUser) {
    const error = validateFunc(validateUser.full, user);

    if (error) throw new Error(error);

    user.password = await bcrypt.hash(user.password, 10);

    return super.create(user);
  }

  async resetPassword(id: ObjectId, password: string) {
    password = await bcrypt.hash(password, 10);

    return this.updateById(id, { password });
  }

  getDifficulty(tWeak: number, lbs, diffWeigh = 0): number {
    let bufDiff = 4;
    if (lbs > 149 + diffWeigh) {
      return bufDiff;
    }
    if (lbs > 130 + diffWeigh) {
      bufDiff = 5;
    } else {
      bufDiff = 7;
    }
    if (tWeak < 1) {
      bufDiff--;
    }
    return bufDiff;
  }

  calculatePercentHeartRate(percentHeartRate: number, userRate: number, userRatePrediction: number = 3) {
    logger.debug(`calculatePercentHeartRate | params: ${percentHeartRate}, ${userRate}, ${userRatePrediction}`)
    const isRatePredictionNormal = userRatePrediction === 3; 

    if (isRatePredictionNormal && (userRate == 1 || userRate == 2)) {
      logger.debug('calculatePercentHeartRate | first if')
      return percentHeartRate + 10;
    } else if (isRatePredictionNormal && (userRate == 4 || userRate == 5)) {
      logger.debug('calculatePercentHeartRate | second if')
      return percentHeartRate - 10;
    } else if ((userRatePrediction == 1 || userRatePrediction == 2) && (userRate == 3 || userRate == 4 || userRate == 5)) {
      logger.debug('calculatePercentHeartRate | third if')
      return percentHeartRate - 10;
    } else if ((userRatePrediction == 4 || userRatePrediction == 5) && (userRate == 1 || userRate == 2 || userRate == 3)) {
      logger.debug('calculatePercentHeartRate | fourth if')
      return percentHeartRate + 10;
    }

    return percentHeartRate;
  }
}
