import ILocalization from './localizations.interface';

const en: ILocalization = {
  ERRORS: {
    AUTH: {
      USE_NEW_TOKEN: 'Auth change need use new token',
    },
    USER: {
      NOT_EXIST: 'User does not exist',
      USER_ALREADY_EXIST: 'User already exists',
      USER_NOT_CREATED: 'User not created',
      EMAIL_OR_PASSWORD_INVALID: 'Email or password is not valid',
    },
    WORKOUT: {
      NOT_FOUND: 'Workout not found',
      SOME_WORKOUT_INVALID: 'Some of workout is not valid',
      VIDEO_NOT_FOUND: 'Video not found or user are not owner for video',
      HAS_NO_VIDEO: 'Workout has no video',
      INCORRECT_TIME: 'Incorrectly video time',
      PART_AVG_HR_UPDATE_FAILED: 'Part average HR update failed',
    },
    EQUIPMENT: {
      NOT_FOUND: 'Equipment not found',
      SOME_OF_EQUIPMENT_IS_NOT_VALID: 'Some of equipment is not valid',
    },
    PLAN: {
      NOT_FOUND: 'Plan not found',
      NOT_INCLUDE_WORKOUT: 'The plan does not include workout',
      NOT_JOIN_TO_PLAN: 'User not joined to plan',
      NOT_ENOUGH_WORKOUT: 'Do not have enough workout',
    },
    PROGRESS: {
      SELECTED_DAY_INCORRECT: 'Selected date incorrect',
      WORKOUT_NOT_FOUND_ON_DAY: 'Workout not found on this day',
    },
    OTHER: {
      EMAIL_WITH_CODE_NOT_SENDED: 'Email with code not sended',
      ERROR_WITH_SEND_MESSAGE: 'Message not sent',
      ITEM_NOT_FOUND: 'Item not found',
      ID_IS_INVALID: 'Id is invalid',
      CODE_IS_INVALID: 'Code is not valid',
      UNAUTHORIZED: 'Unauthorized',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND_ENDPOINT: 'Not Found! Wrong api endpoint',
      CONFLICT: 'Conflict',
      SOMETHING_WENT_WRONG: 'Something went wrong',
      REFRESH_TOKEN_INVALID: 'Refresh token not valid',
      PASSWORD_ERROR:
        'The password must contain 1 lowercase and uppercase letter, 1 number and be more than 8 characters',
        USER_PLAN_AND_PROGRESS_UPDATE_FAILED: 'User plan and progress update failed',
    },
    PAYMENT: {
      GET_CUSTOMER: 'Get customer error',
      REPLACE_CUSTOMER: 'Replace customer error',
      CREATE_CARD_TOKEN: 'Create card token error',
      CREATE_CARD: 'Create card error',
      CREATE_SUBSCRIBE: 'Create subscribe error',
      GET_CUSTOMER_INFO: 'Get customer info error',
      GET_SUBSCRIBE: 'Get subscribe error',
      DELETE_SUBSCRIBE: 'Delete subscribe error',
      SUBSCRIBE_NOT_FOUND: 'Subscribe not found',
      PERMISSION_DENIED: 'Permission denied',
      USER_CARDS_EMPTY: 'No Card on File',
      GET_CARD: 'Get cards by user error',
      USER_ALREADY_HAVE_SUBSCRIBE: 'User have subscribe',
      USER_ALREADY_HAVE_CARD: 'User have card',
      CREATE_CUSTOMER: 'Create customer error',
    },
    PAYMENT_SETTINGS: {
      GET: 'Get payment settings error',
      UPDATE_PUBLIC_KEY: 'Update public key error',
      UPDATE_SECRET_KEY: 'Update secret key error',
      ADD_PRICE: 'Add price error',
      DELETE_PRICE: 'Delete price error',
      UPDATE_TRIAL_DAY: 'Update trial day error',
      STATUS_EXIST: 'Status or id exist',
    },
    WATCH: {
      GENERATE_CODE_FAIL: 'Generate code fail',
      SAVE_WATCH_FAIL: 'Save watch fail',
      GET_USER_FAIL: 'Get user fail',
      USER_ALREADY_HAVE_WATCH: 'User already have watch',
      GET_WATCH_ON_CODE_FAIL: 'Get watch on code fail',
      WATCH_NOT_EXIST: 'Watch not exist',
      UPDATE_WATCH_ID_FAIL: 'Update watch id fail',
      GET_USER_BY_WATCH_ID_FAIL: 'Get user by watch id fail',
      UPDATE_HR_FAIL: 'Update hr fail',
    },
    COUCH: {
      NOT_FOUND: 'Coach not found',
    },
  },
};

export default en;
