import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { CustomError } from '../../utils/helpers/';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';

import { REFRESH_TOKEN_SECRET } from '../../config';
import { PLATFORM } from './auth.constant';

import AuthService from './auth.service';
import ProgressService from '../progress/progress.service';

import UserService from '../user/user.service';
import QuizAnswerService from '../quiz_answer/quiz_answer.service';

import { IAuth } from './auth.types';
import { IUser } from '../user/user.types';
import PaymentController from '../payment/stripe/stripe.controller';
import { ROLE, UNITS } from '../user/user.constant';
import PlanService from '../plan/plan.service';
import WorkoutService from '../workout/workout.service';
import CustomPlan from '../plan/custom_plan';
import { workoutsPlan } from '../plan/plan.types';
export default class AuthController {
  private service: AuthService;
  private userService: UserService;
  private quizAnswersService: QuizAnswerService;
  private paymentController: PaymentController;
  private progressService: ProgressService;
  private workoutService: WorkoutService;
  private localizations: ILocalization;

  private passwordRegExp = new RegExp(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g);

  constructor() {
    this.service = new AuthService();
    this.userService = new UserService();
    this.quizAnswersService = new QuizAnswerService();
    this.paymentController = new PaymentController();
    this.progressService = new ProgressService();
    this.workoutService = new WorkoutService();

    this.localizations = localizations['en'];
  }

  signUp = async (deviceInfo: { deviceId: string; platform: PLATFORM }, data: IUser) => {
    if (!data?.password?.match(this.passwordRegExp)) {
      throw new CustomError(400, this.localizations.ERRORS.OTHER.PASSWORD_ERROR);
    }
    

    let newUser: IUser;
    try {
      data.email = data.email.toLowerCase();
      newUser = await this.userService.create(data);
    } catch (error) {
      console.log(error)
      if (error.code == 11000) throw new CustomError(409, this.localizations.ERRORS.USER.USER_ALREADY_EXIST);
      else throw new Error(this.localizations.ERRORS.USER.USER_NOT_CREATED);
    }

    try {
      await this.paymentController.createCustomer({ userId: newUser._id, name: newUser.name, email: newUser.email });
    } catch (e) {
      await this.userService.deleteById(newUser._id);
      throw new CustomError(500, 'Stripe: ' + e.message);
    }
    // await this.workoutService.updatePriorityInfo()
    // return {result:true}
    // const customPlan = new CustomPlan()
    // const workoutsId = <workoutsPlan>[
    //   '635aa565276ac6156d95804a',
    //   '6352ede52bb9e68754246574',
    //   null,
    //   '634ebe01e7d7bc6455afc62a',
    //   '635aa856276ac6156d958702',
    //   '635aa658276ac6156d958360',
    //   null,
    //   '634f0af9e7d7bc6455afc94e',
    //   '635ab62a276ac6156d958fa7',
    //   null,
    //   '6352ecaa2bb9e68754246564',
    //   '635aa856276ac6156d958702',
    //   '6352ede52bb9e68754246574',
    //   null,
    //   '635ab62a276ac6156d958fa7',
    //   '635aa658276ac6156d958360',
    //   null,
    //   '634ee153e7d7bc6455afc856',
    //   '634ee153e7d7bc6455afc856',
    //   '635aa565276ac6156d95804a',
    //   null,
    //   '64e7ad9e8eb19468643f0dac',
    //   '64e7ad9e8eb19468643f0dac',
    //   null,
    //   '634f0af9e7d7bc6455afc94e',
    //   '6352ecaa2bb9e68754246564',
    //   '635aa707276ac6156d95853c',
    //   null
    // ]
    // await customPlan.sortWorkOut(workoutsId)
    // return {result : true}
    const authParams = this.service.generate({
      userId: newUser._id,
      role: newUser.role,
      status: newUser.status,
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform,
    });

    await this.service.create({
      ...deviceInfo,
      userId: newUser._id,
      refreshToken: authParams.refreshToken
    } as IAuth);

    // @ts-ignore
    delete newUser._doc.password;
    // @ts-ignore
    delete newUser._doc.savedWorkouts;

    return {
      status: 201,
      payload: {
        auth: authParams,
        user: newUser,
        quizPassed: false,
      },
    };
  };

  signIn = async ({ deviceId, platform }, { email, password }, role: ROLE = ROLE.USER) => {
    email = email.toLowerCase();

    const foundUser = await this.userService.getItem({ email });

    if (!foundUser) throw new Error(this.localizations.ERRORS.USER.EMAIL_OR_PASSWORD_INVALID);

    if (foundUser.role !== role) {
      throw new CustomError(403, this.localizations.ERRORS.OTHER.FORBIDDEN);
    }

    const { password: userPassword, ...user } = foundUser;

    const invalid: boolean = await bcrypt.compare(password, userPassword);
    if (!invalid) throw new Error(this.localizations.ERRORS.USER.EMAIL_OR_PASSWORD_INVALID);

    const auth = await this.setAuth(deviceId, platform, foundUser);

    const quizPassed = await this.quizAnswersService.exists({ userId: user._id });

    let paymentInformation;

    try {
      paymentInformation = await this.paymentController.getPaymentMethod({ userId: user._id });
    } catch (e) {
      paymentInformation = [];
    }

    const joinedPlan = await this.progressService.exists({ userId: user._id, active: true });

    return {
      status: 200,
      payload: {
        auth,
        user,
        quizPassed,
        paymentInformation,
        joinedPlan,
      },
    };
  };

  updateToken = async ({ deviceId, platform }, refreshToken: { refreshToken: string }) => {
    const authParams = await this.service.getItem(refreshToken, { _id: 0, userId: 1, deviceId: 1, platform: 1 });
    if (!authParams) throw new CustomError(404, this.localizations.ERRORS.OTHER.REFRESH_TOKEN_INVALID);

    const decodeToken = jwt.verify(refreshToken.refreshToken, REFRESH_TOKEN_SECRET);
    if (deviceId !== decodeToken.deviceId) throw new CustomError(403, this.localizations.ERRORS.OTHER.FORBIDDEN);

    const user = await this.userService.getItemById(authParams.userId, { password: 0 });

    const newAuthParams = this.service.generate({
      userId: user._id,
      role: user.role,
      status: user.status,
      deviceId: deviceId,
      platform: platform,
    });

    await this.service.create({
      deviceId: deviceId,
      platform: platform,
      userId: user._id,
      refreshToken: authParams.refreshToken,
    } as IAuth);

    return {
      status: 201,
      payload: {
        auth: newAuthParams,
        user,
      },
    };
  };

  logout = async ({ deviceId }, info) => {
    if (deviceId !== info.deviceId) throw new CustomError(401, this.localizations.ERRORS.OTHER.UNAUTHORIZED);

    await this.service.delete({ deviceId, userId: info.userId, platform: info.platform });

    return { message: 'Success' };
  };

  setAuth = async (deviceId: string, platform: PLATFORM, user: IUser) => {
    const auth = await this.service.generate({
      userId: user._id,
      role: user.role,
      status: user.status,
      deviceId,
      platform,
    });
    await this.service.updateOrCreate({
      userId: user._id,
      deviceId,
      platform,
    }, auth.refreshToken);

    return auth;
  }

  setTempAuth = async (user: IUser) => {
    const expiresIn = 150; // 2.5 min
    const auth = await this.service.generate({
      userId: user._id,
      role: user.role,
      status: user.status,
      deviceId: 'temp',
      platform: PLATFORM.WEB,
    }, expiresIn);
    await this.service.updateOrCreate({
      userId: user._id,
      deviceId: 'temp',
      platform: PLATFORM.WEB,
    }, auth.refreshToken);

    return auth;
  }

  createTempToken = async ({ email, password }, role: ROLE = ROLE.USER) => {
    email = email.toLowerCase();

    const foundUser = await this.userService.getItem({ email });

    if (!foundUser) throw new Error(this.localizations.ERRORS.USER.EMAIL_OR_PASSWORD_INVALID);

    if (foundUser.role !== role) {
      throw new CustomError(403, this.localizations.ERRORS.OTHER.FORBIDDEN);
    }

    const { password: userPassword, ...user } = foundUser;

    const invalid: boolean = await bcrypt.compare(password, userPassword);
    if (!invalid) throw new Error(this.localizations.ERRORS.USER.EMAIL_OR_PASSWORD_INVALID);

    const auth = await this.setTempAuth(foundUser);

    return {
      status: 200,
      payload: {
        auth,
        user,
      },
    };
  }

  updateTempTokenWithLongLiveToken = async ({ deviceId, platform }, refreshToken: { refreshToken: string }) => {
    const authParams = await this.service.getItem(refreshToken, { _id: 1, userId: 1 });
    if (!authParams) throw new CustomError(404, this.localizations.ERRORS.OTHER.REFRESH_TOKEN_INVALID);

    const user = await this.userService.getItemById(authParams.userId, { password: 0 });

    // remove temp token
    await this.service.delete({ _id: authParams._id });

    // create long lived refresh token
    const newAuthParams = this.service.generate({
      userId: user._id,
      role: user.role,
      status: user.status,
      deviceId: deviceId,
      platform: platform,
    });

    await this.service.create({
      deviceId: deviceId,
      platform: platform,
      userId: user._id,
      refreshToken: newAuthParams.refreshToken,
    } as IAuth);

    return {
      status: 201,
      payload: {
        auth: newAuthParams,
        user,
      },
    };
  };
}
