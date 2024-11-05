import { mongoId } from '../../../utils/swagger/global.schema';
import { ACTION_LIST, WEEK_STATUS_TYPE } from '../progress.constant';
import { NodeDifficult } from '../../workout/workout.constant';

export const progressInfo = {
  day: { type: 'number', required: true, min: 1, example: 1, description: 'day number' },
  time: { type: 'number', required: true, min: 1, example: 1, description: 'seconds' },
  workoutId: { type: 'string', required: true },
};

export const progressInfoV2 = {
  day: { type: 'number', required: true, min: 1, example: 1, description: 'day number' },
  partIndex: { type: 'number', required: true, min: 0, example: 1, description: 'index part in workout' },
  workoutId: { type: 'string', required: true, description: 'its workoutId' },
  completeDifficult: {
    type: 'string',
    enum: Object.values(NodeDifficult),
    required: true,
    description: 'HARD, MEDIUM, LOW',
  },
  nextDifficult: {
    type: 'string',
    enum: Object.values(NodeDifficult),
    required: false,
    description: 'HARD, MEDIUM, LOW',
  },
  userHR: { type: 'number', required: false, min: 1, example: 80, description: 'user heart rate' },
};

export const progressRemovePart = {
  day: { type: 'number', required: true, min: 1, example: 1, description: 'day number' },
  partIndex: { type: 'number', required: true, min: 1, example: 0, description: 'index part in workout' },
  workoutId: { type: 'string', required: true, description: 'its workoutId' },
};



export const progressChangeDate = {
  day: { type: 'number', required: true, min: 1, example: 1, description: 'day number' },
};

export const progressWorkoutByDate={
  date:{type:'date',required:true,example:'2023/01/31'}
}

export const progressWorkoutDates={
  startDate:{type:'date',required:true,example:'2023/01/31'},
  endDate:{type:'date',required:true,example:'2023/01/31'}
}

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
    time: { type: 'number', example: 0, required: true },
    viewedTime: { type: 'number', example: 130, required: true },
    percent: { type: 'number', example: 0, required: true },
    completedDate: {
      type: 'date',
      example: '2022-03-29T00:00:00.000Z',
      required: true,
    },
  },
};

const day = {
  type: 'object',
  properties: {
    day: { type: 'number', example: 1, required: true },
    status: {
      type: 'string',
      enum: Object.keys(WEEK_STATUS_TYPE),
      example: WEEK_STATUS_TYPE.NO_PASSED,
      required: true,
    },
    workout: workoutDay,
    altWorkout: workoutDay,
  },
};

export const progressSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      example: '624ab0e7ffe694fefbffe78b',
      required: true,
    },
    active: {
      type: 'boolean',
      example: true,
      required: true,
    },
    userId: {
      type: 'string',
      example: '623c1e5255f99becd1ad86d6',
      required: true,
    },
    planId: {
      type: 'string',
      example: '624ab0e7ffe694fefbffe788',
      required: true,
    },
    days: {
      type: 'array',
      items: day,
    },
  },
};

export const progressWorkoutDateSchema = {
  type: 'object',
  properties: {
    message:{ type:'string',default:'Data Fetched Successfully'},
    data:{
      type: 'object',
      properties: {
        dates: { type: 'array', example: "[{'date': '2022-12-13T16:31:48.752Z},{'date': '2022-12-13T16:31:48.752Z}]", required: true },
      },
    }
  },
};

export const progressWorkoutSchema = {
  type: 'object',
  properties: {
    message:{ type:'string',default:'Data Fetched Successfully'},
    data:day
  },
};

export const saveUserRateForProgressSchema = {
  type: 'object',
  properties: {
    userRate: {
      type: 'number',
      example: 3,
      min: 1,
      max: 5,
      required: true,
    },
    day: {
      type: 'number',
      example: 3,
      required: true,
    },
    workoutId: {
      type: 'string',
      required: true,
    },
  },
};

export const progressActionSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: Object.keys(ACTION_LIST),
      example: ACTION_LIST.NONE,
      required: true,
    },
  },
};

export const fullSaveSchema = {
  type: 'object',
  properties: {
    passedWorkout: { type: 'number', default: 1 },
    result: {
      type: 'object',
      properties: {
        message: { type: 'string', default: 'Success' },
      },
    },
  },
};

export const resetDaySchema = {
  type: 'object',
  properties: {
    day: { type: 'number', example: 1, required: true },
    progressId: mongoId(true),
    workoutId: mongoId(true),
  },
};
