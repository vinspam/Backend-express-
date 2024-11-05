import * as UserConstant from '../user.constant';
import { quizAnswersProperties } from '../../quiz_answer/swagger';

const user = {
  name: { type: 'string', required: true },
  email: { type: 'string', required: true },
  role: {
    type: 'string',
    enum: UserConstant.ROLE,
    default: UserConstant.ROLE.USER,
    required: false,
  },
};

const additionUser = {
  avatar: { type: 'string', description: 'avatar name file in store', required: true },
  gender: { type: 'string', enum: Object.keys(UserConstant.GENDER), required: true },
  height: { type: 'string', required: true },
  weight: { type: 'number', required: true },
  abilityLevel: { type: 'number', required: true },
  countWorkoutRepeat: { type: 'number', description: 'how many workouts in a week for user', required: true },
  birthday: { type: 'string', format: 'date-time', required: true },
  role: {
    type: 'string',
    enum: Object.keys(UserConstant.ROLE),
    default: UserConstant.ROLE.USER,
  },
  status: {
    type: 'string',
    enum: Object.keys(UserConstant.STATUS),
    default: UserConstant.STATUS.NOT_VERIFIED,
  },
};

export const permissionsSchema = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.keys(UserConstant.ROLE),
      },
      example: Object.keys(UserConstant.ROLE),
      required: true,
    },
    statusArr: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.keys(UserConstant.STATUS),
      },
      example: Object.keys(UserConstant.STATUS),
      required: true,
    },
  },
};

export const shortUserSchemaWithoutPassword = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...user,
    status: {
      type: 'string',
      enum: Object.keys(UserConstant.STATUS),
      default: UserConstant.STATUS.VERIFIED,
    },
  },
};

export const shortUserSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...user,
    password: { type: 'string', required: true },
  },
};

export const fullUserSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...user,
    ...additionUser,
    planId: { type: 'string', description: 'current plan id' },
    avatarUrl: { type: 'string', description: 'url for getting avatar in store' },
    currentDay: { type: 'number', description: 'day progress for user', required: true },
    userAnswers: {
      type: 'array',
      items: {
        type: 'object',
        properties: quizAnswersProperties,
      },
    },
  },
};
