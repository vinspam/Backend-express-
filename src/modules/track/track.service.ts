import mongoose from 'mongoose';
import { UpdateWriteOpResult } from 'mongoose';

import { Track } from '../../utils/db';
import BaseService, { BaseUpdateService } from '../../utils/base/service';

import {ITrack } from './track.types';


export default class TrackService extends BaseService<ITrack> {
  constructor() {
    super(Track);
  }
  async getAllTracks(userId:string): Promise<Array<ITrack>> {
    return this.database.aggregate([
      { $match: { userId: userId } },
      {
        $limit: 20,
      },
      {
        $lookup: {
            from: 'workouts',
            localField: 'workoutId',
            foreignField: '_id',
            as: 'workouts'
        }
     },
     {
      $project: {
          workoutId: 1,
          playedDuration: 1,
          totalDuration: 1,
          createdAt : 1,
          currentPosition : 1,
          workoutName: '$workouts.title'
      }
    },
    {
      $sort: {
          createdAt: -1
      }
    }
    ]);
  }
}

 


