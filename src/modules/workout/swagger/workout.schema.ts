import { NodeDifficult, WorkoutBodyPart, WorkoutStyle } from '../workout.constant';

export const workout = {
  title: { type: 'string', required: true },
  difficulty: { type: 'number', required: true, min: 1, max: 10, example: 1 },
  bodyPart: {
    type: 'string',
    enum: Object.keys(WorkoutBodyPart),
    default: WorkoutBodyPart.FULL_BODY,
    required: true,
  },
  style: {
    type: 'string',
    enum: Object.keys(WorkoutStyle),
    default: WorkoutStyle.BARRE,
    required: true,
  },
  instructor: { type: 'string', required: true },
  video: {
    type: 'object',
    required: false,
    properties: {
      link: { type: 'string', required: true },
      thumbnail: { type: 'string', required: true },
      customThumbnail: { type: 'string', required: true },
      duration: { type: 'number', required: true },
      parts: {
        type: 'array',
        required: false,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            targetHR: { type: 'number', required: true },
            averageHR: { type: 'number', default: 0 },
            completedNum: { type: 'number', default: 0 },
            nodes: {
              type: 'array',
              required: true,
              items: {
                type: 'object',
                properties: {
                  timeStart: { type: 'number', required: true },
                  timeEnd: { type: 'number', required: true },
                  difficult: { type: 'string', enum: Object.values(NodeDifficult), required: true },
                },
              },
            },
          },
        },
      },
    },
  },
  calory: { type: 'number', required: true },
  hr: { type: 'number', required: true },
  equipments: {
    type: 'array',
    required: false,
    items: {
      type: 'string',
      description: 'Equipment name',
    },
  },
};

export const createWorkout = {
  title: { type: 'string', required: true },
  difficulty: { type: 'number', required: true, min: 1, max: 10, example: 1 },
  bodyPart: {
    type: 'string',
    enum: Object.keys(WorkoutBodyPart),
    default: WorkoutBodyPart.FULL_BODY,
    required: true,
  },
  style: {
    type: 'string',
    enum: Object.keys(WorkoutStyle),
    default: WorkoutStyle.BARRE,
    required: true,
  },
  instructor: { type: 'string', required: true },
  calory: { type: 'number', required: true },
  hr: { type: 'number', required: true },
  equipments: {
    type: 'array',
    required: false,
    items: {
      type: 'string',
      description: 'Equipment name',
    },
  },
};

export const workoutWithNotRequiredFields = {
  title: { type: 'string', required: false },
  difficulty: { type: 'number', required: false, min: 1, max: 10, example: 1 },
  bodyPart: {
    type: 'string',
    enum: Object.keys(WorkoutBodyPart),
    default: WorkoutBodyPart.FULL_BODY,
    required: false,
  },
  instructor: { type: 'string', required: false },
  style: {
    type: 'string',
    enum: Object.keys(WorkoutStyle),
    default: WorkoutStyle.BARRE,
    required: false,
  },
  // video: {
  //   type: 'object',
  //   required: false,
  //   properties: {
  //     link: { type: 'string', required: true },
  //     thumbnail: { type: 'string', required: true },
  //     duration: { type: 'number', required: true },
  //     parts: {
  //       type: 'array',
  //       required: false,
  //       items: {
  //         type: 'object',
  //         properties: {
  //           timeStart: { type: 'number', required: true },
  //           timeEnd: { type: 'number', required: true },
  //           name: { type: 'string', required: true },
  //           hr: { type: 'number', required: true },
  //         },
  //       },
  //     },
  //   },
  // },
  hr: { type: 'number', required: false },
  calory: { type: 'number', required: false },
  equipments: {
    type: 'array',
    required: false,
    items: {
      type: 'string',
      description: 'Equipment name',
    },
  },
};

export const fullWorkoutSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', required: true },
    ...workout,
  },
};

export const updateVideoInWorkout = {
  url: {
    type: 'string',
    required: true,
    example: 'https://vimeo.com/679679362',
    description:
      'Url must be like https://vimeo.com/679679362 for publish or https://vimeo.com/679679362/772a4d809b for private',
  },
  parts: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        targetHR: { type: 'number', required: true },
        averageHR: { type: 'number', default: 0 },
        completedNum: { type: 'number', default: 0 },
        nodes: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            properties: {
              timeStart: { type: 'number', required: true },
              timeEnd: { type: 'number', required: true },
              difficult: { type: 'string', enum: Object.values(NodeDifficult), required: true },
            },
          },
        },
      },
    },
  },
};

export const workoutsRangeId = {
  type: 'array',
  items: {
    type: 'string',
    example: '623c1e7e55f99becd1ad86df',
    required: true,
  },
};

export const getWorkoutAllResponseSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', required: true },
          ...workout,
          itsSavedWorkout: { type: 'boolean', default: false, required: true },
        },
      },
    },
    count: { type: 'number' },
  },
};

/* 
{
  "planId": "string",
  "passed": {
    "duration": "string",
    "count_workout": "number",
    "calories": "number",
    "difficulty": "number",
  },
  "not_passed": {
    "workoutId": "string",
    "video": {
      "url": "string",
      "img": "string",
      "title": "string",
      "duration": "string"
    },
    "equipment": "string" || "array<string>"
  },
}  
*/
