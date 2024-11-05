import { CustomError, getPaginationInfo } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';

import { CoachService, ICoach } from './';

export class CoachController {
  private coachService: CoachService;

  private localizations: ILocalization;
  constructor() {
    this.coachService = new CoachService();

    this.localizations = localizations['en'];
  }

  public getAll = async ({ offset, limit }) => {
    const range = getPaginationInfo({ value: offset, default: 0 }, { value: limit, default: 10 });

    const [item, count] = await Promise.all([
      this.coachService.get({}, {}, { skip: range.offset, limit: range.limit }),
      this.coachService.getCount({}),
    ]);

    return {
      item,
      count,
    };
  };

  public getById = async (coachId) => {
    const coach = await this.coachService.getItemById(coachId);

    if (!coach) throw new CustomError(404, this.localizations.ERRORS.COUCH.NOT_FOUND);

    return coach;
  };

  public create = async (coach: ICoach) => {
    try {
      return await this.coachService.create(coach);
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(409, this.localizations.ERRORS.OTHER.CONFLICT);
      }

      throw new Error(this.localizations.ERRORS.OTHER.SOMETHING_WENT_WRONG);
    }
  };

  public update = async (coachId, coachData: ICoach) => {
    const coach = await this.coachService.updateById(coachId, coachData);

    if (!coach) throw new CustomError(404, this.localizations.ERRORS.COUCH.NOT_FOUND);

    return coach;
  };

  public delete = async (coachId) => {
    const coach = await this.coachService.deleteById(coachId);

    if (!coach) throw new CustomError(404, this.localizations.ERRORS.COUCH.NOT_FOUND);

    return coach;
  };
}
