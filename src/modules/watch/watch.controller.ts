import { URL } from 'url';

import { CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';
import { BASE_URL } from '../../config';

import WatchService from './watch.service';
import UserService from '../user/user.service';
import WorkoutSse from '../workout/workout.sse';
import ProgressService from '../progress/progress.service';
import WorkoutService from '../workout/workout.service';
import CustomPlanService from '../plan/custom_plan';

import { PLAN_TYPE } from '../plan/plan.constant';

export default class WatchController {
  private watchService: WatchService;
  private localizations: ILocalization;
  private userService: UserService;
  private workoutSse: WorkoutSse;
  private customPlanService: CustomPlanService;
  private progressService: ProgressService;
  private workoutService: WorkoutService;

  constructor() {
    this.watchService = new WatchService();
    this.userService = new UserService();
    this.progressService = new ProgressService();
    this.workoutService = new WorkoutService();
    this.customPlanService = new CustomPlanService();
    this.workoutSse = WorkoutSse.getInstance();
    this.localizations = localizations['en'];
  }

  public getCode = async ({
    watchId,
    name,
    model,
  }: {
    watchId: string;
    name: string;
    model: string;
  }): Promise<{ status: number; payload: { code: number } }> => {
    if (!watchId) {
      throw new CustomError(400, 'Watch id required');
    }

    let ownerInfo;
    try {
      ownerInfo = await this.userService.getItem({ 'watch.id': watchId });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.UPDATE_WATCH_ID_FAIL);
    }

    if (ownerInfo) {
      throw new CustomError(400, 'Watch already connected');
    }

    let validCode;
    let MAX_TRY = 5;

    while (MAX_TRY > 0) {
      const code = Math.floor(1000 + Math.random() * 9000);
      const codes = await this.watchService.checkCode({ code });
      if (!codes) {
        validCode = code;
        MAX_TRY = 0;
      }

      MAX_TRY--;
    }

    if (!validCode) {
      throw new CustomError(400, this.localizations.ERRORS.WATCH.GENERATE_CODE_FAIL);
    }

    try {
      await this.watchService.saveWatch({ watchId, name, model, code: validCode });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.SAVE_WATCH_FAIL);
    }

    return {
      status: 200,
      payload: {
        code: validCode,
      },
    };
  };

  public setWatch = async (
    { userId }: { userId: string },
    { code }: { code: number }
  ): Promise<{ status: number; payload: { message: string } }> => {
    let user;
    try {
      user = await this.userService.getItemById(userId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.GET_USER_FAIL);
    }

    if (user?.watch?.id) {
      throw new CustomError(400, this.localizations.ERRORS.WATCH.USER_ALREADY_HAVE_WATCH);
    }

    let watch;
    try {
      watch = await this.watchService.getWatchOnCode({ code });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.GET_WATCH_ON_CODE_FAIL);
    }

    if (!watch) {
      throw new CustomError(404, this.localizations.ERRORS.WATCH.WATCH_NOT_EXIST);
    }

    try {
      await this.userService.update(
        { _id: userId },
        {
          $set: {
            watch: {
              id: watch.watchId,
              name: watch.name || '',
              model: watch.model || '',
            },
          },
        }
      );

      await this.watchService.deleteById(watch._id);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.UPDATE_WATCH_ID_FAIL);
    }

    // todo: WIP - update user plan and progress prioritizing workouts that are more effective with watch
    // try {
    //   const customPlan = await this.customPlanService.createOrUpdate(userId);

    //   const progress = await this.progressService.getItem({
    //     userId,
    //     active: true,
    //   });
  
    //   if (progress?.type && progress.type === PLAN_TYPE.MY_PLAN) {
    //     await this.progressService.updateProgressByPlan(progress, customPlan);
    //   }
    // } catch (error) {
    //   throw new CustomError(500, this.localizations.ERRORS.OTHER.USER_PLAN_AND_PROGRESS_UPDATE_FAILED);
    // }

    return {
      status: 200,
      payload: {
        message: 'Save',
      },
    };
  };

  public setHeartRate = async (
    {
      hr,
      watchId,
    }: {
      hr: number;
      watchId: string;
    },
    UTC
  ): Promise<{ status: number; payload: { workoutTitle: string } }> => {
    let user;
    try {
      user = await this.userService.getItem({ 'watch.id': watchId });
    } catch (e) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.GET_USER_BY_WATCH_ID_FAIL);
    }

    if (!user) {
      throw new CustomError(400, this.localizations.ERRORS.WATCH.GET_USER_BY_WATCH_ID_FAIL);
    }

    await this.workoutSse.broadcastById(user._id.toString(), hr);

    const userProgress = await this.progressService.getItem({ active: true, userId: user._id });

    const dayIndex = this.progressService.getCurrentDayV2(userProgress, UTC) - 1;

    if (Number.isNaN(dayIndex) || dayIndex < 0) {
      return {
        status: 200,
        payload: {
          workoutTitle: '',
        },
      };
    }

    const workoutId = userProgress?.days?.[dayIndex]?.workout?.id;

    if (!workoutId) {
      return {
        status: 200,
        payload: {
          workoutTitle: workoutId === null ? 'Day Off' : '',
        },
      };
    }

    const workoutInfo = await this.workoutService.getItemById(workoutId);

    return {
      status: 200,
      payload: {
        workoutTitle: workoutInfo.title || '',
      },
    };
  };

  public deleteWatchByUser = async ({
    userId,
  }: {
    userId: string;
  }): Promise<{ status: number; payload: { message: string } }> => {
    try {
      await this.userService.update({ _id: userId }, { watch: null });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.UPDATE_WATCH_ID_FAIL);
    }

    return {
      status: 200,
      payload: {
        message: 'Unsubscribe',
      },
    };
  };

  public deleteWatchById = async ({ watchId }) => {
    try {
      await this.userService.update({ 'watch.id': watchId }, { watch: null });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.UPDATE_WATCH_ID_FAIL);
    }

    return {
      status: 200,
      payload: {
        message: 'Unsubscribe',
      },
    };
  };

  public getOwnerInfo = async ({ watchId }) => {
    let ownerInfo;
    try {
      ownerInfo = await this.userService.getItem({ 'watch.id': watchId });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.UPDATE_WATCH_ID_FAIL);
    }

    if (!ownerInfo) {
      throw new CustomError(404, 'Not Found');
    }
    return {
      userName: ownerInfo.name,
      avatarUrl: ownerInfo.avatar ? new URL(`/static/images/avatars/${ownerInfo.avatar}`, BASE_URL).toString() : null,
      userAge:ownerInfo.birthday??'',
      userWeight:ownerInfo.weight??0,
      userGender:ownerInfo.gender??'MALE'
    };
  };


  public addUpdateCalorie = async (
    {
      calorie,
      watchId,
    }: {
      calorie: number;
      watchId: string;
    },
    UTC
  ): Promise<{ status: number; payload: { message: string } }> => {
    let user;
    try {
      user = await this.userService.getItem({ 'watch.id': watchId });
    } catch (e) {
      throw new CustomError(500, this.localizations.ERRORS.WATCH.GET_USER_BY_WATCH_ID_FAIL);
    }

    if (!user) {
      throw new CustomError(400, this.localizations.ERRORS.WATCH.GET_USER_BY_WATCH_ID_FAIL);
    }

    const userProgress = await this.progressService.getItem({ active: true, userId: user._id });

     const dayIndex = this.progressService.getCurrentDayV2(userProgress, UTC) - 1;
    if (Number.isNaN(dayIndex) || dayIndex < 0) {
      return {
        status: 400,
        payload: {
          message: 'Day not exist',
        },
      };
    }

    const workoutId = userProgress?.days?.[dayIndex]?.workout?.id;

    if (!workoutId) {
      return {
        status: 400,
        payload: {
          message: workoutId === null ? 'Day Off' : '',
        },
      };
    }
   const workoutType:'workout' | 'altWorkout'|null=(userProgress?.days?.[dayIndex]?.workout?.status=='PASSED')?'workout':(userProgress?.days?.[dayIndex]?.altWorkout?.status=='PASSED')?'altWorkout':null;

   if(workoutType==null){
    return {
      status: 400,
      payload: {
        message:'Progress not available'
        },
    }; 
   }
   const workoutAssumedId=userProgress?.days?.[dayIndex]?.[workoutType]?.id;
   const workoutInfo= await this.workoutService.getItemById(workoutAssumedId);
   const defaultCalorie=(workoutInfo?.hr)?workoutInfo?.calory:0;
   userProgress.days[dayIndex][workoutType].calories = calorie;
   const caloriePercent=defaultCalorie?Math.round((calorie/defaultCalorie)*100):0;
   userProgress.days[dayIndex][workoutType].caloriesPercent = caloriePercent>100?100:caloriePercent;
   const updateInfo={[`days.${dayIndex}.${workoutType}`]:userProgress.days[dayIndex][workoutType]}
   await this.progressService.updateById(userProgress._id, updateInfo);

    return {
      status: 200,
      payload: {
        message: 'Successfully Updated',
      },
    };
  };
}
