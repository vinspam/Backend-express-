import { FilterQuery } from 'mongoose';

import { CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';

import EquipmentService from './equipment.service';
import WorkoutService from '../workout/workout.service';
import { IEquipment } from './equipment.types';

export default class EquipmentController {
  private equipmentService: EquipmentService;
  private workoutService: WorkoutService;
  private localizations: ILocalization;

  constructor() {
    this.equipmentService = new EquipmentService();
    this.workoutService = new WorkoutService();
    this.localizations = localizations['en'];
  }

  public getAll = async ({ text }) => {
    const filter: FilterQuery<IEquipment> = {};
    if (text) {
      const regexp = new RegExp(text.split(/ +/).join('| ?'), 'i');
      filter['$or'] = [{ name: { $regex: regexp } }];
    }

    const [equipments, count] = await Promise.all([
      this.equipmentService.get(filter),
      this.equipmentService.getCount(filter),
    ]);

    return {
      item: equipments,
      count,
    };
  };

  public getByName = async (name) => {
    const equipment = await this.equipmentService.getItem({ name });

    if (!equipment) throw new CustomError(404, this.localizations.ERRORS.EQUIPMENT.NOT_FOUND);

    return equipment;
  };

  public create = async (equipment) => {
    try {
      return await this.equipmentService.create(equipment);
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(409, this.localizations.ERRORS.OTHER.CONFLICT);
      }

      throw new Error(this.localizations.ERRORS.OTHER.SOMETHING_WENT_WRONG);
    }
  };

  public update = async (name, equipmentData) => {
    try {
      const equipment = await this.equipmentService.update({ name }, equipmentData);

      if (!equipment) throw new CustomError(404, this.localizations.ERRORS.EQUIPMENT.NOT_FOUND);

      return equipment;
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(409, this.localizations.ERRORS.OTHER.CONFLICT);
      } else if (error.status) {
        throw new CustomError(error.status, error.message);
      } else {
        throw new Error(this.localizations.ERRORS.OTHER.SOMETHING_WENT_WRONG);
      }
    }
  };

  public delete = async (name) => {
    const equipment = await this.equipmentService.delete({ name });

    if (!equipment) throw new CustomError(404, this.localizations.ERRORS.EQUIPMENT.NOT_FOUND);

    await this.workoutService.removeEquipments(name);

    return equipment;
  };
}
