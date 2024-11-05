import { FilterQuery, UpdateWriteOpResult } from 'mongoose';

import { Workout } from '../../utils/db';
import BaseService from '../../utils/base/service';
import { IGetAllWorkoutForUser, IVideo, IWorkout } from './workout.types';

export default class WorkoutService extends BaseService<IWorkout> {
  constructor() {
    super(Workout);
  }

  public removeEquipments(equipment: string) {
    return this.database.updateMany(
      { equipments: equipment },
      {
        $pull: {
          equipments: equipment,
        },
      }
    );
  }

  public getAllWorkoutForAdmin(
    bodyPart: string,
    difficulty: number,
    range: { offset: number; limit: number },
    text?: string
  ) {
    const workoutFilter: Partial<{ bodyPart: string; difficulty: object }> = {};

    if (bodyPart) workoutFilter.bodyPart = bodyPart;

    let selectDifficult: number[];
    if (difficulty) {
      switch (difficulty) {
        case 1:
          selectDifficult = [1, 2, 3];
          break;
        case 2:
          selectDifficult = [2, 3, 4];
          break;
        case 3:
          selectDifficult = [4, 5, 6];
          break;
        case 4:
          selectDifficult = [6, 7, 8];
          break;
        case 5:
          selectDifficult = [8, 9, 10];
          break;
      }

      workoutFilter.difficulty = { $in: selectDifficult };
    }

    if (text) {
      const regexp = new RegExp(text.split(/ +/).join('| ?'), 'i');
      workoutFilter['$or'] = [{ title: { $regex: regexp } }];
    }

    return this.getAllWorkouts(workoutFilter, range);
  }

  public async getSavedWorkouts(filter, range) {
    const [items, count] = await Promise.all([
      this.database.find(filter).skip(range.offset).limit(range.limit),
      this.getCount(filter),
    ]);

    return { items, count };
  }

  public async getAllWorkoutForUser({ bodyPart, difficulty, videoLength, range }: IGetAllWorkoutForUser) {
    const workoutFilter: Partial<{
      bodyPart: string;
      difficulty: object;
      video?: object;
    }> = {
      video: { $exists: true },
    };

    if (bodyPart) workoutFilter.bodyPart = bodyPart;

    if (videoLength) {
      workoutFilter['video.duration'] = {
        $gt: videoLength.from,
        $lte: videoLength.to,
      };
    }

    let selectDifficult: number[];
    if (difficulty) {
      switch (difficulty) {
        case 1:
          selectDifficult = [1, 2, 3];
          break;
        case 2:
          selectDifficult = [2, 3, 4];
          break;
        case 3:
          selectDifficult = [4, 5, 6];
          break;
        case 4:
          selectDifficult = [6, 7, 8];
          break;
        case 5:
          selectDifficult = [8, 9, 10];
          break;
      }

      workoutFilter.difficulty = { $in: selectDifficult };
    }
    const [workouts, count] = await Promise.all([
      this.database
        .find(<FilterQuery<IWorkout>>workoutFilter)
        .skip(range.offset)
        .limit(range.limit),
      this.getCount(<FilterQuery<IWorkout>>workoutFilter),
    ]);

    return { workouts, count };
  }

  public getAllWorkouts(filter: object, range: { offset: number; limit: number }) {
    return this.database
      .aggregate([
        {
          $match: filter,
        },

        {
          $facet: {
            items: [
              {
                $skip: range.offset,
              },
              {
                $limit: range.limit,
              },
            ],
            info: [{ $count: 'count' }],
          },
        },

        {
          $unwind: {
            path: '$info',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            items: '$items',
            count: {
              $cond: {
                if: '$info.count',
                then: '$info.count',
                else: 0,
              },
            },
          },
        },
      ])
      .then(([res]) => res);
  }

  public async getRangeWorkouts(workoutIdArr): Promise<IWorkout[]> {
    const workouts = await this.getRangeItemById(workoutIdArr);

    const finalWorkouts = [];
    const findFunc = (id: string) => (el) => el._id.toString() === id;
    for (let index = 0; index < workoutIdArr.length; index++) {
      finalWorkouts[index] = workoutIdArr[index] ? workouts.find(findFunc(workoutIdArr[index].toString())) : null;
    }

    return finalWorkouts;
  }

  public async updateVideoInfo(videoInfo: IVideo): Promise<UpdateWriteOpResult> {
    return this.database.updateMany(
      { 'video.link': videoInfo.link },
      {
        $set: {
          'video.thumbnail': videoInfo.thumbnail,
          'video.duration': videoInfo.duration,
        },
      }
    );
  }

  public async updateWorkoutDifficulty(id: string, difficulty: number): Promise<IWorkout> {
    return this.database.findByIdAndUpdate(id, { $set: { difficulty } }, {new: true});
  }
  public async updatePriorityInfo(): Promise<UpdateWriteOpResult> {
    // return await this.database.updateMany({}, { $unset: { priority: 1 } });
    return this.database.updateMany(
      {},
      {
        $set: {
          priority: 10
        },
      }
    );
  }
}
