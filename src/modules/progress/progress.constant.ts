export enum WEEK_STATUS_TYPE {
  DAY_OF = 'DAY_OF',
  PASSED = 'PASSED',
  NO_PASSED = 'NO_PASSED',
  SKIPPED = 'SKIPPED',
}

// One hour in milliseconds
export const ONE_HOUR = 1000 * 60 * 60;
// One day in milliseconds
export const ONE_DAY = 1000 * 60 * 60 * 24;

export enum ACTION_LIST {
  NONE = 'NONE',
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  SHOW_INCREASE = 'SHOW_INCREASE',
  SHOW_DECREASE = 'SHOW_DECREASE',
}
