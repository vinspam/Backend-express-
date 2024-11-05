import { ObjectId, FilterQuery } from 'mongoose';

import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';
import { CustomError } from '../../utils/helpers';

import PlanService from './plan.service';
import WorkoutService from '../workout/workout.service';
import UserService from '../user/user.service';
import ProgressService from '../progress/progress.service';

import { COUNT_DAY_FOR_WEEK, DAY_USING_WORKOUT_TYPES, LITERAL_FOR_CUSTOM, PLAN_TYPE } from './plan.constant';
import { IPlan, IPlanWorkouts, workoutsPlan } from './plan.types';
import { WorkoutBodyPart, WorkoutStyle } from '../workout/workout.constant';
import { IWorkout } from '../workout/workout.types';

export default class CustomPlan {
  private planService: PlanService;
  private workoutService: WorkoutService;
  private userService: UserService;
  private progressService: ProgressService;

  private localizations: ILocalization;

  constructor() {
    this.planService = new PlanService();
    this.workoutService = new WorkoutService();
    this.userService = new UserService();
    this.progressService = new ProgressService();

    this.localizations = localizations['en'];
  }

  public async createOrUpdate(userId: string | ObjectId, abilityLevel?: number, newPlan?: boolean): Promise<IPlan> {
    const planInfo = await this.getPlanInfo(userId, abilityLevel, newPlan);
    return await this.planService.updateOrInsert({ userId, type: PLAN_TYPE.MY_PLAN }, planInfo);
  }

  public async getPlanInfo(userId: string | ObjectId, abilityLevel?: number, newPlan?: boolean): Promise<IPlan> {
    const filterForAllWorkout: FilterQuery<IWorkout> = {
      video: { $exists: true },
      difficulty: { $exists: true },
      style: { $exists: true },
      bodyPart: { $exists: true },
    };

    const [allWorkouts, user, progress] = await Promise.all([
      this.workoutService.get(filterForAllWorkout, {
        _id: 1,
        video: 1,
        difficulty: 1,
        style: 1,
        bodyPart: 1,
      }),
      this.userService.getItemById(userId),
      this.progressService.getItem({ userId, type: PLAN_TYPE.MY_PLAN, active: true }),
    ]);

    if (!user) throw new CustomError(404, this.localizations.ERRORS.USER.NOT_EXIST);

    const planInfo = <IPlan>{
      title: 'Custom Plan',
      type: PLAN_TYPE.MY_PLAN,
      userId: user._id,
      description: `This is ${user.name}\`s custom plan`,
      isPrimary: true,
    };
    const difficulty = abilityLevel ? abilityLevel : user.abilityLevel;

    const workoutStyleList = user.workoutStyleList;
    const bodyPartsList = user.bodyPartList;

    const limitWorkouts = 28;

    const countWorkoutRepeat =
      user.countWorkoutRepeat && user.countWorkoutRepeat > 3 && user.countWorkoutRepeat < 7
        ? user.countWorkoutRepeat
        : 4;

    const oldHoldWorkouts: IPlanWorkouts = { workouts: [], altWorkouts: [] };
    if (progress && !newPlan) {
      const firstNoPassed = this.progressService.firstAfterDone(progress.days);
      const saveWorkoutsToThis = (firstNoPassed % limitWorkouts) - 2;

      const plan = await this.planService.getItemById(progress.planId);
      for (let index = saveWorkoutsToThis; index >= 0; index--) {
        oldHoldWorkouts.workouts[index] = plan.workouts[index];
        oldHoldWorkouts.altWorkouts[index] = plan.altWorkouts[index];
      }
    }
    console.log("started sorting... new difficulty is", difficulty)
    const workoutsObArr = await this.getWorkouts(
      allWorkouts,
      difficulty,
      bodyPartsList,
      workoutStyleList,
      countWorkoutRepeat,
      limitWorkouts,
      oldHoldWorkouts
    );

    // fixLastWeek
    let countWorkoutsInLastWeek = 0;
    for (let index = 20; index < 28; index++) {
      if (workoutsObArr.workouts[index]) countWorkoutsInLastWeek++;
    }
    if (countWorkoutRepeat > countWorkoutsInLastWeek) {
      for (let index = 20, firstInd = 0; index < 28; index++) {
        workoutsObArr.workouts[index] = workoutsObArr.workouts[firstInd];
        workoutsObArr.altWorkouts[index] = workoutsObArr.altWorkouts[firstInd];
        firstInd++;
      }
    }
    
    planInfo.difficulty = difficulty;
    planInfo.workouts = await this.sortWorkOut(workoutsObArr.workouts);
    planInfo.altWorkouts = await this.sortWorkOut(workoutsObArr.altWorkouts);
    return planInfo;
  }

  public async sortWorkOut(data : workoutsPlan): Promise<workoutsPlan>{
    const workouts : IWorkout[] = []
    for(var i = 0; i < data.length ; i++) {
      const id = data[i]
      const workout : IWorkout = await this.workoutService.getItemById(id)
      workouts.push(workout)
    }
    // const priorities_before = workouts.map(item=> item == null ? {difficult:null,priority:null} : {difficult:item.difficulty,priority:item.priority})
    const result : IWorkout[] = this.customSort(workouts)
    // const priorities = result.map(item=> item == null ? {difficult:null,priority:null} : {difficult:item.difficulty,priority:item.priority})
    // console.log('before result...\n',priorities_before)
    // console.log('this is sorted results...\n', priorities)
    
    let result_ids : workoutsPlan = []
    result_ids =  result.map(item=> item == null? null : item._id)
    return result_ids
  }
  
  private customSort(data : IWorkout[]): IWorkout[] {
    
    for(var i = 0; i < data.length; i ++) 
      for(var j = i + 1; j < data.length; j ++){
        if(data[i] == null || data[j] == null)
          continue;
        if(data[i].difficulty == data[j].difficulty) {
            if(data[i].priority > data[j].priority) {
              var temp = data[i]
              data[i] = data[j]
              data[j] = temp
            }
        }
      }
    return data;
  }


  public async getWorkouts(
    allWorkouts: IWorkout[],
    difficulty: number,
    bodyPartsList: WorkoutBodyPart[],
    workoutStyleList: WorkoutStyle[],
    countWorkoutRepeat: number,
    limitWorkouts: number,
    oldHoldWorkouts: IPlanWorkouts = { workouts: [], altWorkouts: [] }
  ): Promise<IPlanWorkouts> {
    const typeWeak = countWorkoutRepeat - 4; // type for DayOff

    const needWorkout = countWorkoutRepeat * (limitWorkouts / COUNT_DAY_FOR_WEEK); // how much workout needed
    let needWorkoutForStyle = workoutStyleList.length ? Math.ceil(needWorkout / workoutStyleList.length) : needWorkout; // how much workout need for style or empty chooses

    needWorkoutForStyle = needWorkoutForStyle && needWorkoutForStyle > 1 ? needWorkoutForStyle - 1 : 1;

    // 5 4 6 3 7 2 8 1 9 10
    // const bufArrDiff = [];
    // for (let i = 0; i < 10; i++) {
    //   if (difficulty - i > 0) bufArrDiff.push(difficulty - i);
    //   if (difficulty + i < 11 && i > 0) bufArrDiff.push(difficulty + i);
    // }

    let mainSort = {};
    mainSort[LITERAL_FOR_CUSTOM.OTHER] = [];
    mainSort[LITERAL_FOR_CUSTOM.MAIN] = [];

    // for current difficult
    const workoutsByCurDiff = allWorkouts.filter((workout) => workout.difficulty === difficulty);
    const curDiffSort = this._sortByStyle(workoutStyleList, bodyPartsList, workoutsByCurDiff);
    // console.log(curDiffSort);
    mainSort = this._sortV2(workoutStyleList, mainSort, curDiffSort, needWorkoutForStyle, needWorkout);

    for (let i = 1; i < 10; i++) {
      const low = difficulty - i,
        up = difficulty + i;
      let lowSort, upSort;
      if (low > 0) {
        const workoutsByDiff = allWorkouts.filter((workout) => workout.difficulty === low);
        lowSort = this._sortByStyle(workoutStyleList, bodyPartsList, workoutsByDiff);
        // console.log(low);
        // console.log(lowSort);
      }
      if (lowSort) {
        mainSort = this._sortV2(workoutStyleList, mainSort, lowSort, needWorkoutForStyle, needWorkout);
        if (!this._needContinue(mainSort, needWorkout)) break;
      }

      if (up < 11) {
        const workoutsByDiff = allWorkouts.filter((workout) => workout.difficulty === up);
        upSort = this._sortByStyle(workoutStyleList, bodyPartsList, workoutsByDiff);
        // console.log(up);
        // console.log(upSort);
      }
      if (upSort) {
        mainSort = this._sortV2(workoutStyleList, mainSort, upSort, needWorkoutForStyle, needWorkout);
        if (!this._needContinue(mainSort, needWorkout)) break;
      }

      if (!lowSort && !upSort) break;

      if (mainSort[LITERAL_FOR_CUSTOM.OTHER].length) {
        mainSort = this._sortV3(mainSort, needWorkout);
        if (!this._needContinue(mainSort, needWorkout)) break;
      }
    }

    // get workout weak
    const workoutsId = <workoutsPlan>[].concat(oldHoldWorkouts.workouts);
    const startIndex = workoutsId.length;
    let day = startIndex % COUNT_DAY_FOR_WEEK;
    day = startIndex && !day ? COUNT_DAY_FOR_WEEK : day;
    if (day === DAY_USING_WORKOUT_TYPES[typeWeak].length) day = 0;

    // skip days if one repeat with old workout
    if (workoutsId.length) {
      for (let index = workoutsId.length - day - 1; index < workoutsId.length; index++) {
        if (!workoutsId[index] || workoutsId[index] === null) continue;

        for (let bufIndex = 0; bufIndex < COUNT_DAY_FOR_WEEK; bufIndex++) {
          if (workoutsId[index].toString() === mainSort[LITERAL_FOR_CUSTOM.MAIN][bufIndex].toString()) {
            const buf = mainSort[LITERAL_FOR_CUSTOM.MAIN][bufIndex];
            mainSort[LITERAL_FOR_CUSTOM.MAIN] = mainSort[LITERAL_FOR_CUSTOM.MAIN].filter(
              (el) => el.toString() !== workoutsId[index].toString()
            );
            mainSort[LITERAL_FOR_CUSTOM.MAIN].push(buf);
            bufIndex++;
          }
        }
      }
    }

    for (let index = startIndex, indexOther = 0; index < limitWorkouts; index++) {
      if (DAY_USING_WORKOUT_TYPES[typeWeak][day]) {
        if (!mainSort[LITERAL_FOR_CUSTOM.MAIN][indexOther]) indexOther = 0;
        workoutsId[index] = mainSort[LITERAL_FOR_CUSTOM.MAIN][indexOther];
        indexOther++;
      } else {
        workoutsId[index] = null;
      }
      day++;
      if (day === DAY_USING_WORKOUT_TYPES[typeWeak].length) {
        day = 0;
      }
    }

    return {
      workouts: workoutsId,
      altWorkouts: this.planService.getRandomAltWorkouts(workoutsId, allWorkouts, oldHoldWorkouts.altWorkouts),
    };
  }

  testCustom = async (body) => {
    const { userId, abilityLevel } = body;
    return this.getPlanInfo(userId, Number(abilityLevel));
  };

  testCustomV2 = async (body) => {
    const { userId, abilityLevel } = body;
    const user = await this.userService.getItemById(userId);

    if (!user) throw new CustomError(404, this.localizations.ERRORS.USER.NOT_EXIST);

    const plan = await this.getPlanInfo(userId, Number(abilityLevel));
    const forPromise = <Array<Promise<Partial<IWorkout> | null>>>[];
    plan.workouts.forEach((workoutId) => {
      if (workoutId) {
        forPromise.push(
          this.workoutService.getItemById(workoutId, {
            _id: 1,
            bodyPart: 1,
            style: 1,
            title: 1,
            difficulty: 1,
          })
        );
      } else forPromise.push(Promise.resolve(null));
    });

    const workouts = await Promise.all(forPromise);

    const difficulty = abilityLevel ? abilityLevel : user.abilityLevel;

    const workoutStyleList = user.workoutStyleList;
    const bodyPartsList = user.bodyPartList;

    return { difficulty, workoutStyleList, bodyPartsList, workouts };
  };

  private _shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  private _sortByStyle(
    workoutStyleList: WorkoutStyle[],
    bodyPartsList: WorkoutBodyPart[],
    allWorkouts: IWorkout[] = []
  ) {
    const bufSort = {}; // buffer for sort

    //init buf
    bufSort[LITERAL_FOR_CUSTOM.OTHER] = [];
    bufSort[LITERAL_FOR_CUSTOM.OTHER + LITERAL_FOR_CUSTOM.BODY] = [];
    workoutStyleList.forEach((el) => {
      bufSort[el] = [];
      bufSort[el + LITERAL_FOR_CUSTOM.BODY] = [];
    });

    for (let i = 0; i < allWorkouts.length; i++) {
      // currentSelectedWorkout
      const curSelWorkout = allWorkouts[i];

      if (!curSelWorkout.video?.duration || curSelWorkout.video.duration < 60 * 25) continue;

      let literal = LITERAL_FOR_CUSTOM.OTHER;
      if (workoutStyleList.includes(curSelWorkout.style)) literal = curSelWorkout.style;
      if (bodyPartsList.some(r=>curSelWorkout.bodyPart.indexOf(r)>=0)) literal += LITERAL_FOR_CUSTOM.BODY;

      bufSort[literal].push(curSelWorkout._id);
      // bufSort[literal].push(curSelWorkout._id.toString()); // for debug
    }

    return bufSort;
  }

  private _sortV2(
    workoutStyleList: WorkoutStyle[],
    mainSort,
    bufSort,
    needWorkoutForStyle: number,
    needWorkout: number
  ) {
    let bufMain = [];
    let bufOther = [];

    workoutStyleList.forEach((el) => {
      const literal = el + LITERAL_FOR_CUSTOM.BODY;
      const diffStyle = needWorkoutForStyle - bufSort[literal].length;

      if (diffStyle <= 0) {
        bufMain = bufMain.concat(bufSort[literal].slice(0, needWorkoutForStyle));
        bufOther = bufMain.concat(bufSort[literal].slice(needWorkoutForStyle, bufSort[literal].length));
      } else if (bufSort[literal].length) {
        bufMain = bufMain.concat(bufSort[literal]);
      }
    });

    if (bufMain.length && mainSort[LITERAL_FOR_CUSTOM.MAIN].length < needWorkout) {
      let diffCount = mainSort[LITERAL_FOR_CUSTOM.MAIN].length + bufMain.length - needWorkout;

      if (bufOther.length && diffCount < 0) {
        const diffOther = bufOther.length + diffCount;
        if (diffOther > 0) {
          // bufMain = bufMain.concat(bufOther.slice(0, diffOther));
          bufMain = bufMain.concat(this._shuffle(bufOther).slice(0, diffOther));
        } else {
          bufMain = bufMain.concat(bufOther);
        }
        diffCount = mainSort[LITERAL_FOR_CUSTOM.MAIN].length + bufMain.length - needWorkout;
      }

      if (diffCount > 0) {
        bufMain = bufMain.slice(0, diffCount);
      }

      //random style
      bufMain = this._shuffle(bufMain);

      mainSort[LITERAL_FOR_CUSTOM.MAIN] = mainSort[LITERAL_FOR_CUSTOM.MAIN].concat(bufMain);
    }

    if (mainSort[LITERAL_FOR_CUSTOM.MAIN].length >= needWorkout) return mainSort;

    let forDiffOther =
      mainSort[LITERAL_FOR_CUSTOM.OTHER].length + mainSort[LITERAL_FOR_CUSTOM.OTHER].length - needWorkout;
    if (forDiffOther > needWorkout) return mainSort;

    if (bufSort[LITERAL_FOR_CUSTOM.OTHER + LITERAL_FOR_CUSTOM.BODY].length) {
      mainSort[LITERAL_FOR_CUSTOM.OTHER] = mainSort[LITERAL_FOR_CUSTOM.OTHER].concat(
        this._shuffle(bufSort[LITERAL_FOR_CUSTOM.OTHER + LITERAL_FOR_CUSTOM.BODY])
      );
    }

    forDiffOther = mainSort[LITERAL_FOR_CUSTOM.OTHER].length + mainSort[LITERAL_FOR_CUSTOM.OTHER].length - needWorkout;
    if (forDiffOther > needWorkout) return mainSort;

    let accumulatorForStyles = [];
    workoutStyleList.forEach((el) => {
      if (bufSort[el] && bufSort[el].length) {
        accumulatorForStyles = accumulatorForStyles.concat(bufSort[el]);
      }
    });
    if (accumulatorForStyles.length) {
      mainSort[LITERAL_FOR_CUSTOM.OTHER] = mainSort[LITERAL_FOR_CUSTOM.OTHER].concat(
        this._shuffle(accumulatorForStyles)
      );
    }

    forDiffOther = mainSort[LITERAL_FOR_CUSTOM.OTHER].length + mainSort[LITERAL_FOR_CUSTOM.OTHER].length - needWorkout;
    if (forDiffOther > needWorkout) return mainSort;

    if (bufSort[LITERAL_FOR_CUSTOM.OTHER].length) {
      mainSort[LITERAL_FOR_CUSTOM.OTHER] = mainSort[LITERAL_FOR_CUSTOM.OTHER].concat(
        this._shuffle(bufSort[LITERAL_FOR_CUSTOM.OTHER])
      );
    }

    return mainSort;
  }

  private _sortV3(mainSort, needWorkout: number) {
    if (mainSort[LITERAL_FOR_CUSTOM.OTHER].length && mainSort[LITERAL_FOR_CUSTOM.MAIN].length < needWorkout) {
      const diffCount =
        mainSort[LITERAL_FOR_CUSTOM.MAIN].length + mainSort[LITERAL_FOR_CUSTOM.OTHER].length - needWorkout;
      if (diffCount > 0) {
        const sliceTo = mainSort[LITERAL_FOR_CUSTOM.OTHER].length - diffCount;
        mainSort[LITERAL_FOR_CUSTOM.OTHER] = mainSort[LITERAL_FOR_CUSTOM.OTHER].slice(0, sliceTo);
      }

      //random style
      // mainSort[LITERAL_FOR_CUSTOM.OTHER] = this._shuffle(mainSort[LITERAL_FOR_CUSTOM.OTHER]);

      mainSort[LITERAL_FOR_CUSTOM.MAIN] = mainSort[LITERAL_FOR_CUSTOM.MAIN].concat(mainSort[LITERAL_FOR_CUSTOM.OTHER]);
      mainSort[LITERAL_FOR_CUSTOM.OTHER] = [];
    }

    return mainSort;
  }

  private _needContinue(mainSort, limitWorkouts: number) {
    return mainSort[LITERAL_FOR_CUSTOM.MAIN].length < limitWorkouts;
  }
}
