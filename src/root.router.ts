import { Router } from 'express';
import swaggerSetup from './utils/swagger/swagger.setup';

import AuthRouter from './modules/auth/auth.router';
import UserRouter from './modules/user/user.router';
import WorkoutRouter from './modules/workout/workout.router';
import ForgotPasswordRouter from './modules/forgot_password/forgot_password.router';
import EquipmentRouter from './modules/equipment/equipment.router';
import QuizRouter from './modules/quiz/quiz.router';
import QuizAnswerRouter from './modules/quiz_answer/quiz_answer.router';
import PlanRouter from './modules/plan/plan.router';
import SupportRouter from './modules/support/support.router';
import DefaultSettings from './modules/defaultSettings/defaultSettings.router';
import ProgressRouter from './modules/progress/progress.router';
import PaymentV2Router from './modules/payment/payment.router';
import PaymentSettingsRouter from './modules/payment_settings/payment_settings.router';
import WatchRouter from './modules/watch/watch.router';
import CoachRouter from './modules/coach/coach.router';
import LogsRouter from './modules/logs/logs.router';
import TrackRouter from './modules/track/track.router';

function serverOpenApi(req, res, next) {
  res.json(swaggerSetup)
} 

export default class RootRouter {
  public router: Router;

  constructor() {
    this.router = Router();

    this.routes();
  }

  public routes(): void {
    this.router.use('/docs', serverOpenApi);

    this.router.use('/auth', new AuthRouter().router);
    this.router.use('/user', new UserRouter().router);
    this.router.use('/workout', new WorkoutRouter().router);
    this.router.use('/forgot-password', new ForgotPasswordRouter().router);
    this.router.use('/equipment', new EquipmentRouter().router);
    this.router.use('/quiz', new QuizRouter().router);
    this.router.use('/quiz-answer', new QuizAnswerRouter().router);
    this.router.use('/plan', new PlanRouter().router);
    this.router.use('/support', new SupportRouter().router);
    this.router.use('/default-setting', new DefaultSettings().router);
    this.router.use('/progress', new ProgressRouter().router);
    this.router.use('/payment', PaymentV2Router);
    this.router.use('/payment-setting', new PaymentSettingsRouter().router);
    this.router.use('/watch', new WatchRouter().router);
    this.router.use('/coach', new CoachRouter().router);
    this.router.use('/logs', new LogsRouter().router);
    this.router.use('/track', new TrackRouter().router);

    this.router.get('/version', (req, res) => res.json({ version: 1 }));
    this.router.get('/health', (req, res) => res.json({ status: 'ok' }));
  }
}
