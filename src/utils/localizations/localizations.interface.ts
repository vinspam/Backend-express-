export default interface ILocalization {
  ERRORS: {
    AUTH: {
      USE_NEW_TOKEN: string;
    };
    USER: {
      NOT_EXIST: string;
      USER_ALREADY_EXIST: string;
      USER_NOT_CREATED: string;
      EMAIL_OR_PASSWORD_INVALID: string;
    };
    WORKOUT: {
      NOT_FOUND: string;
      SOME_WORKOUT_INVALID: string;
      VIDEO_NOT_FOUND: string;
      HAS_NO_VIDEO: string;
      INCORRECT_TIME: string;
      PART_AVG_HR_UPDATE_FAILED: string;
    };
    EQUIPMENT: {
      NOT_FOUND: string;
      SOME_OF_EQUIPMENT_IS_NOT_VALID: string;
    };
    PLAN: {
      NOT_FOUND: string;
      NOT_INCLUDE_WORKOUT: string;
      NOT_JOIN_TO_PLAN: string;
      NOT_ENOUGH_WORKOUT: string;
    };
    PROGRESS: {
      SELECTED_DAY_INCORRECT: string;
      WORKOUT_NOT_FOUND_ON_DAY: string;
    };
    OTHER: {
      EMAIL_WITH_CODE_NOT_SENDED: string;
      ERROR_WITH_SEND_MESSAGE: string;
      ITEM_NOT_FOUND: string;
      ID_IS_INVALID: string;
      CODE_IS_INVALID: string;
      UNAUTHORIZED: string;
      FORBIDDEN: string;
      NOT_FOUND_ENDPOINT: string;
      CONFLICT: string;
      SOMETHING_WENT_WRONG: string;
      REFRESH_TOKEN_INVALID: string;
      PASSWORD_ERROR: string;
      USER_PLAN_AND_PROGRESS_UPDATE_FAILED: string;
    };
    PAYMENT: {
      GET_CUSTOMER: string;
      REPLACE_CUSTOMER: string;
      CREATE_CARD_TOKEN: string;
      CREATE_CARD: string;
      CREATE_SUBSCRIBE: string;
      GET_CUSTOMER_INFO: string;
      GET_SUBSCRIBE: string;
      DELETE_SUBSCRIBE: string;
      SUBSCRIBE_NOT_FOUND: string;
      PERMISSION_DENIED: string;
      USER_CARDS_EMPTY: string;
      GET_CARD: string;
      USER_ALREADY_HAVE_SUBSCRIBE: string;
      USER_ALREADY_HAVE_CARD: string;
      CREATE_CUSTOMER: string;
    };
    PAYMENT_SETTINGS: {
      GET: string;
      UPDATE_PUBLIC_KEY: string;
      UPDATE_SECRET_KEY: string;
      ADD_PRICE: string;
      DELETE_PRICE: string;
      UPDATE_TRIAL_DAY: string;
      STATUS_EXIST: string;
    };
    WATCH: {
      GENERATE_CODE_FAIL: string;
      SAVE_WATCH_FAIL: string;
      GET_USER_FAIL: string;
      USER_ALREADY_HAVE_WATCH: string;
      GET_WATCH_ON_CODE_FAIL: string;
      WATCH_NOT_EXIST: string;
      UPDATE_WATCH_ID_FAIL: string;
      GET_USER_BY_WATCH_ID_FAIL: string;
      UPDATE_HR_FAIL: string;
    };
    COUCH: {
      NOT_FOUND: string;
    };
  };
}
