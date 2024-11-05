import { QUIZ_SLIDE_TWO_IMG_NAME, QUIZ_SLIDE_TWO_ADAPTIVE_IMG_NAME } from '../../config';

export enum QUESTION_TYPE {
  'INPUT' = 'INPUT',
  'MULTI_INPUT' = 'MULTI_INPUT',
  'SELECT' = 'SELECT',
  'MULTI_SELECT' = 'MULTI_SELECT',
  'DROPDOWN' = 'DROPDOWN',
  'INFO_SLIDE' = 'INFO_SLIDE',
}

export enum UNIT {
  FT = 'FT',
  IN = 'IN',
  LBS = 'LBS',
}

export const SLIDE_IMAGE_FILENAME = {
  'slideOne': 'slideOne.jpg',
  'slideOneAdaptive': 'slideOneAdaptive.jpg',
  'slideTwo': QUIZ_SLIDE_TWO_IMG_NAME,
  'slideTwoAdaptive': QUIZ_SLIDE_TWO_ADAPTIVE_IMG_NAME,
}

export enum BODY_TYPE {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
}

export const LIST_OF_YEARS = ['20s', '30s', '40s', '50s', '60s', '70s'];
