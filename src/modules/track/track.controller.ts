import { CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../../utils/localizations/localizations.interface';
import TrackService from './track.service';
import logger from '../../utils/logger';
import { ITrack } from './track.types';

export default class TrackController {
 
  private trackService: TrackService;
  private localizations: ILocalization;

  constructor() {
    this.trackService = new TrackService();
    this.localizations = localizations['en'];
  }

  saveTrack = async ({ userId }, info: ITrack): Promise<object> => {
    info.userId = userId
    try{
      await this.trackService.create(info)
      return {
        message: 'Success',
        result : true
      };

    }catch(err){
      console.log(err,'saving track error')
      return {
        message: 'Error',
        result : false
      };
    }
   
  };

 
}
