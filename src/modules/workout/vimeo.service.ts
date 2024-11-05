import axios from 'axios';

import { VIMEO_API_TOKEN } from '../../config';
import { VIMEO_VIDEO_URL_REGEXP } from './workout.constant';

export default class VimeoService {
  public getVideoId(url: string) {
    const videoUrlParts = url.match(VIMEO_VIDEO_URL_REGEXP);

    return videoUrlParts[2];
  }

  public checkVideoInUserAccount(videoId: string) {
    return axios.get(`https://api.vimeo.com/me/videos/${videoId}`, {
      headers: {
        Authorization: `Bearer ${VIMEO_API_TOKEN}`,
      },
    });
  }
}
