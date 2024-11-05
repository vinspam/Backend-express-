import { CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../../utils/localizations/localizations.interface';

import ProgressService from '../progress/progress.service';
import WorkoutService from './workout.service';
import UserService from '../user/user.service';
import DefaultSettingsService from '../defaultSettings/defaultSettings.service';

import { NodeDifficult } from './workout.constant';
import { ACTION_LIST, WEEK_STATUS_TYPE } from '../progress/progress.constant';
import CustomPlan from '../plan/custom_plan';
import { IVideoNode, IVideoPart, IWorkout, IWorkoutSSE } from './workout.types';
import { IProgress, IProgressDay, IProgressPartWorkout, IProgressWorkout } from '../progress/progress.types';
import { IUser } from '../user/user.types';
import { IDefaultSettingDocument } from '../defaultSettings/defaultSettings.types';

import logger from '../../utils/logger';

export default class WorkoutSSE {
  private localizations: ILocalization;
  private progressService: ProgressService;
  private workoutService: WorkoutService;
  private userService: UserService;
  private defaultSettingsService: DefaultSettingsService;

  private customPlan: CustomPlan;
  private clients = new Map<string, IWorkoutSSE>();

  private static instance: WorkoutSSE;

  private constructor() {
    this.localizations = localizations['en'];
    this.progressService = new ProgressService();
    this.workoutService = new WorkoutService();
    this.defaultSettingsService = new DefaultSettingsService();
    this.userService = new UserService();

    this.customPlan = new CustomPlan();
  }

  public static getInstance(): WorkoutSSE {
    if (!WorkoutSSE.instance) {
      WorkoutSSE.instance = new WorkoutSSE();
    }

    return WorkoutSSE.instance;
  }

  public isClientAlreadyHasConnection = (userId: string) => {
    return this.clients.has(userId);
  };

  public subscribeClient = (client: IWorkoutSSE) => {
    this.clients.set(client.userId, client);
  };

  public unsubscribeClient = (userId: string) => {
    this.clients.delete(userId);
  };

  private findWorkout = (workoutId: string, dayInfo: IProgressDay) => {
    if (workoutId.toString() === dayInfo?.workout?.id?.toString()) {
      return {
        info: dayInfo.workout,
        type: 'workout',
      };
    } else if (workoutId.toString() === dayInfo?.altWorkout?.id?.toString()) {
      return {
        info: dayInfo.altWorkout,
        type: 'altWorkout',
      };
    } else {
      throw new CustomError(400, 'Workout with id not found');
    }
  };

  public static nodeHrRange = (
    targetHR: number,
    userHrPercent: number,
    defaultRange: { above: number; below: number }
  ): { above: number; below: number } => {
    const userTargetHR = targetHR + (targetHR * userHrPercent) / 100;
    const above = userTargetHR + (userTargetHR * defaultRange.above) / 100;
    const below = userTargetHR + (userTargetHR * defaultRange.below) / 100;

    if (above < below) {
      return {
        above: Number(below.toFixed(0)),
        below: Number(above.toFixed(0)),
      };
    }

    return {
      above: Number(above.toFixed(0)),
      below: Number(below.toFixed(0)),
    };
  };

  public static getCurrentPartInProgress = (partsInProgress: IProgressPartWorkout[]) => {
    const currentIndex = partsInProgress.length ? partsInProgress.length - 1 : 0;
    return partsInProgress[currentIndex];
  };

  public static getCurrentPart = (partIndex: number, parts: IVideoPart[]) => {
    return Number.isInteger(partIndex) ? parts[partIndex + 1] : parts[0];
  };

  public static getNextNodes = (nextPart: IVideoPart) => {
    const nextNodes: {
      [NodeDifficult.MEDIUM]: IVideoNode | undefined;
      [NodeDifficult.LOW]: IVideoNode | undefined;
      [NodeDifficult.HIGH]: IVideoNode | undefined;
    } = {
      [NodeDifficult.MEDIUM]: undefined,
      [NodeDifficult.LOW]: undefined,
      [NodeDifficult.HIGH]: undefined,
    };

    nextPart.nodes.forEach((node) => {
      nextNodes[node.difficult] = node;
    });

    return nextNodes;
  };

  public static selectionNextNode = (
    nextPart: IVideoPart,
    nodeHrRange: { above: number; below: number },
    hr: number,
    targetDifficult: NodeDifficult
  ) => {
    const nextNodes = WorkoutSSE.getNextNodes(nextPart);

    let selectedNode: IVideoNode;
    if (targetDifficult === NodeDifficult.HIGH) {
      selectedNode = hr > nodeHrRange.above ? nextNodes[NodeDifficult.MEDIUM] : nextNodes[NodeDifficult.HIGH];
    } else if (targetDifficult === NodeDifficult.LOW) {
      selectedNode = hr < nodeHrRange.below ? nextNodes[NodeDifficult.MEDIUM] : nextNodes[NodeDifficult.LOW];
    } else if (targetDifficult === NodeDifficult.MEDIUM) {
      if (hr <= nodeHrRange.above && hr >= nodeHrRange.below) {
        selectedNode = nextNodes[NodeDifficult.MEDIUM];
      } else if (hr > nodeHrRange.above) {
        selectedNode = nextNodes[NodeDifficult.LOW];
      } else if (hr < nodeHrRange.below) {
        selectedNode = nextNodes[NodeDifficult.HIGH];
      }
    }

    return selectedNode || nextNodes[NodeDifficult.MEDIUM];
  };

  public static getNewDifficultyInfo = (
    abilityLevel: number,
    userDifficultyRate: number,
    needRepeatCountForChangeDiff: number,
    countDiff: { HIGH: number; MEDIUM: number; LOW: number },
    partLength: number
  ): {
    abilityLevel: number;
    userDifficultyRate: number;
    action: ACTION_LIST;
  } => {
    if (countDiff.HIGH >= countDiff.MEDIUM && countDiff.HIGH > countDiff.LOW && abilityLevel < 10) {
      const countPercent = Math.round((countDiff.HIGH / partLength) * 100);

      if (countPercent >= 70 && abilityLevel < 10) {
        return {
          abilityLevel: abilityLevel + 1,
          userDifficultyRate,
          action: ACTION_LIST.NONE,
        };
      }

      if (countPercent < 50) {
        return {
          abilityLevel,
          userDifficultyRate,
          action: ACTION_LIST.NONE,
        };
      }

      if (userDifficultyRate < 0) {
        userDifficultyRate = 0;
      }

      userDifficultyRate = userDifficultyRate + 1;
      if (userDifficultyRate === needRepeatCountForChangeDiff) {
        userDifficultyRate = 0;
        return {
          abilityLevel,
          userDifficultyRate,
          action: ACTION_LIST.SHOW_INCREASE,
        };
      }

      return {
        abilityLevel,
        userDifficultyRate,
        action: ACTION_LIST.NONE,
      };
    }

    if (countDiff.LOW >= countDiff.MEDIUM && countDiff.LOW > countDiff.HIGH && abilityLevel > 1) {
      const countPercent = Math.round((countDiff.LOW / partLength) * 100);

      if (countPercent >= 70 && abilityLevel > 1) {
        return {
          abilityLevel: abilityLevel - 1,
          userDifficultyRate,
          action: ACTION_LIST.NONE,
        };
      }

      if (countPercent < 50) {
        return {
          abilityLevel,
          userDifficultyRate,
          action: ACTION_LIST.NONE,
        };
      }

      if (userDifficultyRate > 0) {
        userDifficultyRate = 0;
      }

      userDifficultyRate = userDifficultyRate - 1;
      if (userDifficultyRate === -needRepeatCountForChangeDiff) {
        userDifficultyRate = 0;
        if (abilityLevel > 1) {
          return {
            abilityLevel,
            userDifficultyRate,
            action: ACTION_LIST.SHOW_DECREASE,
          };
        }
      }

      return {
        abilityLevel,
        userDifficultyRate,
        action: ACTION_LIST.NONE,
      };
    }

    return {
      abilityLevel,
      userDifficultyRate,
      action: ACTION_LIST.NONE,
    };
  };

  public static getCompletedNodeDifficult = (parts: IProgressPartWorkout[]) => {
    const countDiff = {
      [NodeDifficult.HIGH]: 0,
      [NodeDifficult.MEDIUM]: 0,
      [NodeDifficult.LOW]: 0,
    };

    parts.forEach((part) => {
      countDiff[part.completedDifficult]++;
    });

    return countDiff;
  };

  private getProgressInfoForBroadcast = async (client: IWorkoutSSE) => {
    let progress = await this.progressService.getItemById(client.progressId);

    if (!progress) {
      const error = new CustomError(400, `Progress with ${client.progressId} not found`);
      this._errorHandle(error, client);
      return;
    }

    const dayInfo = progress.days[client.dayNumber];
    const workoutInProgress = this.findWorkout(client.workoutId, dayInfo);

    if (client.needClearProgress && dayInfo.status !== WEEK_STATUS_TYPE.PASSED) {
      await this.progressService.updateById(client.progressId, {
        [`days.${client.dayNumber}.${workoutInProgress.type}.parts`]: [],
        [`days.${client.dayNumber}.${workoutInProgress.type}.status`]: WEEK_STATUS_TYPE.NO_PASSED,
        [`days.${client.dayNumber}.status`]: WEEK_STATUS_TYPE.NO_PASSED,
        [`days.${client.dayNumber}.${workoutInProgress.type}.percent`]: 0,
        [`days.${client.dayNumber}.${workoutInProgress.type}.viewedTime`]: 0,
        [`days.${client.dayNumber}.isAbilityUpdated`]: false,
      });
      client.needClearProgress = false;

      progress = await this.progressService.getItemById(client.progressId);
    }

    return { progress, workoutInProgress: workoutInProgress.info };
  };

  public broadcastById = async (userId: string, hr: number) => {
    this.clients.forEach((client) => {
      if (client.expire < Number(new Date())) {
        this.unsubscribeClient(userId);
      }
    });

    const client = this.clients.get(userId);
    if (!client) {
      const error = new CustomError(400, 'Client not found');
      this._errorHandle(error, client);
      return;
    }

    let workoutInProgress: IProgressWorkout, progress: IProgress;
    try {
      ({ workoutInProgress, progress } = await this.getProgressInfoForBroadcast(client));
    } catch (error) {
      this._errorHandle(error, client);
      return;
    }

    let workoutInfo: IWorkout;
    try {
      workoutInfo = await this.workoutService.getItemById(workoutInProgress.id);
    } catch (error) {
      this._errorHandle(error, client);
      return;
    }

    const nextIndex = workoutInProgress?.parts?.length + 1;
    const nextPart = workoutInfo?.video?.parts?.[nextIndex];

    if (nextPart) {
      const currentPartInProgress = WorkoutSSE.getCurrentPartInProgress(workoutInProgress?.parts);
      const currentPart = WorkoutSSE.getCurrentPart(currentPartInProgress?.partIndex, workoutInfo?.video?.parts);

      const targetDifficult = currentPartInProgress?.nextDifficult || NodeDifficult.MEDIUM;
      const targetHR: number =
        currentPart?.targetHR || currentPart?.nodes?.find((node) => node.difficult === NodeDifficult.MEDIUM)?.hr || 90;

      const nodeHrRange = WorkoutSSE.nodeHrRange(targetHR, client.percentHeartRate, client.hrDefault);
      const selectedNode = WorkoutSSE.selectionNextNode(nextPart, nodeHrRange, hr, targetDifficult);

      const payload =
        'data: ' +
        JSON.stringify({
          available: true,
          partIndex: nextIndex,
          difficult: selectedNode.difficult,
          defaultHrConfig: client.hrDefault,
          nodeHrRange,
          targetDifficult,
          targetHR,
          userHR: hr,
        }) +
        '\n\n';

      client.response.write(payload);
      return;
    }

    const baseOb = { available: false };
    if (progress.days[client.dayNumber]?.isAbilityUpdated) {
      this._successHandle(baseOb, client);
      return;
    }

    if (client.allowDisconnect) {
      this._successHandle(baseOb, client);
      return;
    }

    const popupCount = progress?.popupCount || 0;
    if (popupCount > 0) {
      client.allowDisconnect = true;
      this._successHandle(baseOb, client);
      return;
    }

    const partLength = workoutInfo?.video?.parts?.length || 0;
    if (!partLength) {
      client.allowDisconnect = true;
      this._successHandle(baseOb, client);
      return;
    }

    const partLengthWithoutLast = workoutInfo?.video?.parts?.length - 1;

    let user: IUser;
    try {
      user = await this.userService.getItemById(userId);
    } catch (error) {
      this._errorHandle(error, client);
      return;
    }

    if (!user) {
      this._errorHandle(new CustomError(404, this.localizations.ERRORS.USER.NOT_EXIST), client);
      return;
    }

    const abilityLevel = user.abilityLevel;
    const userDifficultyRate = progress?.userDifficultyRate || 0;

    let defaultSettings: IDefaultSettingDocument;
    try {
      defaultSettings = await this.defaultSettingsService.getDefaultSettings();
    } catch (error) {
      this._errorHandle(error, client);
      return;
    }

    const needRepeatCountForChangeDiff = defaultSettings?.needRepeatCountForChangeDiff || 2;

    const countDiff = WorkoutSSE.getCompletedNodeDifficult(workoutInProgress.parts);

    const newDifficultyInfo = WorkoutSSE.getNewDifficultyInfo(
      abilityLevel,
      userDifficultyRate,
      needRepeatCountForChangeDiff,
      countDiff,
      partLengthWithoutLast
    );

    if (userDifficultyRate !== newDifficultyInfo.userDifficultyRate) {
      try {
        await this.progressService.updateById(progress._id, {
          userDifficultyRate: newDifficultyInfo.userDifficultyRate,
        });
      } catch (error) {
        this._errorHandle(error, client);
        return;
      }
    }

    if (abilityLevel !== newDifficultyInfo.abilityLevel) {
      try {
        await this.userService.updateById(userId, { abilityLevel: newDifficultyInfo.abilityLevel });
        const customPlan = await this.customPlan.createOrUpdate(userId);
        const newProgress = await this.progressService.getItemById(progress._id);
        await this.progressService.updateProgressByPlan(newProgress, customPlan);
        await this.progressService.updateById(newProgress._id, { [`days.${client.dayNumber}.isAbilityUpdated`]: true });
      } catch (error) {
        logger.error('userId:', userId, 'workoutInProgress:', workoutInProgress.id, 'ERROR: ', error);
        this._errorHandle(error, client);
        return;
      }
    }
    client.allowDisconnect = true;
    client.actionAfterWorkout = newDifficultyInfo.action;

    const payload =
      'data: ' +
      JSON.stringify({
        available: false,
        action: client.actionAfterWorkout,
      }) +
      '\n\n';
    client.response.write(payload);
    if (client.allowDisconnect) this.unsubscribeClient(client.userId);
    return;
  };

  private _successHandle = (baseOb: { available: boolean; action?: ACTION_LIST }, client) => {
    if (client?.response) {
      const payload = 'data: ' + JSON.stringify(baseOb) + '\n\n';
      client.response.write(payload);
      if (client.allowDisconnect) this.unsubscribeClient(client.userId);
    }
  };

  private _errorHandle = (error, client) => {
    if (client?.response) {
      const payload = 'data: ' + JSON.stringify({ error: error.message }) + '\n\n';
      client.response.write(payload);
      this.unsubscribeClient(client.userId);
    }
  };
}
