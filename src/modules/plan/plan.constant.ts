export enum PLAN_TYPE {
  MY_PLAN = 'MY_PLAN',
  CHALLENGE = 'CHALLENGE',
}

// const bufWeakType1 = [true, false, true, false, true, false, false];
const bufWeakType2 = [true, true, false, true, true, false, false];
const bufWeakType3 = [true, true, false, true, true, true, false];
const bufWeakType4 = [true, true, true, false, true, true, true];

export const DAY_USING_WORKOUT_TYPES = [bufWeakType2, bufWeakType3, bufWeakType4];

export const COUNT_DAY_FOR_WEEK = 7;

export const LITERAL_FOR_CUSTOM = {
  OTHER: 'other',
  BODY: 'Body',
  MAIN: 'main',
};
