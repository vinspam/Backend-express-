import { Coach } from '../../utils/db';
import BaseService from '../../utils/base/service';

import { ICoach } from './coach.types';

export class CoachService extends BaseService<ICoach> {
  constructor() {
    super(Coach);
  }
}
