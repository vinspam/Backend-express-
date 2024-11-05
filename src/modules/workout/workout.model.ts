import { Schema, model } from 'mongoose';
import { NodeDifficult, WorkoutBodyPart, WorkoutStyle } from './workout.constant';
import { IWorkout, IVideo, IVideoPart, IVideoNode } from './workout.types';

const VideoNodeSchema = new Schema<IVideoNode>(
  {
    timeStart: {
      type: Number,
      required: true,
    },
    timeEnd: {
      type: Number,
      required: true,
    },
    difficult: {
      type: String,
      enum: Object.keys(NodeDifficult),
      required: true,
    },
    hr: {
      type: Number,
      required: false,
    },
  },
  { timestamps: false, versionKey: false, _id: false }
);

const VideoPartSchema = new Schema<IVideoPart>(
  {
    name: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
      required: true,
    },
    targetHR: {
      type: Number,
      required: true,
    },
    averageHR: {
      type: Number,
      default: 0,
    },
    completedNum: {
      type: Number,
      default: 0,
    },
    nodes: {
      type: [VideoNodeSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: false, versionKey: false, _id: false }
);

const VideoSchema = new Schema<IVideo>(
  {
    link: {
      type: String,
      required: false,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    customThumbnail: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: true,
    },
    parts: {
      type: [VideoPartSchema],
      required: false,
      default: [],
    },
  },
  { timestamps: false, versionKey: false, _id: false }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    difficultyResetAt: {
      type: Date,
      default: new Date(0),
    },
    instructor: {
      type: String,
      required: false,
    },
    bodyPart: 
    [
      {
        type: String,
        enum: Object.keys(WorkoutBodyPart),
        required: true,
      },
    ],
    style: {
      type: String,
      enum: Object.keys(WorkoutStyle),
      required: true,
    },
    video: {
      type: VideoSchema,
      required: false,
    },
    calory: {
      type: Number,
      required: false,
    },
    hr: {
      type: Number,
      required: false,
    },
    equipments: [
      {
        type: String,
        required: false,
        // ref: 'equipments.name',
      },
    ],
    prioritizeWhenWatchConnected: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      required : false,
      default :10
    }
  },
  { versionKey: false, timestamps: true }
);

export default model<IWorkout>('Workout', WorkoutSchema, 'workouts');
