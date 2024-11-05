import url_1 from 'url';
import { BASE_URL } from '../../../config';
import { mongoObject } from '../../../utils/swagger/global.schema';
import { WEEK_STATUS_TYPE } from '../../progress/progress.constant';
import { PLAN_TYPE } from '../plan.constant';
import { WorkoutBodyPart, WorkoutStyle } from '../../workout/workout.constant';

const workouts = {
  type: 'array',
  items: {
    type: 'object',
    nullable: true,
    items: {
      type: 'string',
      required: true,
      description: `workout id or null for day off`,
    },
    required: true,
  },
  example: ['623c1e7e55f99becd1ad86df', null, '622efe9d9ea159c9c874b4c1', null],
  required: false,
};

const workoutsView = {
  type: 'array',
  items: {
    $ref: '#/components/schemas/fullWorkoutSchema',
  },
  required: false,
};

export const fullPlan = {
  type: {
    type: 'string',
    enum: Object.keys(PLAN_TYPE),
    example: PLAN_TYPE.CHALLENGE,
    required: true,
  },
  title: { type: 'string', required: true },
  description: { type: 'string', required: false },
  difficulty: { type: 'number', required: false, min: 1, max: 10, example: 1 },
  workouts: workouts,
  altWorkouts: workouts,
  isPrimary: { type: 'boolean', required: false },
  thumbnail: { type: 'string', required: false },
  thumbnailName: { type: 'string', required: false },
};

export const fullPlanForView = {
  type: {
    type: 'string',
    enum: Object.keys(PLAN_TYPE),
    example: PLAN_TYPE.CHALLENGE,
    required: true,
  },
  title: { type: 'string', required: true },
  description: { type: 'string', required: false },
  difficulty: { type: 'number', required: false, min: 1, max: 10, example: 1 },
  workouts: workoutsView,
  altWorkouts: workoutsView,
  isPrimary: { type: 'boolean', required: false },
  thumbnail: { type: 'string', required: false },
  offsetDays: { type: 'number', required: true },
};

export const shortPlan = {
  type: {
    type: 'string',
    enum: Object.keys(PLAN_TYPE),
    example: PLAN_TYPE.CHALLENGE,
    required: true,
  },
  title: { type: 'string', required: true },
  description: { type: 'string', required: false },
  difficulty: { type: 'number', required: false, min: 1, max: 10, example: 1 },
};

export const shortPlanForUser = {
  type: {
    type: 'string',
    enum: Object.keys(PLAN_TYPE),
    example: PLAN_TYPE.CHALLENGE,
    required: true,
  },
  title: { type: 'string', required: true },
  description: { type: 'string', required: false },
  difficulty: { type: 'number', required: false, min: 1, max: 10, example: 1 },
  thumbnails: {
    type: 'string',
    example: new url_1.URL(`/assets/quiz/image.png`, BASE_URL).toString(),
    required: true,
  },
};

export const fullPlanWithIdSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...fullPlan,
  },
};

export const shortPlanWithIdSchema = {
  type: 'object',
  properties: {
    isPrimary: { type: 'boolean', required: false },
    ...mongoObject,
    ...shortPlan,
  },
};

export const shortPlanForUserWithIdSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...shortPlanForUser,
  },
};

export const fullPlanWithIdAndWithWorkoutInfoSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...fullPlanForView,
  },
};

const workoutDay = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: '623c1e7e55f99becd1ad86df',
      required: true,
    },
    status: {
      type: 'string',
      enum: Object.keys(WEEK_STATUS_TYPE),
      example: WEEK_STATUS_TYPE.NO_PASSED,
      required: true,
    },
    percent: { type: 'number', example: 0, required: true },
  },
};

const dayPlan = {
  type: 'object',
  properties: {
    day: { type: 'number', example: 1, required: true },
    status: {
      type: 'string',
      enum: Object.keys(WEEK_STATUS_TYPE),
      example: WEEK_STATUS_TYPE.NO_PASSED,
      required: true,
    },
    currentDay: {
      type: 'boolean',
      example: false,
      required: true,
    },
    workout: workoutDay,
    altWorkout: workoutDay,
    completedDate: {
      type: 'date',
      example: '2022-03-29T00:00:00.000Z',
      required: true,
    },
  },
};

export const fullViewPlanForWeekSchema = {
  type: 'object',
  properties: {
    currentDay: { type: 'number', example: 1, required: true },
    currentWeek: { type: 'number', example: 1, required: true },
    dayStart: { type: 'date', example: '2022-03-29T00:00:00.000Z', required: true },
    dayEnd: { type: 'date', example: '2022-04-04T23:59:59.999Z', required: true },
    planId: { type: 'string', example: '624305a2efa3d49ac2133cd6', required: true },
    progressId: { type: 'string', example: '624ab9694845f8bb39392177', required: true },
    weekPlan: {
      type: 'array',
      items: dayPlan,
      required: true,
    },
  },
};

const dayPlanForWeeks = {
  type: 'object',
  properties: {
    day: { type: 'number', example: 1, required: true },
    title: { type: 'string', example: 'test workout', required: true },
    status: {
      type: 'string',
      enum: Object.keys(WEEK_STATUS_TYPE),
      example: WEEK_STATUS_TYPE.NO_PASSED,
      required: true,
    },
    percent: { type: 'number', example: 100, required: true },
    thumbnails: {
      type: 'string',
      example: new url_1.URL(`/assets/quiz/image.png`, BASE_URL).toString(),
      required: true,
    },
    workoutId: { type: 'string', example: '624ab9694845f8bb39392177', required: true },
  },
};

const weekPlanForWeeks = {
  type: 'array',
  required: true,
  items: dayPlanForWeeks,
};

export const fullViewPlanForWeeksSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    indexCurrentWeek: { type: 'number', example: 0, required: true },
    weeksPlan: {
      type: 'array',
      items: weekPlanForWeeks,
      required: true,
    },
  },
};

const challengeDayPlanForWeeks = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'test workout', required: true },
    thumbnails: {
      type: 'string',
      example: new url_1.URL(`/assets/quiz/image.png`, BASE_URL).toString(),
      required: true,
    },
    workoutId: { type: 'string', example: '624ab9694845f8bb39392177', required: true },
    isDayOff: { type: 'boolean', example: 'false', required: true },
  },
};

const challengeWeekPlanForWeeks = {
  type: 'array',
  required: true,
  items: challengeDayPlanForWeeks,
};

export const fullChallengeViewPlanForWeeks = {
  type: 'object',
  properties: {
    indexCurrentWeek: { type: 'number', example: 0, required: true },
    weeksPlan: {
      type: 'array',
      items: challengeWeekPlanForWeeks,
      required: true,
    },
  },
};

export const schemaForTestV2 = {
  type: 'object',
  properties: {
    difficulty: { type: 'number', required: false, min: 1, max: 10, example: 1 },
    bodyPartList: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(WorkoutBodyPart),
      },
      required: true,
    },
    workoutStyleList: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(WorkoutStyle),
      },
      required: true,
    },
    workouts: {
      type: 'array',
      items: {
        type: 'object',
        nullable: true,
        properties: {
          title: { type: 'string', required: true },
          difficulty: { type: 'number', required: true, min: 1, max: 10, example: 1 },
          bodyPart: {
            type: 'string',
            enum: Object.values(WorkoutBodyPart),
            default: WorkoutBodyPart.FULL_BODY,
            required: true,
          },
          style: {
            type: 'string',
            enum: Object.values(WorkoutStyle),
            default: WorkoutStyle.BARRE,
            required: true,
          },
        },

        required: true,
      },
      required: false,
    },
  },
};
