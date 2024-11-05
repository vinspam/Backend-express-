import mongoose from 'mongoose';
import { UpdateWriteOpResult } from 'mongoose';

import { Progress } from '../../utils/db';
import BaseService, { BaseUpdateService } from '../../utils/base/service';

import { IProgress, IProgressDay, IProgressWorkout, IProgressWorkoutType } from './progress.types';

import { IPlan } from '../plan/plan.types';
import { ONE_DAY, ONE_HOUR, WEEK_STATUS_TYPE } from './progress.constant';

export default class ProgressService extends BaseService<IProgress> {
  constructor() {
    super(Progress);
  }

  async disabledAllUserPlan(userId): Promise<UpdateWriteOpResult> {
    return this.database.updateMany(
      { userId, active: true },
      {
        $set: {
          active: false,
        },
      }
    );
  }

  async activeUserPlan(userId, plan: IPlan) {
    await this.disabledAllUserPlan(userId);

    const days = <Array<IProgressDay>>[];
    const dayStartStamp = new Date().setHours(0, 0, 0, 0);

    for (let indexDayInPlan = 0; indexDayInPlan < plan.workouts.length; indexDayInPlan++) {
      days[indexDayInPlan] = this.getNewDayByPlan(plan, indexDayInPlan, indexDayInPlan);
    }

    const dateStart = new Date(dayStartStamp);
    const newProgress = <IProgress>{ type: plan.type, userId, planId: plan._id, days, active: true, dateStart };
    return this.create(newProgress);
  }

  firstAfterDone(days: IProgressDay[]): number {
    let firstNoPassedAfterDone = 0;
    let nextNoPassed = true;
    days.forEach((day) => {
      if (nextNoPassed) {
        firstNoPassedAfterDone = day.day;
        nextNoPassed = false;
      }
      if (day.status === WEEK_STATUS_TYPE.PASSED) nextNoPassed = true;
    });
    return firstNoPassedAfterDone;
  }

  getCurrentDayV2(progress: IProgress, UTC = 0): number {
    const lastDoneDay = ProgressService.lastDoneDay(progress.days);
    const firstNoPassedAfterDone = ProgressService.firstNoPassedAfterDone(progress.days);
    console.log(firstNoPassedAfterDone,lastDoneDay)
    // if dayOff, dayOff - first in plan current day must be no pass day (need for normal working)
    if (!lastDoneDay) return firstNoPassedAfterDone;

    const noPass = progress.days.find((day) => day.day === lastDoneDay);
    let dateForPredicate = noPass?.workout?.completedDate
      ? noPass.workout.completedDate
      : noPass?.altWorkout?.completedDate;
    dateForPredicate = dateForPredicate ? dateForPredicate : progress.dateStart;

    const currentDayDate = new Date().setHours(0, 0, 0, 0);
    const dayStamp = new Date(dateForPredicate).setHours(0, 0, 0, 0);
    const diffDayInProgress = Math.round((currentDayDate - dayStamp + UTC * ONE_HOUR) / ONE_DAY);

    const maybeNextDay = lastDoneDay + diffDayInProgress;
    if (diffDayInProgress >= 0 && firstNoPassedAfterDone >= maybeNextDay) {
      const bufDayOffArr = progress.days.filter(
        (day) => day?.day && day.day >= lastDoneDay && day.day < firstNoPassedAfterDone && !day.skipped && (day.status != WEEK_STATUS_TYPE.DAY_OF)
      );
      if (bufDayOffArr[diffDayInProgress]) return bufDayOffArr[diffDayInProgress].day;
    }

    return firstNoPassedAfterDone;
  }

  getLastDay(days: IProgressDay[]): number {
    if (!days?.length) return 0;
    for (let index = days.length - 1; index >= 0; index--) {
      const day = days[index];
      if (!day?.day) continue;
      if (day.status === WEEK_STATUS_TYPE.DAY_OF) continue;
      return day.day;
    }
  }

  async updateProgressByPlan(progress: IProgress, plan: IPlan) {
    const dayNum = ProgressService.lastDoneDay(progress.days);
    
    // day in plan progress 44 in plan 28 its 16 - its next day index
    const dayFromNew = dayNum ? dayNum % plan.workouts.length : 0;

    // if dayNum = plan.workouts.length
    // dayFromNew = dayNum && dayFromNew === 0 ? plan.workouts.length : dayFromNew;
    const days = <Array<IProgressDay>>[];
    const dayInPlan = plan.workouts.length;
    const dayInProgress = progress.days.length;
    for (let indexDay = 0, indexDayInPlan = dayFromNew; indexDay < dayInProgress; indexDay++) {
      if (indexDay < dayNum) days[indexDay] = progress.days[indexDay];
      else {
        if (!dayInPlan) break;
        // for case when previously 28(index 27) day - now 29(index 28) after 30,31,32 (next plan)
        if (indexDayInPlan === dayInPlan && (dayInProgress - indexDay) % dayInPlan === 0) indexDayInPlan = 0;
        if (indexDayInPlan >= dayInPlan) break; // if current plan don`t have enough workout
        days[indexDay] = this.getNewDayByPlan(plan, indexDayInPlan, indexDay);
        indexDayInPlan++;
      }
    }

    await this.updateById(progress._id, { days });
  }

  getNewDayByPlan(plan: IPlan, indexDayInPlan, indexDay): IProgressDay {
    const status = plan.workouts[indexDayInPlan] ? WEEK_STATUS_TYPE.NO_PASSED : WEEK_STATUS_TYPE.DAY_OF;

    const dayProgress = <IProgressDay>{
      day: indexDay + 1,
      status,
    };

    if (plan.workouts[indexDayInPlan])
      dayProgress.workout = <IProgressWorkout>{
        id: plan.workouts[indexDayInPlan],
        status: WEEK_STATUS_TYPE.NO_PASSED,
      };

    if (plan.altWorkouts[indexDayInPlan])
      dayProgress.altWorkout = <IProgressWorkout>{
        id: plan.altWorkouts[indexDayInPlan],
        status: WEEK_STATUS_TYPE.NO_PASSED,
      };

    return dayProgress;
  }

  static firstNoPassedAfterDone(days: IProgressDay[]): number {
    let firstNoPassedAfterDone = 0;
    let nextNoPassed = true;
    days.forEach((day) => {
      if (nextNoPassed && day?.status === WEEK_STATUS_TYPE.NO_PASSED) {
        firstNoPassedAfterDone = day.day;
        nextNoPassed = false;
      }
      if (day.status === WEEK_STATUS_TYPE.PASSED) nextNoPassed = true;
    });
    return firstNoPassedAfterDone ? firstNoPassedAfterDone : days.length;
  }

  static lastDoneDay(days: IProgressDay[]): number {
    let lastDay = 0;
    for (let i = 0; i < days.length; i++) {
      if ((days[i].status == WEEK_STATUS_TYPE.PASSED || days[i].status == WEEK_STATUS_TYPE.SKIPPED ) && days[i].day > lastDay) lastDay = days[i].day;
    }
    return lastDay;
  }

  async getWorkoutByDate(userId,{date}){
      let startDate = new Date(new Date(date).setHours(0,0,0,0));
      let endDate=new Date(new Date(date).setHours(23,59,59,999));

      let query=
      [
        {
          $match:
            {
              userId: new mongoose.Types.ObjectId(userId),
            },
        },
        {
          $replaceWith: {
            days: "$days",
          },
        },
        {
          $unwind: {
            path: "$days",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match:
            
            {
              "days.status": "PASSED",
              $or: [
                {
                  "days.workout.completedDate": {
                    $gte: startDate,
                    $lte: endDate,
                  },
                },
                {
                  "days.altWorkout.completedDate": {
                    $gte: startDate,
                    $lte: endDate,
                  },
                },
              ],
            },
        },
        
      ]
      let completedWorkout = await this.database.aggregate(query);
      return completedWorkout.pop()

  }

  async getDateOfWorkout(userId,{startDate,endDate}){
     startDate = new Date(new Date(startDate).setHours(0,0,0,0));
     endDate=new Date(new Date(endDate).setHours(23,59,59,999));
     
    let query=

    [
      {
        '$match': {
          'userId': new mongoose.Types.ObjectId(userId)
        }
      }, {
        '$replaceWith': {
          'days': '$days'
        }
      }, {
        '$unwind': {
          'path': '$days', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'days.status': 'PASSED', 
          '$or': [
            {
              'days.workout.completedDate': {
                '$gte': startDate, 
                '$lte': endDate
              }
            }, {
              'days.altWorkout.completedDate': {
                '$gte': startDate, 
                '$lte': endDate
              }
            }
          ]
        }
      }, {
        '$replaceWith': {
          'date': {
            '$cond': {
              'if': '$days.workout.completedDate', 
              'then': '$days.workout.completedDate', 
              'else': '$days.altWorkout.completedDate'
            }
          }
        }
      }
    ]
    let completedWorkout = await this.database.aggregate(query);
    return completedWorkout
  }

  private async _getAvgWorkoutDifficulty(workoutId: string, fieldName: 'workout' | 'altWorkout', resetAt: Date = new Date(0)) {
    const result = await this.database.aggregate([
      { $unwind: '$days' },
      { $match: { [`days.${fieldName}`]: { $exists: true } } },
      { $replaceRoot: { newRoot: `$days.${fieldName}` } },
      {
        $match: { 'id': new mongoose.Types.ObjectId(workoutId), 'difficulty': { '$exists': true, }, ratedAt: { $gt: resetAt } }
      },
      { $group: { "_id": new mongoose.Types.ObjectId(workoutId), usersRatedCount: { $sum: 1 }, avgDifficulty: { $avg: "$difficulty" } } },
    ])
    const { usersRatedCount, avgDifficulty } = result[0] || { usersRatedCount: 0, avgDifficulty: 0 };
  
    return [ avgDifficulty, usersRatedCount ];
  }

  public async getWorkoutAverageUserRate(workoutId: string, workoutResetDate?: Date): Promise<number> {
    const [workoutAvgDifficulty, workoutRateCount] = await this._getAvgWorkoutDifficulty(workoutId, 'workout', workoutResetDate);
    const [altWorkoutAvgDifficulty, altWorkoutRateCount] = await this._getAvgWorkoutDifficulty(workoutId, 'altWorkout', workoutResetDate);
    
    const usersRatedCount = workoutRateCount + altWorkoutRateCount;
    const devider = (workoutAvgDifficulty > 0 && altWorkoutAvgDifficulty > 0) ? 2 : 1;
    const avgWorkoutDifficulty = Math.floor(workoutAvgDifficulty + altWorkoutAvgDifficulty / devider);
    
    if (usersRatedCount < 20) {
      throw new Error('Not enough users rated this workout')
    }
    
    return avgWorkoutDifficulty
  }
}

export class ProgressWorkoutUpdateService extends BaseUpdateService<IProgress> {
  private day: number;
  private type: IProgressWorkoutType;

  constructor(id: string, day: number, type: IProgressWorkoutType) {
      super(new ProgressService(), id),

      this.day = day;
      this.type = type;
  }
  public setScore(score : number) {
    const fieldName = `days.${this.day}.${this.type}.score`
    this.setField(fieldName, score)
  }
  public setReason(reason : string) {
    const fieldName = `days.${this.day}.${this.type}.reason`
    this.setField(fieldName, reason)
  }
  public setRate(rate: number) {
      const fieldName = `days.${this.day}.${this.type}.rate`
      this.setField(fieldName, rate)
  }

  public setRatedAt(ratedAt: Date) {
      const fieldName = `days.${this.day}.${this.type}.ratedAt`
      this.setField(fieldName, ratedAt)
  }

  public setDifficulty(abilityLevel: number, workoutDifficultyRate: number) {
      const fieldName = `days.${this.day}.${this.type}.difficulty`
      const difficulty = abilityLevel * workoutDifficultyRate
      this.setField(fieldName, difficulty)
  }

  public setRatePrediction(ratePrediction: number) {
    const fieldName = `days.${this.day}.${this.type}.ratePrediction`
    this.setField(fieldName, ratePrediction)
  }
}

export class ProgressUpdateService extends BaseUpdateService<IProgress> {
  constructor(id: string) {
      super(new ProgressService(), id)
  }

  public setUserDifficultyRate(value: number, newValue: number) {
      if (value !== newValue) {
          this.setField('userDifficultyRate', newValue)
      }
  }

  public setPopupCount(popupCount: number) {
      if (popupCount > 0) {
          this.setField('popupCount', popupCount - 1)
      }
  }
}


