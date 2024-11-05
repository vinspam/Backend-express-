import { Workout } from '../../../utils/db';
import BaseService from '../../../utils/base/service';
import { IWorkout, IVideoPart } from '../workout.types';

export default class PartService extends BaseService<IWorkout> {
  constructor() {
    super(Workout);
  }

  static getInitialAvgHR(userHR: number) {
    return { averageHR: userHR, completedNum: 1 };
  }

  static calculateAvgHR(avgHR: number, completedNum: number, userHR: number) {
    const newCompletedNum = completedNum + 1;
    const newAvgHR = Math.round((avgHR * completedNum + userHR) / newCompletedNum);

    return { averageHR: newAvgHR, completedNum: newCompletedNum };
  }

  static setPartHR(part: IVideoPart, averageHR: number, completedNum: number) {
    part.completedNum = completedNum;
    part.averageHR = averageHR;

    if (completedNum >= 10) {
      part.targetHR = averageHR;
    }
  }

  public async updatePartAvgHR(workoutId: string, partIndex: number, userHR: number): Promise<void> {
    const workout = await this.database.findById(workoutId);
    const part = workout.video.parts[partIndex];
    const { averageHR, completedNum } = part.completedNum === 0
      ? PartService.getInitialAvgHR(userHR)
      : PartService.calculateAvgHR(part.averageHR, part.completedNum, userHR);
    PartService.setPartHR(part, averageHR, completedNum);

    await this.database.updateOne({ _id: workoutId }, { $set: { video: workout.video } });
  }

  public async resetAverageHR(workoutId: string, partIndex: number): Promise<IWorkout> {
    const workout = await this.database.findById(workoutId);
    const part = workout.video.parts[partIndex];
    PartService.setPartHR(part, 0, 0);

    return await this.database.findByIdAndUpdate(workoutId, { $set: { video: workout.video } }, {new: true});
  }
}