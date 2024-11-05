import { Document } from 'mongoose';

export interface IRateWorkoutForRegenerate {
  rate: number;
  answerAfter: number; // answer question after this value
}

export interface IDefaultSetting {
  passedVideoTime: number;
  percentPartForCompleteDay: number;
  countRepeatWorkoutForWeek: number;
  numberRepeatWorkoutInMonth: number;
  needRepeatCountForChangeDiff: number;
  percentOfAboveORBelowForHR: number;
  percentOfSectionAboveForHR: number;
  percentOfSectionBelowForHR: number;
  rateWorkoutForRegenerate: IRateWorkoutForRegenerate[];
}

// HR - heart rate
export interface IDefaultSettingDocument extends Document, IDefaultSetting {}

/* 

  passedVideoTime - сколько нужно посмотреть для того что бы посчиталось что видео просмотрено
  countRepeatWorkoutForWeek - количество повторов воркаутов в неделю

*/
