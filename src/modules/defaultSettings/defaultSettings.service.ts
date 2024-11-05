import BaseService from '../../utils/base/service';
import { DefaultSettings } from '../../utils/db';
import { IDefaultSetting, IDefaultSettingDocument } from './defaultSettings.types';

export default class DefaultSettingsService extends BaseService<IDefaultSettingDocument> {
  constructor() {
    super(DefaultSettings);
  }

  async getDefaultSettings() {
    const defaultSettings = await this.getItem({}, { _id: 0, createdAt: 0, updatedAt: 0 });
    if (!defaultSettings) {
      const ifUnsettledDefaultSettings: IDefaultSetting = {
        passedVideoTime: 0,
        percentPartForCompleteDay: 70,
        countRepeatWorkoutForWeek: 0,
        numberRepeatWorkoutInMonth: 0,
        needRepeatCountForChangeDiff: 2,
        percentOfAboveORBelowForHR: -10,
        percentOfSectionAboveForHR: 10,
        percentOfSectionBelowForHR: 0,
        rateWorkoutForRegenerate: [
          {
            rate: 1,
            answerAfter: 1,
          },
        ],
      };

      return await this.updateOrInsert({}, ifUnsettledDefaultSettings);
    }

    return defaultSettings;
  }
}
