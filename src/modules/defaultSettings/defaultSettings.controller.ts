import DefaultSettingsService from './defaultSettings.service';
import { CustomError } from '../../utils/helpers';

export default class DefaultSettingsController {
  private defaultSettingsService: DefaultSettingsService;

  constructor() {
    this.defaultSettingsService = new DefaultSettingsService();
  }

  getDefaultSettings = async () => {
    return this.defaultSettingsService.getDefaultSettings();
  };

  setDefaultSettings = async (settings) => {
    if (!Object.keys(settings).length) {
      throw new CustomError(400, 'Settings is empty');
    }

    await this.defaultSettingsService.updateOrInsert({}, settings);

    return {
      message: 'Success',
    };
  };
}
