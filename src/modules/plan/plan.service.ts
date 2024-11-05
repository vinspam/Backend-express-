import BaseService from '../../utils/base/service';
import { Plan } from '../../utils/db';
import { IPlan, IShortPlan, workoutsPlan } from './plan.types';
import { COUNT_DAY_FOR_WEEK, PLAN_TYPE } from './plan.constant';
import url_1 from 'url';
import { BASE_URL } from '../../config';
import { IWorkout } from '../workout/workout.types';
import { UpdateWriteOpResult } from 'mongoose';

export default class PlanService extends BaseService<IPlan> {
  constructor() {
    super(Plan);
  }

  async getAllPlanForUser(range: { skip: number; limit: number }): Promise<Array<IShortPlan>> {
    return this.database.aggregate([
      { $match: { type: PLAN_TYPE.CHALLENGE } },
      {
        $skip: range.skip,
      },
      {
        $limit: range.limit,
      },

      {
        $lookup: {
          from: 'workouts',
          let: {
            workoutId: {
              $first: '$workouts',
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$workoutId'],
                },
              },
            },
          ],
          as: 'workoutsOb',
        },
      },

      {
        $addFields: {
          thumbnail: {
            $cond: {
              if: { $first: '$workoutsOb.video' },
              then: { $first: '$workoutsOb.video.thumbnail' },
              else: new url_1.URL(`/assets/main/dayOff.jpg`, BASE_URL).toString(),
            },
          },
        },
      },

      {
        $project: {
          type: 1,
          title: 1,
          description: 1,
          thumbnail: 1,
          thumbnailName: 1,
        },
      },
    ]);
  }

  getRandomAltWorkouts(
    workoutsId: workoutsPlan,
    allWorkouts: IWorkout[],
    altWorkoutsId = <workoutsPlan>[]
  ): workoutsPlan {
    let allWithVideo = allWorkouts.filter((el) => el.video?.duration && el.video.duration < 60 * 25);
    const getRandomWorkout = (workouts: IWorkout[], filterArr: string[]) => {
      const bufFunc = (indexForArr = -1) => {
        indexForArr++;
        if (!workouts[indexForArr]) return null;
        else if (workouts[indexForArr]?.video?.duration && !filterArr.includes(workouts[indexForArr]._id)) {
          return workouts[indexForArr]._id;
        }
        return bufFunc(indexForArr);
      };
      return bufFunc();
    };

    // get altWorkout weak
    for (let i = 0, day = 0, altBufArr = []; i < workoutsId.length; i++) {
      if (workoutsId[i] !== null) {
        altBufArr.push(workoutsId[day]);
        allWithVideo = allWithVideo.sort(() => Math.random() - 0.5); // for rand
        const randomWorkout = getRandomWorkout(allWithVideo, altBufArr);
        altWorkoutsId[i] = randomWorkout;
        altBufArr.push(randomWorkout);
      } else {
        altWorkoutsId[i] = null;
      }

      day++;
      if (day === COUNT_DAY_FOR_WEEK) {
        day = 0;
        altBufArr = [];
      }
    }

    return altWorkoutsId;
  }
  

}
