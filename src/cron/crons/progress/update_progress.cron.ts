import Cron, { ScheduleOptions } from 'node-cron';
import { BaseCron } from '../base.cron';

import ProcessController from '../../../modules/progress/progress.controller';

import CustomPlan from '../../../modules/plan/custom_plan';
import ProgressService from '../../../modules/progress/progress.service';
import PlanService from '../../../modules/plan/plan.service';
import UserService from '../../../modules/user/user.service';

import { IProgressDay } from '../../../modules/progress/progress.types';
import { PLAN_TYPE } from '../../../modules/plan/plan.constant';

export class UpdateProgressCron extends BaseCron {
  private processController: ProcessController;

  private progressService: ProgressService;
  private planService: PlanService;
  private userService: UserService;

  private customPlan: CustomPlan;

  constructor(cronExpression: string, option = <ScheduleOptions>{}) {
    super(cronExpression, option);

    this.processController = new ProcessController();

    this.progressService = new ProgressService();
    this.planService = new PlanService();
    this.userService = new UserService();

    this.customPlan = new CustomPlan();

    this.initCron();
  }

  private initCron() {
    this.task = Cron.schedule(
      this.cronExpression,
      async () => {
        await this.catchWrapper(this.updateProgress, 'updateProgress');
      },
      this.option
    );
  }

  private updateProgress = async () => {
    console.log('Start updateProgress');

    const progressArr = await this.progressService.get({ active: true });
    if (!Array.isArray(progressArr) || progressArr.length === 0) {
      return;
    }
    for (let indexProgress = 0; indexProgress < progressArr.length; indexProgress++) {
      let progress = progressArr[indexProgress];
      if (!progress?.planId || !progress?.days?.length) {
        continue;
      }

      const currentDay = this.progressService.getCurrentDayV2(progress);

      // // need for delete old progress create without cron or server shutdown to long. bzz you have bad devops)))
      // if (currentDay > progress.days.length) {
      //   console.log(
      //     'Dev hate you because progress is old and need delete. Progress delete for userId: ' + progress.userId
      //   );
      //   await this.progressService.deleteById(progress._id);
      //   continue;
      // }

      let plan = await this.planService.getItemById(progress.planId);
      if (!plan?.workouts?.length || plan.workouts.length === 0) {
        continue;
      }

      if (progress.days.length - currentDay >= plan.workouts.length) {
        continue;
      }

      let lastWorkDay = plan.workouts.length;
      while (lastWorkDay > 0) {
        if (plan.workouts[lastWorkDay - 1]) {
          break;
        }
        lastWorkDay--;
      }

      let deltaDay = currentDay % plan.workouts.length;
      deltaDay = deltaDay === 0 ? plan.workouts.length : deltaDay;

      //fix for off cron
      if (currentDay > progress.days.length) {
        deltaDay = lastWorkDay;
        const dayForChange = progress.days.length - plan.workouts.length + deltaDay;
        await this.processController.changeDate({ userId: progress.userId }, { day: dayForChange });
        progress = await this.progressService.getItemById(progress._id);
      }

      if (deltaDay !== lastWorkDay) {
        continue;
      }

      if (plan.type === PLAN_TYPE.MY_PLAN) {
        const delta = 1; // increase by 1
        const userId = plan.userId;
        const user = await this.userService.getItemById(userId);

        const abilityLevel = user.abilityLevel + delta;

        if (abilityLevel >= 1 && abilityLevel <= 10) {
          const [customPlan] = await Promise.all([
            await this.customPlan.createOrUpdate(userId, abilityLevel),
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
    }
    return;
  };
}
