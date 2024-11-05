import { FilterQuery, ObjectId } from 'mongoose';

import { CustomError, getPaginationInfo } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';

import UserService from './user.service';
import WorkoutService from '../workout/workout.service';
import QuizAnswerService from '../quiz_answer/quiz_answer.service';
import ProgressService from '../progress/progress.service';
import PaymentController from '../payment/stripe/stripe.controller';
import PaymentSettingService from '../payment_settings/payment_settings.service';
import TrackService from '../track/track.service';

import { ACTION_FOR_SAVED_VIDEO, ROLE, STATUS, UNITS } from './user.constant';
import { IUser, IHints } from './user.types';
import { IAuthInfo } from '../auth/auth.types';
import { URL } from 'url';
import { BASE_URL } from '../../config';
import CustomPlan from '../plan/custom_plan';
import { PLAN_TYPE } from '../plan/plan.constant';

import logger from '../../utils/logger';

export default class UserController {
  private userService: UserService;
  private workoutService: WorkoutService;
  private quizAnswerService: QuizAnswerService;
  private progressService: ProgressService;
  private trackService: TrackService;
  private paymentController: PaymentController;
  private paymentSettingService: PaymentSettingService;

  private customPlan: CustomPlan;

  private localizations: ILocalization;

  constructor() {
    this.userService = new UserService();
    this.workoutService = new WorkoutService();
    this.quizAnswerService = new QuizAnswerService();
    this.paymentSettingService = new PaymentSettingService();
    this.trackService = new TrackService();
    this.progressService = new ProgressService();
    this.paymentController = new PaymentController();
    this.customPlan = new CustomPlan();

    this.localizations = localizations['en'];
  }

  editUserForAdmin = async (id: string, user: IUser) => {
    const oldUser = await this.userService.getItemById(id);

    if (user.height) {
      const [ft, inch] = user.height.toString().split('/');
      if (!ft || !inch) throw new CustomError(400, 'height is not valid');
      user.height = +(+ft * 30.48 + +inch * 2.54).toFixed(2);
    }

    const updatedUser = await this.userService.updateById(id, user, { password: 0, savedWorkouts: 0 });

    if (
      (user.abilityLevel && user.abilityLevel !== oldUser.abilityLevel) ||
      (user.workoutStyleList?.length && this._diff(user.workoutStyleList, oldUser.workoutStyleList).length) ||
      (user.bodyPartList?.length && this._diff(user.bodyPartList, oldUser.bodyPartList).length)
    ) {
      const customPlan = await this.customPlan.createOrUpdate(updatedUser._id);

      const progress = await this.progressService.getItem({
        userId: updatedUser._id,
        active: true,
      });
      if (progress?.type && progress.type === PLAN_TYPE.MY_PLAN) {
        await this.progressService.updateProgressByPlan(progress, customPlan);
      }
    }

    return { status: 200, payload: updatedUser };
  };

  getUserHintById = async ({ userId }: { userId: string }) => {
    logger.debug(`getUserHintById: ${userId}`);
    let userData;
    try {
      userData = await this.userService.getItemById(userId);
    } catch (error) {
      throw new CustomError(500, 'get hints fail');
    }

    const defaultHints: IHints = {
      altWorkout: false,
      player: false,
      ratePopup: false,
      viewPlan: false,
      weekData: true,
    };

    return {
      status: 200,
      payload: {
        ...(userData.hints || defaultHints),
      },
    };
  };

  editUserHintById = async ({ userId }: { userId: string }, data: IHints) => {
    let updateInfo;
    try {
      updateInfo = await this.userService.updateById(userId, { hints: data });
    } catch (error) {
      throw new CustomError(500, 'update hints fail');
    }

    return {
      status: 200,
      payload: {
        ...updateInfo.hints,
      },
    };
  };

  editUser = async (user: IUser, { userId }: IAuthInfo) => {
    const infoUser = await this.userService.getItemById(userId);

    if (user.height) {
    
      const [ft, inch] = user.height.toString().split('/');
      if (!ft || !inch) throw new CustomError(400, 'height is not valid');
      if(infoUser.unit == undefined)
        {
          user.height = +(+ft * 30.48 + +inch * 2.54).toFixed(2);   
        }
      else if(infoUser.unit == UNITS.KG) {
        user.height = +(+ft * 100 + +inch).toFixed(2)
      }
      else {
        user.height = +(+ft * 12 + +inch).toFixed(2)
      }
    }

       if (user.email) {
            user.email = user.email.toLowerCase();
          }
      
    let updatedUser;
    try {
      updatedUser = await this.userService.updateById(userId, user, { password: 0, savedWorkouts: 0 });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email === 1) {
        throw new CustomError(400, 'This email is already registered');
      }
      throw new CustomError(500, 'Update user fail');
    }

    const userAnswers = await this.quizAnswerService.getAnswer(updatedUser._id);

    const hasUserCompletedQuiz = Object.keys(userAnswers).length;
    const hasWorkoutStyleListChanged = user.workoutStyleList?.length && this._diff(user.workoutStyleList, infoUser.workoutStyleList).length;
    const hasBodyPartListChanged = user.bodyPartList?.length && this._diff(user.bodyPartList, infoUser.bodyPartList).length;

    if (hasUserCompletedQuiz && (hasWorkoutStyleListChanged || hasBodyPartListChanged)) {
      const customPlan = await this.customPlan.createOrUpdate(updatedUser._id);

      const progress = await this.progressService.getItem({
        userId: updatedUser._id,
        active: true,
      });
  
      if (progress?.type && progress.type === PLAN_TYPE.MY_PLAN) {
        await this.progressService.updateProgressByPlan(progress, customPlan);
      }
    }

    return { status: 200, payload: updatedUser };
  };

  setVerifiedUser = (id: ObjectId) => {
    return this.userService.updateById(id, { status: STATUS.VERIFIED }, { password: 0, savedWorkouts: 0 });
  };

  getUsers = async ({ offset, limit, text }) => {
    console.log('123123123')
    const range = getPaginationInfo({ value: offset, default: 0 }, { value: limit, default: 9 });
    const filter: FilterQuery<IUser> = {};
    if (text) {
      const regexp = new RegExp(text.split(/ +/).join('| ?'), 'i');
      filter['$or'] = [{ name: { $regex: regexp } }, { email: { $regex: regexp } }];
    }

    const [users, count] = await Promise.all([
      this.userService.get(
        filter,
        { _id: 1, name: 1, email: 1, role: 1, status: 1 },
        { skip: range.offset, limit: range.limit }
      ),
      this.userService.getCount(filter),
    ]);

    return {
      items: users,
      count,
    };
  };

  getUserById = async (id: string, { userId, role }: IAuthInfo, UTC) => {
    if (role !== ROLE.ADMIN && id !== userId) {
      throw new CustomError(403, this.localizations.ERRORS.OTHER.FORBIDDEN);
    }
    
    const user = await this.userService.getItemById(id, {
      password: 0,
      savedWorkouts: 0,
    });

    if (!user) {
      throw new CustomError(404, this.localizations.ERRORS.USER.NOT_EXIST);
    }
    
    const userAnswers = await this.quizAnswerService.getAnswer(id);
    const tracks =  await this.trackService.getAllTracks(user._id)
    const progress = await this.progressService.getItem({
      userId: user._id,
      active: true,
    });

    let currentDay = null;
    let planId = null;
    if (progress) {
      planId = progress.planId;
      currentDay = this.progressService.getCurrentDayV2(progress, UTC);
    }

    const avatarUrl = user.avatar ? new URL(`/static/images/avatars/${user.avatar}`, BASE_URL).toString() : null;

      let paymentInformation,isFreeSubscribeAvailable = false;
    
    try {
      const setting = await this.paymentSettingService.getPaymentSettings();
      isFreeSubscribeAvailable = setting?.freeSubscribe?.available;

    paymentInformation = await this.paymentController.getPaymentMethod({ userId: user._id });
    } catch (e) {
      paymentInformation = [];
    }

    if (user.height) {
      if(user.unit == UNITS.KG) {
      const bufCm = +user.height;
      const cm = Math.round(bufCm % 100);
      const meter = Math.floor(bufCm / 100) ;
      user.height = `${meter}/${cm} `;
      user.weight = `${ Math.round(+user.weight * 0.45359237)}`;
    }
      else {
        const bufInch = +user.height  * 0.3937;
        const Inch = Math.round(bufInch % 12);
        const feet = Math.floor(bufInch / 12) ;
        user.height = `${feet}/${Inch}`;
        user.weight = `${user.weight}`;
      }
    }

    return {
      user: {
        ...user,
        planId,
        currentDay,
        avatarUrl,
      },
      paymentInformation,
      userAnswers,
      tracks,
      isFreeSubscribeAvailable,

    };
  };

  getSavedWorkouts = async ({ userId }, { offset, limit }) => {
    const range = getPaginationInfo({ value: offset, default: 0 }, { value: limit, default: 9 });
    const user = await this.userService.getItemById(userId);

    return this.workoutService.getSavedWorkouts(
      {
        _id: { $in: user.savedWorkouts || [] },
      },
      range
    );
  };

  addOrRemoveSavedWorkout = async (
    { userId },
    { id: workoutId, action }: { id: ObjectId; action: ACTION_FOR_SAVED_VIDEO }
  ) => {
    logger.debug(`addOrRemoveSavedWorkout: ${userId}, ${workoutId}, ${action}`);

    const updateOption = {};

    const workoutExists = await this.workoutService.exists({ _id: workoutId });
    if (!workoutExists) throw new CustomError(404, this.localizations.ERRORS.WORKOUT.NOT_FOUND);

    if (action == ACTION_FOR_SAVED_VIDEO.ADD) updateOption['$addToSet'] = { savedWorkouts: workoutId };
    else if (action == ACTION_FOR_SAVED_VIDEO.REMOVE) updateOption['$pull'] = { savedWorkouts: workoutId };

    await this.userService.updateById(userId, updateOption);

    return {
      message: 'Success',
    };
  };

  deleteUser = async (id: string) => {
    await this.userService.deleteById(id);

    return { status: 204 };
  };

  getPermissions = async () => {
    return {
      roles: Object.keys(ROLE),
      statusArr: Object.keys(STATUS),
    };
  };

  private _diff<T1, T2, T>(a1: Array<T | T1>, a2: Array<T | T2>) {
    return (<Array<T1 | T2>>a1.filter((i) => !a2.includes(<T>i))).concat(
      <Array<T2>>a2.filter((i) => !a1.includes(<T>i))
    );
  }
}
