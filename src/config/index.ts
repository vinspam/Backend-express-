import { stringToBoolean } from '../utils/helpers';

export enum ENVS {
    Production = 'production',
    Development = 'development',
    Local = 'local'
}

export const IS_PRODUCTION: Boolean = process.env.NODE_ENV === ENVS.Production

export const BASE_URL: string = process.env.BASE_URL
export const PORT: number = parseInt(process.env.PORT);
export const ALLOW_HOSTS: Array<string> = process.env.ALLOW_HOSTS.split(",");
export const FILE_FOLDER: string = 'files';

export const MONGO_URL: string = process.env.MONGO_URL

export const TOKEN_SECRET: string = process.env.TOKEN_SECRET
export const REFRESH_TOKEN_SECRET: string = process.env.TOKEN_SECRET
export const TOKEN_LIFE: number | string = +(process.env.TOKEN_LIFE);
export const ACCESS_TOKEN_LIFE = Number(process.env.ACCESS_TOKEN_LIFE);
export const REFRESH_TOKEN_LIFE = Number(process.env.REFRESH_TOKEN_LIFE);

export const SENDGRID_API_KEY: string = process.env.SENDGRID_API_KEY;
export const SENDGRID_SENDER: string = process.env.SENDGRID_SENDER;
export const SENDGRID_SUPPORT: string = process.env.SENDGRID_SUPPORT || SENDGRID_SENDER;
export const VIMEO_API_TOKEN: string = process.env.VIMEO_API_TOKEN;

export const BRAND_NAME: string = process.env.BRAND_NAME;
export const QUIZ_SLIDE_TWO_IMG_NAME: string = process.env.QUIZ_SLIDE_TWO_IMG_NAME;
export const QUIZ_SLIDE_TWO_ADAPTIVE_IMG_NAME: string = process.env.QUIZ_SLIDE_TWO_ADAPTIVE_IMG_NAME;
export const QUIZ_SLIDE_TWO_DISABLE: boolean = stringToBoolean(process.env.QUIZ_SLIDE_TWO_DISABLE);

export default process.env;
