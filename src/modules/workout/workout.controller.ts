import { getPaginationInfo, CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../../utils/localizations/localizations.interface';

import WorkoutService from './workout.service';
import PartService from './service/part.service';
import VimeoService from './vimeo.service';
import UserService from '../user/user.service';

import EquipmentService from '../equipment/equipment.service';
import { IAllWorkoutParam, IVideo, IWorkout } from './workout.types';
import { NodeDifficult } from './workout.constant';

export default class WorkoutController {
  private workoutService: WorkoutService;
  private partService: PartService;
  private vimeoService: VimeoService;
  private equipmentService: EquipmentService;
  private userService: UserService;

  private localizations: ILocalization;

  constructor() {
    this.workoutService = new WorkoutService();
    this.partService = new PartService();
    this.vimeoService = new VimeoService();
    this.equipmentService = new EquipmentService();
    this.userService = new UserService();

    this.localizations = localizations['en'];
  }

  public getAllWorkouts = async (
    { userId },
    { bodyPart, difficulty, lengthFrom, lengthTo, offset, limit }: IAllWorkoutParam
  ) => {
    const range = getPaginationInfo({ value: offset, default: 0 }, { value: limit, default: 9 });

    const user = await this.userService.getItemById(userId);

    const videoLength = {
      from: lengthFrom ? Number(lengthFrom) * 60 : 0,
      to: lengthTo ? Number(lengthTo) * 60 : 9000000,
    };

    const { workouts, count } = await this.workoutService.getAllWorkoutForUser({
      bodyPart,
      difficulty: Number(difficulty),
      videoLength,
      range,
    });
    
    const savedWorkouts = <Array<string>>[];
    user.savedWorkouts.forEach((savedWorkout) => savedWorkouts.push(savedWorkout.toString()));
    const items = [];
    for (let index = 0; index < workouts.length; index++) {
      items[index] = workouts[index].toObject();
      items[index].itsSavedWorkout = savedWorkouts.includes(workouts[index]._id.toString());
    }

    return { items, count };

  };

  public getAllWorkoutsForAdmin = async ({ bodyPart, difficulty, offset, limit, text }) => {
    const range = getPaginationInfo({ value: offset, default: 0 }, { value: limit, default: 9 });
    return await this.workoutService.getAllWorkoutForAdmin(bodyPart, +difficulty, range, text);
  };
  public getAllWorkoutsForAdminWithoutPagination = async ({}) => {
    return await this.workoutService.getAllWorkoutForAdmin('', 0, {offset:0, limit:100000000});
  };
  public getWorkoutById = async (id: string): Promise<IWorkout> => {
    const workout = await this.workoutService.getItemById(id);

    if (!workout) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    return workout;
  };

  public createWorkout = async (workout: IWorkout): Promise<IWorkout> => {
    if (workout.equipments && workout.equipments.length) {
      const foundEquipment = await this.equipmentService.areAllOfEquipmentsExist(workout.equipments);

      if (!foundEquipment) {
        throw new CustomError(400, this.localizations.ERRORS.EQUIPMENT.SOME_OF_EQUIPMENT_IS_NOT_VALID);
      }
    }

    return this.workoutService.create(workout);
  };

  public updateWorkout = async (id: string, workoutData: IWorkout): Promise<IWorkout> => {
    if (workoutData.equipments && workoutData.equipments.length) {
      const foundEquipment = await this.equipmentService.areAllOfEquipmentsExist(workoutData.equipments);

      if (!foundEquipment) {
        throw new CustomError(400, this.localizations.ERRORS.EQUIPMENT.SOME_OF_EQUIPMENT_IS_NOT_VALID);
      }
    }

    const workout = await this.workoutService.updateById(id, workoutData);

    if (!workout) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    return workout;
  };

  public updateVideoInWorkout = async (workoutId: string, data): Promise<{ message: string }> => {
    const workoutExists = this.workoutService.exists({ _id: workoutId });

    if (!workoutExists) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    const workoutVideoInfo = <IVideo>{};

    if (data?.parts) {
      data.parts.forEach((part) => {
        part.nodes.forEach((node) => {
          if (node.timeEnd < node.timeStart) {
            const tmp = node.timeStart;
            node.timeStart = node.timeEnd;
            node.timeEnd = tmp;
          }
        });
      });

      workoutVideoInfo.parts = data.parts;
    }

    const videoId = this.vimeoService.getVideoId(data.url);
    let videoInfo;
    try {
      videoInfo = await this.vimeoService.checkVideoInUserAccount(videoId).then((res) => res.data);
    } catch (error) {
      throw new CustomError(404, this.localizations.ERRORS.WORKOUT.VIDEO_NOT_FOUND);
    }

    workoutVideoInfo.duration = 0;
    data.parts.forEach((part) => {
      const medium = part.nodes.find((node) => node.difficult === NodeDifficult.MEDIUM);
      workoutVideoInfo.duration += medium.timeEnd - medium.timeStart;
    });

    workoutVideoInfo.link = videoInfo.link;
    workoutVideoInfo.thumbnail = (data.thumbnailBaseLink!=undefined && data.thumbnailBaseLink)?data.thumbnailBaseLink:videoInfo.pictures.base_link;
    // workoutVideoInfo.customThumbnail = (data.thumbnailBaseLink!=undefined && data.thumbnailBaseLink)?data.thumbnailBaseLink:'';
    await this.workoutService.updateById(workoutId, {
      video: workoutVideoInfo,
    });
    
    return { message: 'Success' };
  };

  public setThumbnail = async (id: string, { customThumbnail, difficulty, priority, workoutStyle, parts }): Promise<{ message: string }> => {
    const workoutExists = this.workoutService.exists({ _id: id });

    if (!workoutExists) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);
    let workout=await this.workoutService.getItemById(id);

    let videoObject = workout.video;
   
    if (customThumbnail) {
      videoObject.customThumbnail = customThumbnail;         
    }
    videoObject.parts = JSON.parse(parts)
    await this.workoutService.updateById(id, {
      difficulty: difficulty,
      priority : priority,
      style : workoutStyle,
      video : videoObject
    });
    
    return { message: 'Success' };
  };

  public resetAverageHR = async ({id, partIndex}: {id: string, partIndex: number}): Promise<IWorkout> => {
    const workout = await this.partService.resetAverageHR(id, partIndex);

    if (!workout) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    return workout;
  }

  public deleteWorkout = async (id: string): Promise<IWorkout> => {
    const workout = await this.workoutService.deleteById(id);

    if (!workout) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    return workout;
  };

  public getRangeWorkouts = async ({ workoutIdArr }): Promise<IWorkout[]> => {
    return this.workoutService.getRangeWorkouts(workoutIdArr);
  };

  public resetDifficulty = async (id: string): Promise<IWorkout> => {
    const workout = await this.workoutService.updateById(id, { difficultyResetAt: new Date() });

    if (!workout) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    return workout;
  }
}
