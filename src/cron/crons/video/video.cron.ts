import Cron from 'node-cron';
import { BaseCron } from '../base.cron';
import { ScheduleOptions } from 'node-cron';

import { IVideo } from '../../../modules/workout/workout.types';
import WorkoutService from '../../../modules/workout/workout.service';
import VimeoService from '../../../modules/workout/vimeo.service';

export class VideoCron extends BaseCron {
  private workoutService: WorkoutService;
  private vimeoService: VimeoService;

  constructor(cronExpression: string, option = <ScheduleOptions>{}) {
    super(cronExpression, option);

    this.workoutService = new WorkoutService();
    this.vimeoService = new VimeoService();

    this.initCron();
  }

  private initCron() {
    this.task = Cron.schedule(
      this.cronExpression,
      async () => {
        await this.catchWrapper(this.updateVideoInfoFromVimeo, 'updateVideoInfoFromVimeo');
      },
      this.option
    );
  }

  private updateVideoInfoFromVimeo = async () => {
    console.log('Start updateVideoInfoFromVimeo');

    // get need workouts
    const workoutsWithDefaultThumbnail = await this.workoutService.get({
      'video.thumbnail': 'https://i.vimeocdn.com/video/default',
    });
    const workoutsWithZeroDuration = await this.workoutService.get({ 'video.duration': 0 });

    //sort workouts
    const linkArr = [];
    if (Array.isArray(workoutsWithDefaultThumbnail)) {
      workoutsWithDefaultThumbnail.forEach((el) => {
        if (el?.video?.link && !linkArr.includes(el.video.link)) linkArr.push(el.video.link);
      });
    }
    if (Array.isArray(workoutsWithZeroDuration)) {
      workoutsWithZeroDuration.forEach((el) => {
        if (el?.video?.link && !linkArr.includes(el.video.link)) linkArr.push(el.video.link);
      });
    }

    // update workouts
    if (linkArr.length > 0) {
      for (let index = 0; index < linkArr.length; index++) {
        const videoId = this.vimeoService.getVideoId(linkArr[index]);
        try {
          const videoInfo = await this.vimeoService.checkVideoInUserAccount(videoId).then((res) => res.data);

          const workoutVideoInfo = <IVideo>{};
          workoutVideoInfo.link = videoInfo.link;
          workoutVideoInfo.duration = videoInfo.duration;
          workoutVideoInfo.thumbnail = videoInfo.pictures.base_link;
          const result = await this.workoutService.updateVideoInfo(workoutVideoInfo);
          console.log('count update video info: ' + result.modifiedCount);
        } catch (error) {
          console.log(error);
        }
      }
    }
  };
}
