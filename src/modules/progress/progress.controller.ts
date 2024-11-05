import { CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';

import ProgressService, { ProgressWorkoutUpdateService, ProgressUpdateService } from './progress.service';
import PlanService from '../plan/plan.service';
import WorkoutService from '../workout/workout.service';
import PartService from '../workout/service/part.service';
import UserService from '../user/user.service';
import DefaultSettingsService from '../defaultSettings/defaultSettings.service';
import CustomPlan from '../plan/custom_plan';

import { IProgress, IProgressDay, IProgressInfoV2, IRemovePartInfo, IUpdateViewTimeInfo } from './progress.types';
import { ACTION_LIST, WEEK_STATUS_TYPE } from './progress.constant';
import { PLAN_TYPE } from '../plan/plan.constant';
import { NodeDifficult } from '../workout/workout.constant';

import logger from '../../utils/logger';

export default class ProcessController {
  private progressService: ProgressService;
  private planService: PlanService;
  private workoutService: WorkoutService;
  private partService: PartService;
  private userService: UserService;
  private defaultSettingsService: DefaultSettingsService;

  private customPlan: CustomPlan;
  private localizations: ILocalization;

  constructor() {
    this.progressService = new ProgressService();
    this.planService = new PlanService();
    this.workoutService = new WorkoutService();
    this.partService = new PartService();
    this.userService = new UserService();
    this.defaultSettingsService = new DefaultSettingsService();

    this.customPlan = new CustomPlan();
    this.localizations = localizations['en'];
  }

  saveV2 = async ({ userId }, info: IProgressInfoV2) => {
    const workout = await this.workoutService.getItemById(info.workoutId);

    if (!workout) {
      throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);
    }

    const videoPart = workout.video.parts[info.partIndex];

    if (!videoPart) {
      throw new CustomError(404, 'Part with current partIndex not found for this workout');
    }

    const videoPartNode = videoPart.nodes.find((node) => node.difficult === info.completeDifficult);

    if (!videoPartNode) {
      throw new CustomError(400, '');
    }
    let progress = await this.progressService.getItem({
      userId,
      active: true,
    });

    if (!progress) {
      throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_JOIN_TO_PLAN);
    }

    const dayIndex = progress.days.findIndex((el) => el.day === Number(info.day));
    if (dayIndex === -1) {
      throw new CustomError(404, 'Day is not found in this progress');
    }

    const currentDay = progress.days[dayIndex];
    let workoutType: 'workout' | 'altWorkout';
    if (currentDay.workout.id.toString() === info.workoutId) {
      workoutType = 'workout';
    } else if (currentDay.altWorkout.id.toString() === info.workoutId) {
      workoutType = 'altWorkout';
    } else {
      throw new CustomError(404, this.localizations.ERRORS.PROGRESS.WORKOUT_NOT_FOUND_ON_DAY)
    }

    const completeParts = progress.days[dayIndex][workoutType].parts;
    if (completeParts.find((completePart) => completePart.partIndex === Number(info.partIndex))) {
      throw new CustomError(400, 'This node already complete');
    }

    completeParts.push({
      partIndex: info.partIndex,
      completedDifficult: info.completeDifficult,
      nextDifficult: info.nextDifficult || NodeDifficult.MEDIUM,
      completedHR : info.userHR || 0
    });

    const updateVideoNodeString = { [`days.${dayIndex}.${workoutType}.parts`]: completeParts };
    await this.progressService.update({ _id: progress._id }, updateVideoNodeString);

    const defaultSettings = await this.defaultSettingsService.getDefaultSettings();
    const percentPartForCompleteDay = defaultSettings.percentPartForCompleteDay || 70;

    const partsInWorkout = workout?.video?.parts?.length;
    const progressDayPercent = partsInWorkout ? Math.round((completeParts.length / partsInWorkout) * 100) : 0;
    currentDay[workoutType].percent = progressDayPercent > 100 ? 100 : progressDayPercent;

    const currentViewedTime = currentDay[workoutType].viewedTime || 0;

    let newViewedTime = Number(currentViewedTime + videoPartNode.timeEnd - videoPartNode.timeStart);
    if (!newViewedTime) {
      newViewedTime = currentViewedTime;
    }

    currentDay[workoutType].viewedTime = newViewedTime;

    if (currentDay[workoutType].percent > percentPartForCompleteDay) {
      currentDay[workoutType].completedDate = new Date();
      currentDay[workoutType].status = WEEK_STATUS_TYPE.PASSED;
      currentDay.status = WEEK_STATUS_TYPE.PASSED;
    }

    if (info.ratePrediction) {
      currentDay[workoutType].ratePrediction = info.ratePrediction;
    }

    const updateDayInfo = { [`days.${dayIndex}`]: currentDay };
    progress = await this.progressService.updateById(progress._id, updateDayInfo);

    if (currentDay.status === WEEK_STATUS_TYPE.PASSED) {
      const currentDayNum = this.progressService.getCurrentDayV2(progress);
      const lastDayNum = this.progressService.getLastDay(progress.days);
      if (currentDayNum >= lastDayNum) await this._updateProgress(progress);
    }

    const nextPartIndex = info.partIndex + 1;
    const nextPartInfo = workout?.video?.parts[nextPartIndex];

    let popupCount = progress?.popupCount;
    if (isNaN(popupCount)) {
      popupCount = 5;
    }

    if (info.userHR) {
      try {
        await this.partService.updatePartAvgHR(info.workoutId, info.partIndex, info.userHR);
      } catch (error) {
        throw new CustomError(400, this.localizations.ERRORS.WORKOUT.PART_AVG_HR_UPDATE_FAILED);
      }
    }

    if (!nextPartInfo) {
      return {
        message: 'Success',
        status: currentDay.status,
        isPopupShow: currentDay.status === WEEK_STATUS_TYPE.PASSED && popupCount > 0 && progress.type === 'MY_PLAN',
        nextPart: {
          available: false,
        },
      };
    }

    return {
      message: 'Success',
      status: currentDay.status,
      isPopupShow: currentDay.status === WEEK_STATUS_TYPE.PASSED && popupCount > 0 && progress.type === 'MY_PLAN',
      nextPart: {
        available: true,
        index: nextPartIndex,
        node: 'MEDIUM',
      },
    };
  };

  saveUserRate = async ({ userId }, info) => {
    logger.debug(`saveUserRate ${JSON.stringify(info)}`);
    const userRate = Number(info.userRate);
    const starScore = Number(info.like);
    const reason = info.reason

    let action = ACTION_LIST.NONE;

    if (Number.isNaN(userRate)) throw new CustomError(400, 'User rate invalid');
    if (Number.isNaN(starScore)) throw new CustomError(400, 'User rate invalid');

    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });
    
    if (!progress) {
      throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_JOIN_TO_PLAN);
    }

    if (progress.type !== PLAN_TYPE.MY_PLAN) {
      return { action };
    }

    const defaultSettings = await this.defaultSettingsService.getDefaultSettings();
    const needRepeatCountForChangeDiff = defaultSettings?.needRepeatCountForChangeDiff
      ? defaultSettings.needRepeatCountForChangeDiff
      : 2;

    const user = await this.userService.getItemById(userId);
    
    if (!user) {
      throw new CustomError(404, this.localizations.ERRORS.USER.NOT_EXIST);
    }

    const abilityLevel = user.abilityLevel;
    let userDifficultyRate = progress.userDifficultyRate ? progress.userDifficultyRate : 0;
    let workoutDifficultyRate = 0

    let popupCount = progress?.popupCount;
    if (isNaN(popupCount)) {
      popupCount = 5;
    }

    switch (userRate) {
      case 1:
        userDifficultyRate = 0;
        workoutDifficultyRate = -2
        if (popupCount > 0 && abilityLevel < 10) action = ACTION_LIST.SHOW_INCREASE;
        else action = ACTION_LIST.INCREASE;
        break;
      case 2:
        workoutDifficultyRate = -1
        if (userDifficultyRate < 0) userDifficultyRate = 0;
        userDifficultyRate++;

        if (userDifficultyRate === needRepeatCountForChangeDiff) {
          userDifficultyRate = 0;

          if (popupCount > 0 && abilityLevel < 10) action = ACTION_LIST.SHOW_INCREASE;
          else action = ACTION_LIST.INCREASE;
        }
        break;
      case 3:
        userDifficultyRate = 0;
        break;
      case 4:
        workoutDifficultyRate = 1
        if (userDifficultyRate > 0) userDifficultyRate = 0;
        userDifficultyRate--;

        if (userDifficultyRate === -needRepeatCountForChangeDiff) {
          userDifficultyRate = 0;

          if (popupCount > 0 && abilityLevel > 1) action = ACTION_LIST.SHOW_DECREASE;
          else action = ACTION_LIST.DECREASE;
        }
        break;
      case 5:
        userDifficultyRate = 0;
        workoutDifficultyRate = 2
        if (popupCount > 0 && abilityLevel > 1) action = ACTION_LIST.SHOW_DECREASE;
        else action = ACTION_LIST.DECREASE;
        break;
      default:
        throw new CustomError(400, 'User rate invalid');
    }

    const dayIndex = progress.days.findIndex((day) => day.day === Number(info.day));
    const dayInfo = progress.days[dayIndex];
    console.log(dayInfo?.workout?.id, info?.workoutId)
    if (!dayInfo) throw new CustomError(404, 'Day not found in progress');
    let type;
    if (dayInfo?.workout?.id?.toString() === info?.workoutId?.toString()) {
      type = 'workout';
    } else if (dayInfo?.altWorkout?.id?.toString() === info?.workoutId?.toString()) {
      type = 'altWorkout';
    }
    if (!type) throw new CustomError(404, this.localizations.ERRORS.PROGRESS.WORKOUT_NOT_FOUND_ON_DAY)
    
    if (dayInfo?.workout?.rate !== 0 || dayInfo?.altWorkout?.rate !== 0) {
      return { action: ACTION_LIST.NONE };
    }
    
    const progressWorkoutUpdate = new ProgressWorkoutUpdateService(progress._id, dayIndex, type);

    progressWorkoutUpdate.setRate(userRate)
    progressWorkoutUpdate.setScore(starScore)
    progressWorkoutUpdate.setReason(reason)
    progressWorkoutUpdate.setRatedAt(new Date())
    progressWorkoutUpdate.setDifficulty(abilityLevel, workoutDifficultyRate)

    await progressWorkoutUpdate.save();

    const userRatePrediction = progress.days[dayIndex][type].ratePrediction;
    logger.debug(`saveUserRate | userRatePrediction ${userRatePrediction}`);
    const newPercentHeartRate = this.userService.calculatePercentHeartRate(user.percentHeartRate, userRate, userRatePrediction);
    logger.debug(`saveUserRate | new percent ${newPercentHeartRate}`);
    logger.debug(`saveUserRate | has percent changed ${user.percentHeartRate !== newPercentHeartRate}`);
    if (user.percentHeartRate !== newPercentHeartRate) {
      await this.userService.updateById(userId, { percentHeartRate: newPercentHeartRate });
    }

    const progressUpdate = new ProgressUpdateService(progress._id);
    progressUpdate.setUserDifficultyRate(progress.userDifficultyRate, userDifficultyRate)
    progressUpdate.setPopupCount(popupCount);

    await progressUpdate.save();

    if (info?.workoutId) {
      const workout = await this.workoutService.getItemById(info.workoutId);
      
      if (!workout) throw new CustomError(404, 'Workout not found');

      let avgWorkoutRate;
      try {
        avgWorkoutRate = await this.progressService.getWorkoutAverageUserRate(workout._id, workout.difficultyResetAt);
      } catch (error) {
        logger.error(error);
      }

      if (avgWorkoutRate) {
        await this.workoutService.updateWorkoutDifficulty(workout._id, avgWorkoutRate);
      }
    }

    return {
      action,
    };
  };

  getCurrentProgress = async ({ userId }) => {
    return this.progressService.get({
      userId,
      active: true,
    });
  };

  getProgressById = async (progressId) => {
    return this.progressService.getItemById(progressId);
  };


  getCompletedWorkoutByDate=async({userId},date)=>{
    let completedWorkout= await this.progressService.getWorkoutByDate(userId,date);

    return {
      message:"Data Fetched Successfully",
      data:completedWorkout?completedWorkout.days:{}
    };
  }
  getDateOfCompleteWorkout=async({userId},dates)=>{
    let completedWorkoutDate= await this.progressService.getDateOfWorkout(userId,dates);
    let workoutDates={dates:completedWorkoutDate};
    return {
      message:"Data Fetched Successfully",
      data:workoutDates
    };
  }
  changeDate = async ({ userId }, { day }) => {
    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });
    if (!progress) throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_JOIN_TO_PLAN);

    const currentDay = this.progressService.getCurrentDayV2(progress);
    let message = 'currentDay: ' + currentDay + ' change day: ' + day;
    if (currentDay && currentDay < day) {
      for (let index = 0; index < progress.days.length; index++) {
        if (!progress.days[index]) continue;
        if (progress.days[index].day < currentDay) continue;

        if (progress.days[index].day < day) progress.days[index].skipped = true;
        if (progress.days[index].day < day && progress.days[index].status === WEEK_STATUS_TYPE.NO_PASSED) {
          progress.days[index].status = WEEK_STATUS_TYPE.SKIPPED;
        }
      }

      const updateProgress = await this.progressService.updateById(progress._id, progress);
      message = updateProgress ? 'Success' : 'Something wrong with update';

      return { message };
    }
    return { message };
  };

  changeDifficulty = async ({ userId }, { action }: { action: ACTION_LIST }) => {
    if (action !== ACTION_LIST.INCREASE && action !== ACTION_LIST.DECREASE) {
      throw new CustomError(400, 'action must bu INCREASE of DECREASE');
    }

    const delta = action === ACTION_LIST.INCREASE ? 1 : -1;
    const user = await this.userService.getItemById(userId);

    const abilityLevel = user.abilityLevel + delta;

    if (abilityLevel < 1 || abilityLevel > 10) {
      return { action: ACTION_LIST.NONE };
    }

    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });

    if (progress?.type === PLAN_TYPE.MY_PLAN) {
      const custom_plan = await this.customPlan.createOrUpdate(userId, abilityLevel);
      await this.progressService.updateProgressByPlan(progress, custom_plan);
      await this.userService.updateById(userId, { abilityLevel });

      return { action };
    }

    return { action: ACTION_LIST.NONE };
  };

  resetDay = async (body) => {
    const progress = await this.getProgressById(body.progressId);

    if (!progress) throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_FOUND);

    const currentDay = progress.days.find((el) => el.day === body.day);

    let workoutType: 'workout' | 'altWorkout';
    if (currentDay.workout.id?.toString() === body.workoutId) {
      workoutType = 'workout';
    } else if (currentDay.altWorkout.id?.toString() === body.workoutId) {
      workoutType = 'altWorkout';
    } else {
      throw new CustomError(404, this.localizations.ERRORS.PROGRESS.WORKOUT_NOT_FOUND_ON_DAY)
    }

    const dayIndex = currentDay.day - 1;

    await this.progressService.updateById(body.progressId, {
      [`days.${dayIndex}.${workoutType}.parts`]: [],
      [`days.${dayIndex}.${workoutType}.status`]: 'NO_PASSED',
      [`days.${dayIndex}.status`]: 'NO_PASSED',
      [`days.${dayIndex}.${workoutType}.percent`]: 0,
      [`days.${dayIndex}.${workoutType}.viewedTime`]: 0,
      [`days.${dayIndex}.${workoutType}.rate`]: 0,
    });

    return { message: 'Nice' };
  };

  _updateProgress = async (progress: IProgress) => {
    let plan = await this.planService.getItemById(progress.planId);
    if (!plan?.workouts?.length) return;

    if (plan.type === PLAN_TYPE.MY_PLAN) {
      const delta = 1; // increase by 1
      const userId = plan.userId;
      const user = await this.userService.getItemById(userId);

      const abilityLevel = user.abilityLevel + delta;

      if (abilityLevel >= 1 && abilityLevel <= 10) {
        const [customPlan] = await Promise.all([
          await this.customPlan.createOrUpdate(userId, abilityLevel, true),
          this.userService.updateById(userId, { abilityLevel }),
        ]);

        plan = customPlan;
      }
    }

    const days = <Array<IProgressDay>>[];
    for (let indexDay = 0, indexDayInPlan = 0; indexDay < progress.days.length + plan.workouts.length; indexDay++) {
      if (indexDay < progress.days.length) {
        days[indexDay] = progress.days[indexDay];
      } else {
        days[indexDay] = this.progressService.getNewDayByPlan(plan, indexDayInPlan, indexDay);
        indexDayInPlan++;
      }
    }
    await this.progressService.updateById(progress._id, { days });
  };

  removePart = async ({ userId }, info: IRemovePartInfo) => {
    const workout = await this.workoutService.getItemById(info.workoutId);
    if (!workout) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    const videoPart = workout.video.parts[info.partIndex];
    if (!videoPart) throw new CustomError(404, 'Part with current partIndex not found for this workout');

    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });
    if (!progress) throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_JOIN_TO_PLAN);

    const dayIndex = progress.days.findIndex((el) => el.day === Number(info.day));
    if (dayIndex === -1) throw new CustomError(404, 'Day is not found in this progress');

    const currentDay = progress.days[dayIndex];

    let workoutType: 'workout' | 'altWorkout';
    if (currentDay.workout.id.toString() === info.workoutId) workoutType = 'workout';
    else if (currentDay.altWorkout.id.toString() === info.workoutId) workoutType = 'altWorkout';
    else throw new CustomError(404, this.localizations.ERRORS.PROGRESS.WORKOUT_NOT_FOUND_ON_DAY)


    let completeParts = progress.days[dayIndex][workoutType].parts;
    const removedPart = completeParts.find((completePart) => completePart.partIndex === Number(info.partIndex));
    if (!removedPart) throw new CustomError(400, 'Part for remove not fount');
    completeParts = completeParts.filter((completePart) => completePart.partIndex !== Number(info.partIndex));
    currentDay[workoutType].parts = completeParts;

    const defaultSettings = await this.defaultSettingsService.getDefaultSettings();
    const percentPartForCompleteDay = defaultSettings.percentPartForCompleteDay || 70;

    const partsInWorkout = workout?.video?.parts?.length;
    const progressDayPercent = partsInWorkout ? Math.round((completeParts.length / partsInWorkout) * 100) : 0;
    currentDay[workoutType].percent = progressDayPercent > 100 ? 100 : progressDayPercent;

    const currentViewedTime = currentDay[workoutType].viewedTime || 0;

    const videoPartNode = videoPart.nodes.find((node) => node.difficult === removedPart.completedDifficult);
    if (!videoPartNode) throw new CustomError(400, 'Node difficult not fount');

    const videoPartNodeTime = videoPartNode.timeEnd - videoPartNode.timeStart;
    let newViewedTime = Number(currentViewedTime - videoPartNodeTime);
    if (Number.isNaN(newViewedTime)) newViewedTime = currentViewedTime;

    currentDay[workoutType].viewedTime = newViewedTime;

    if (currentDay[workoutType].percent <= percentPartForCompleteDay) {
      currentDay[workoutType].completedDate = null;
      currentDay[workoutType].status = WEEK_STATUS_TYPE.NO_PASSED;
      currentDay.status = WEEK_STATUS_TYPE.NO_PASSED;
    }

    await this.progressService.updateById(progress._id, { [`days.${dayIndex}`]: currentDay });

    let popupCount = progress?.popupCount;
    if (isNaN(popupCount)) {
      popupCount = 5;
    }

    return {
      message: 'Success',
      status: currentDay.status,
      isPopupShow: currentDay.status === WEEK_STATUS_TYPE.PASSED && popupCount > 0 && progress.type === 'MY_PLAN',
    };
  };

  updateViewTime = async ({ userId }, info: IUpdateViewTimeInfo) => {
    const workout = await this.workoutService.getItemById(info.workoutId);
    if (!workout) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    let progress = await this.progressService.getItem({
      userId,
      active: true,
    });
    if (!progress) throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_JOIN_TO_PLAN);

    const dayIndex = progress.days.findIndex((el) => el.day === Number(info.day));
    if (dayIndex === -1) throw new CustomError(404, 'Day is not found in this progress');

    const currentDay = progress.days[dayIndex];

    let workoutType: 'workout' | 'altWorkout';
    if (currentDay.workout.id.toString() === info.workoutId) workoutType = 'workout';
    else if (currentDay.altWorkout.id.toString() === info.workoutId) workoutType = 'altWorkout';
    else throw new CustomError(404, this.localizations.ERRORS.PROGRESS.WORKOUT_NOT_FOUND_ON_DAY)

    currentDay[workoutType].percent = info.progress;
    currentDay[workoutType].viewedTime = Number(info.viewedTime);

    const updateDayInfo = { [`days.${dayIndex}`]: currentDay };
    progress = await this.progressService.updateById(progress._id, updateDayInfo);

    return {
      message: 'Success',
      progress
    };
  }
}
