import WorkoutSSE from '../modules/workout/workout.sse';
import UserService from '../modules/user/user.service';
import { Request, Response } from 'express';
import { IAuthInfo } from '../modules/auth/auth.types';
import DefaultSettingsService from '../modules/defaultSettings/defaultSettings.service';
import { IWorkoutSSE } from '../modules/workout/workout.types';
import { ACTION_LIST } from '../modules/progress/progress.constant';

import logger from '../utils/logger';

const ONE_HOUR = 60 * 60 * 1000;

const workoutSSE = WorkoutSSE.getInstance();
const userService = new UserService();
const defaultSettingsService = new DefaultSettingsService();

export default function sseWorkoutEventsHandler() {
  return async (request: Request & { user: IAuthInfo }, response: Response) => {
    try {
      if (!request.query.progressId || !request.query.workoutId || !request.query.dayNumber) {
        return response.status(400).json({ message: 'progressId, workoutId, dayNumber required!' });
      }

      if (workoutSSE.isClientAlreadyHasConnection(String(request.user.userId))) {
        return response.status(406).json({ message: 'This user already has connection.' }).end();
      }

      const headers = {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      };

      response.writeHead(200, headers);

      const [userPercentHeartRate, defaultHr] = await Promise.all([
        userService.getHeartRateParams(request.user.userId),
        defaultSettingsService.getDefaultSettings().then((data) => {
          return {
            above: data?.percentOfSectionAboveForHR,
            below: data?.percentOfSectionBelowForHR,
          };
        }),
      ]);

      defaultHr.above = defaultHr.above ? Number(defaultHr.above) : 10;
      defaultHr.below = defaultHr.below ? Number(defaultHr.below) : -10;

      const dayNumber = Number(request.query.dayNumber) - 1;

      const needClearProgress = !(Number(request.query?.startFromPart) > 0);

      const newClient: IWorkoutSSE = {
        userId: String(request.user.userId),
        progressId: String(request.query.progressId),
        workoutId: String(request.query.workoutId),
        allowDisconnect: false,
        dayNumber,
        percentHeartRate: userPercentHeartRate,
        hrDefault: defaultHr,
        needClearProgress,
        actionAfterWorkout: ACTION_LIST.NONE,
        startFromPart: Number(request.query?.startFromPart),
        expire: Number(new Date()) + ONE_HOUR,
        response,
      };

      workoutSSE.subscribeClient(newClient);

      request.on('close', () => {
        workoutSSE.unsubscribeClient(newClient.userId);
      });
    } catch (error) {
      logger.error(error);
    }
  };
}
