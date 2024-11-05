import { Equipment } from '../../utils/db';
import BaseService from '../../utils/base/service';
import { IEquipment } from './equipment.types';

export default class EquipmentService extends BaseService<IEquipment> {
  constructor() {
    super(Equipment);
  }

  areAllOfEquipmentsExist = async (names: string[]) => {
    const foundEquipment = await this.getCount({ name: { $in: names } });
    return foundEquipment === names.length;
  };
}
