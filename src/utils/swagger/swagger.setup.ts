import { PORT, BASE_URL } from '../../config';
import { URL } from 'url';

import { authSchema, deviceParameters, authSwagger } from '../../modules/auth/swagger';
import { userSchema, userSwagger } from '../../modules/user/swagger';
import { workoutSchema, workoutSwagger } from '../../modules/workout/swagger';
import { forgotPasswordSwagger, forgotPasswordResponseSchema } from '../../modules/forgot_password/swagger';
import { fullEquipmentSchema, equipmentSwagger } from '../../modules/equipment/swagger';
import { fullQuizSchema, quizSwagger } from '../../modules/quiz/swagger';
import { quizAnswerSwagger } from '../../modules/quiz_answer/swagger';
import { defaultSettingsSwagger, fullDefaultSettingsSchema } from '../../modules/defaultSettings/swagger';
import {
  fullPlanWithIdAndWithWorkoutInfoSchema,
  fullPlanWithIdSchema,
  fullViewPlanForWeekSchema,
  fullViewPlanForWeeksSchema,
  planSwagger,
  shortPlanWithIdSchema,
} from '../../modules/plan/swagger';
import { supportSwagger } from '../../modules/support/swagger';
import { progressSwagger, progressSchema,progressWorkoutSchema,progressWorkoutDateSchema } from '../../modules/progress/swagger';
import { paymentSwagger } from '../../modules/payment/swagger';
import { paymentSettingSwagger } from '../../modules/payment_settings/swagger';
import { watchSwagger } from '../../modules/watch/swagger';
import { coachSwagger } from '../../modules/coach/swagger';

export default {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'APIs Document for Level method',
  },
  servers: [
    {
      url: new URL('/api/v1', BASE_URL),
    },
    {
      url: `http://127.0.0.1:${PORT}/api/v1`,
    },
    {
      url: 'https://backend-pre-dev.lvlmethod.lampawork.com/api/v1',
    },
    {
      url: 'https://backend-dev.lvlmethod.lampawork.com/api/v1',
    },
  ],
  components: {
    parameters: deviceParameters,
    schemas: Object.assign({}, authSchema, userSchema, {
      forgotPasswordResponseSchema,
      fullDefaultSettingsSchema,
      fullEquipmentSchema,
      fullPlanWithIdAndWithWorkoutInfoSchema,
      fullPlanWithIdSchema,
      fullQuizSchema,
      fullWorkoutSchema: workoutSchema.fullWorkoutSchema,
      progressSchema,
      progressWorkoutSchema,      
      progressWorkoutDateSchema,
      shortPlanWithIdSchema,
      fullViewPlanForWeekSchema,
      fullViewPlanForWeeksSchema,
    }),
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: ['read', 'write'],
    },
  ],
  paths: Object.assign(
    {},
    authSwagger,
    forgotPasswordSwagger,
    defaultSettingsSwagger,
    supportSwagger,
    quizSwagger,
    quizAnswerSwagger,
    userSwagger,
    equipmentSwagger,
    planSwagger,
    workoutSwagger,
    progressSwagger,
    paymentSwagger,
    paymentSettingSwagger,
    watchSwagger,
    coachSwagger
  ),
};
