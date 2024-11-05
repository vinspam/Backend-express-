import { CustomError, getPaginationInfo, sliceArr } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';
import { BASE_URL } from '../../config';

import PlanService from './plan.service';
import WorkoutService from '../workout/workout.service';
import ProgressService from '../progress/progress.service';
import UserService from '../user/user.service';
import { IAddPictures, IPlan, IShortPlan } from './plan.types';
import { ONE_DAY, ONE_HOUR, WEEK_STATUS_TYPE } from '../progress/progress.constant';
import { FilterQuery, Types } from 'mongoose';
import url_1 from 'url';
import { COUNT_DAY_FOR_WEEK, PLAN_TYPE } from './plan.constant';
import DefaultSettingsService from '../defaultSettings/defaultSettings.service';

export default class PlanController {
  private planService: PlanService;
  private workoutService: WorkoutService;
  private progressService: ProgressService;
  private userService: UserService;
  private defaultSettingsService: DefaultSettingsService;

  private localizations: ILocalization;

  constructor() {
    this.planService = new PlanService();
    this.workoutService = new WorkoutService();
    this.progressService = new ProgressService();
    this.defaultSettingsService = new DefaultSettingsService();
    this.userService = new UserService();
    this.localizations = localizations['en'];
  }

  getAll = async ({ offset, limit, text }) => {
    const range = getPaginationInfo({ value: offset, default: 0 }, { value: limit, default: 10 });

    const filter: FilterQuery<IPlan> = {};
    if (text) {
      const regexp = new RegExp(text.split(/ +/).join('| ?'), 'i');
      filter['$or'] = [{ title: { $regex: regexp } }, { description: { $regex: regexp } }];
    }

    const [plans, count] = await Promise.all([
      this.planService.get(
        filter,
        {
          title: 1,
          type: 1,
          description: 1,
          difficulty: 1,
          isPrimary: 1,
          createdAt: 1,
          updatedAt: 1,
        },
        { skip: range.offset, limit: range.limit }
      ),
      this.planService.getCount(filter),
    ]);

    return {
      items: plans,
      count,
    };
  };
  getBasic = async() =>{
    try{
      const custom_plan = await this.planService.getItem({  title:'The Basics' });
      return custom_plan
    }catch(err){
      return []
    }
  }
  getAllForUser = async ({ userId }, { offset, limit }) => {
    const range = getPaginationInfo({ value: offset, default: 0 }, { value: limit, default: 10 });

    const plans = await this.planService.getAllPlanForUser({ skip: range.offset, limit: range.limit });
    const count = await this.planService.getCount({ type: PLAN_TYPE.CHALLENGE });
    plans.forEach((plan) => {
      plan.thumbnail = plan.thumbnailName
        ? new url_1.URL(`/static/images/plans/${plan.thumbnailName}`, BASE_URL).toString()
        : plan.thumbnail;
    });

    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });
    if (progress && progress.type === PLAN_TYPE.CHALLENGE && progress.planId) {
      const index = plans.findIndex((el) => el && el._id && el._id.toString() === progress.planId.toString());
      if (index !== -1) {
        const custom_plan = await this.planService.getItem({ type: PLAN_TYPE.MY_PLAN, userId });
        if (custom_plan?.workouts?.length) {
          const thumbnail = new url_1.URL(`/assets/main/customPlan.jpg`, BASE_URL).toString();
          plans[index] = <IShortPlan>{
            _id: custom_plan._id,
            type: custom_plan.type,
            title: custom_plan.title,
            description: custom_plan.description,
            thumbnail,
          };
        }
      }
    }

    return { plans, count };
  };

  filterPlanWorkouts(plan: IPlan): IPlan {
    for (let i = 0; i < plan.workouts.length; i++) {
      if (!plan.workouts[i]) {
        plan.workouts[i] = null;
      }
    }

    return plan;
  }

  getByIdForAdmin = async (id: string): Promise<IPlan> => {
    const plan = await this.planService.getItemById(id);

    if (!plan) throw new CustomError(404, this.localizations.ERRORS.PLAN.NOT_FOUND);

    if (plan.thumbnailName) {
      plan.thumbnail = new url_1.URL(`/static/images/plans/${plan.thumbnailName}`, BASE_URL).toString();
    } else {
      plan.thumbnail = new url_1.URL(`/assets/main/start.jpg`, BASE_URL).toString();

      if (plan.workouts[0]) {
        const workout = await this.workoutService.getItemById(plan.workouts[0]);
        if (workout?.video?.thumbnail) {
          plan.thumbnail = workout.video.thumbnail;
        }
      }
    }

    return plan;
  };

  getByIdForUser = async (id: string) => {
    const plan = await this.planService.getItemById(id);

    if (!plan) throw new CustomError(404, this.localizations.ERRORS.PLAN.NOT_FOUND);

    const workoutsOb = await this.workoutService.getRangeWorkouts(plan.workouts);

    const bufWeeksPlan = [];
    workoutsOb.forEach((workout) => {
      if (!workout) {
        bufWeeksPlan.push({
          title: 'Day Off',
          duration: null,
          thumbnail: new url_1.URL(`/assets/main/dayOff.jpg`, BASE_URL).toString(),
          workoutId: null,
          isDayOff: true,
        });
      } else {
        bufWeeksPlan.push({
          title: workout.title,
          duration: workout.video?.duration ? workout.video.duration : 0,
          thumbnail: workout.video?.thumbnail ? workout.video.thumbnail : 0,
          workoutId: workout._id,
          isDayOff: false,
        });
      }
    });

    const weeksPlan = sliceArr(bufWeeksPlan, COUNT_DAY_FOR_WEEK);
    return {
      _id: plan._id,
      title: plan.title,
      description: plan.description,
      weeksPlan,
    };
  };

  getByIdForViewPlan = async (id: string) => {
    const plan = await this.planService.getItemById(id);

    if (!plan) throw new CustomError(404, this.localizations.ERRORS.PLAN.NOT_FOUND);

    const workouts = await this.workoutService.getRangeWorkouts(plan.workouts);

    if (plan.thumbnailName) {
      plan.thumbnail = new url_1.URL(`/static/images/plans/${plan.thumbnailName}`, BASE_URL).toString();
    } else {
      plan.thumbnail = new url_1.URL(`/assets/main/start.jpg`, BASE_URL).toString();

      if (workouts[0]) {
        if (workouts[0]?.video?.thumbnail) {
          plan.thumbnail = workouts[0].video.thumbnail;
        }
      }
    }

    let offsetDays = 0;
    const progress = await this.progressService.getItem({ planId: plan._id, active: true });
    if (progress) {
      const currentDay = this.progressService.getCurrentDayV2(progress);
      const workoutSize = plan.workouts.length;
      if (currentDay > workoutSize) offsetDays = Math.floor(currentDay / workoutSize) * workoutSize;
    }
    return {
      _id: plan._id,
      type: plan.type,
      title: plan.title,
      userId: plan.userId,
      difficulty: plan.difficulty,
      description: plan.description,
      workouts,
      altWorkouts: await this.workoutService.getRangeWorkouts(plan.altWorkouts),
      isPrimary: plan.isPrimary,
      thumbnail: plan.thumbnail,
      offsetDays,
    };
  };

  create = async (planInfo: IPlan): Promise<object> => {
    await this.checkWorkout(planInfo.workouts, planInfo.altWorkouts);

    if (Array.isArray(planInfo.workouts) && planInfo.workouts.length > 0) {
      const allWorkouts = await this.workoutService.get();

      planInfo.altWorkouts = this.planService.getRandomAltWorkouts(planInfo.workouts, allWorkouts);
    }

    const newPlan = await this.planService.create(planInfo);

    return {
      status: 201,
      payload: newPlan,
    };
  };

  update = async (id: string, planInfo: IPlan): Promise<IPlan> => {
    await this.checkWorkout(planInfo.workouts, planInfo.altWorkouts);

    const plan = await this.planService.updateById(id, planInfo);
    const userId = plan.userId

    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });

    await this.progressService.updateProgressByPlan(progress, plan);
    if (!plan) throw new CustomError(404, this.localizations.ERRORS.PLAN.NOT_FOUND);

    return plan;
  };

  setPictures = async (id: string, { thumbnailName }: IAddPictures): Promise<IPlan> => {
    if (!thumbnailName) {
      throw new CustomError(400, 'File not detected');
    }

    const plan = await this.planService.updateById(id, { thumbnailName });
    if (!plan) throw new CustomError(404, this.localizations.ERRORS.PLAN.NOT_FOUND);

    return plan;
  };

  delete = async (id: string): Promise<object> => {
    const plan = await this.planService.deleteById(id);

    if (!plan) throw new CustomError(404, this.localizations.ERRORS.PLAN.NOT_FOUND);

    return {
      message: 'Success',
    };
  };

  joinToPlan = async ({ userId }, planId: string): Promise<object> => {
    const plan = await this.planService.getItemById(planId);
    if (!plan) throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_FOUND);
    if (!plan.workouts.length) throw new CustomError(400, this.localizations.ERRORS.WORKOUT.NOT_FOUND);
    if (!plan.altWorkouts.length)
      throw new CustomError(400, 'Alternative ' + this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    await this.progressService.activeUserPlan(userId, plan);

    return {
      message: 'Success',
    };
  };

  private checkWorkout = async (workouts = [], altWorkouts = []) => {
    const allWorkoutIds = new Set([...workouts, ...altWorkouts]);

    const checkWorkoutPromises = [];
    allWorkoutIds.forEach((workoutId) => {
      checkWorkoutPromises.push(
        this.workoutService.getItem({ _id: workoutId }).then((data) => {
          return {
            ...data,
            checkedWorkoutId: workoutId,
          };
        })
      );
    });

    const checkWorkouts = await Promise.all(checkWorkoutPromises);
    const notExistedWorkouts = checkWorkouts.filter((data) => !data._id && data.checkedWorkoutId !== null);

    if (notExistedWorkouts.length) {
      const failedIds = notExistedWorkouts.map((workout) => workout.checkedWorkoutId).join(', ');
      throw new CustomError(400, `Workouts not exist. Ids: ${failedIds}`);
    }
  };

  getWeek = async ({ userId }, UTC): Promise<object> => {
    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });
    if (!progress) throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_FOUND);

    const bufDays = sliceArr(progress.days, COUNT_DAY_FOR_WEEK);
    const dayStartStamp = new Date(progress.dateStart).getTime();
    let currentDay = this.progressService.getCurrentDayV2(progress, UTC);
    const currentWeek = Math.ceil(currentDay / COUNT_DAY_FOR_WEEK);
    const indexCurrentWeek = currentWeek - 1;
    const weekPlan = [];
    
    for (let indexDay = 0; indexDay < bufDays[indexCurrentWeek].length; indexDay++) {
      const dayOb = bufDays[indexCurrentWeek][indexDay];

      if (dayOb.day < currentDay && (dayOb.status === WEEK_STATUS_TYPE.NO_PASSED)) {
        currentDay = dayOb.day;
      }

      weekPlan[indexDay] = {
        day: dayOb.day,
        status: dayOb.status,
        currentDay: currentDay === dayOb.day,
        workout: {
          id: dayOb.workout.id,
          status: dayOb.workout.status,
          percent: dayOb.workout.percent,
        },
        altWorkout: {
          id: dayOb.altWorkout.id,
          status: dayOb.altWorkout.status,
          percent: dayOb.altWorkout.percent,
        },
        completedDate: dayOb.workout.completedDate ? dayOb.workout.completedDate : dayOb.altWorkout.completedDate,
      };
    }
    const plan = await this.planService.getItemById(progress.planId);

    return {
      title:plan.title,
      currentDay,
      currentWeek,
      dayStart: new Date(dayStartStamp + UTC * ONE_HOUR),
      dayEnd: new Date(dayStartStamp + progress.days.length * ONE_DAY - 1 + UTC * ONE_HOUR),
      planId: progress.planId.toString(),
      progressId: progress._id.toString(),
      weekPlan,
    };
  };

  getWeekForAdmin = async (userId): Promise<object> => {
    return this.getWeek({ userId }, 0);
  };

  getWeeks = async ({ userId }, UTC): Promise<object> => {
    const progress = await this.progressService.getItem({
      userId,
      active: true,
    });
    if (!progress) throw new CustomError(400, this.localizations.ERRORS.PLAN.NOT_JOIN_TO_PLAN);

    const currentDay = this.progressService.getCurrentDayV2(progress, UTC);
    const currentWeek = Math.ceil(currentDay / COUNT_DAY_FOR_WEEK);
    const indexCurrentWeek = currentWeek - 1;

    const bufWeeksPlan = [];
    if (progress.days && progress.days.length > 0) {
      const bufWorkoutIds = [];
      for (let ind = 0; ind < progress.days.length; ind++) {
        const day = progress.days[ind];
        if (day.status !== WEEK_STATUS_TYPE.DAY_OF) {
          if (day.workout?.id && Types.ObjectId.isValid(day.workout.id.toString())) {
            bufWorkoutIds.push(day.workout.id.toString());
          }
          if (day?.altWorkout?.id && Types.ObjectId.isValid(day.altWorkout.id.toString())) {
            bufWorkoutIds.push(day.altWorkout.id.toString());
          }
        }
      }

      const workouts = await this.workoutService.getRangeWorkouts(bufWorkoutIds);

        const findFunc = (id: string) => (el) => el?._id?.toString() === id;



      for (let index = 0; index < progress.days.length; index++) {
        const day = progress.days[index];
        let workoutId = '000000000000000000000000';
        let percent = null;
        let title = 'Day Off';
        let duration = 0;
        let thumbnails = new url_1.URL(`/assets/main/dayOff.jpg`, BASE_URL).toString();

        if (day.status !== WEEK_STATUS_TYPE.DAY_OF) {
          if (day?.altWorkout?.status === WEEK_STATUS_TYPE.PASSED && day?.workout?.status !== WEEK_STATUS_TYPE.PASSED) {
            if (day.altWorkout.id) {
              workoutId = day.altWorkout.id.toString();
              percent = day.altWorkout.percent;
              const workout = workouts.find(findFunc(workoutId));

              if (workout) {
                title = workout.title;
                thumbnails = workout.video?.thumbnail ? workout.video.thumbnail : thumbnails;
                duration = workout?.video?.duration ? workout.video.duration : duration;
              }
            }
          } else if (day?.workout?.id && Types.ObjectId.isValid(day.workout.id.toString())) {
            workoutId = day.workout.id.toString();
            percent = day.workout.percent;
            let workout;
            if(workoutId){ 
               workout = workouts.find(findFunc(workoutId));
            }

            
            if (workout) {
              title = workout.title;
              thumbnails = workout.video?.thumbnail ? workout.video.thumbnail : thumbnails;
              duration = workout?.video?.duration ? workout.video.duration : duration;
            }
          }
        }
        let dateInfo = null;
        if(day.workout.completedDate != null || day.altWorkout.completedDate != null) {
          if(day.workout.completedDate != null)
              dateInfo = day.workout.completedDate
          else
              dateInfo = day.altWorkout.completedDate
        }
        bufWeeksPlan[index] = {
          day: day.day,
          completedDay: dateInfo,
          title,
          status: day.status,
          percent,
          duration,
          workoutId,
          thumbnails,
        };
      }
    }

    const weeksPlan = sliceArr(bufWeeksPlan, COUNT_DAY_FOR_WEEK);

    
    const completedWeek = []
    const user = await this.userService.getItemById(userId)
    let isFreeChallenge = false
    if(user.freeChallenge) {
      if(user.freeChallenge.isCompleted == false && user.freeChallenge.inProgress == true) {
        isFreeChallenge = true
      }
    }
    for(var i = 0; i < weeksPlan.length; i ++) {
      const weekPlan = weeksPlan[i]
      const days = []
      for(var j = 0; j < weekPlan.length; j ++) {
         if(weekPlan[j]['completedDay'] == null) continue
         if(days.indexOf(weekPlan[j]['completedDay'].getDay()) == -1)
            days.push(weekPlan[j]['completedDay'].getDay())
      }
      completedWeek.push(isFreeChallenge == true ? days.length >= 3 : false)
    }

    const plan = await this.planService.getItemById(progress.planId);

    return {
      title: plan.title,
      description: plan.description,
      indexCurrentWeek,
      weeksPlan,
      completedWeek
    };
  };
 
}
