import mongoose from 'mongoose';
import { MONGO_URL, IS_PRODUCTION } from '../config';

const optionConnect: object = {
  maxPoolSize: !IS_PRODUCTION ?  10 : 50,
};

mongoose.connect(MONGO_URL, optionConnect);

mongoose.Promise = global.Promise;

mongoose.connection.on('connected', function () {
  console.info('connection established successfully');
});

mongoose.connection.on('error', function (err) {
  console.error('connection to mongo failed ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.info('mongo db connection closed');
  mongoose.connect(MONGO_URL, optionConnect);
});

export { default as Auth } from '../modules/auth/auth.model';
export { default as User } from '../modules/user/user.model';
export { default as Workout } from '../modules/workout/workout.model';
export { default as ForgotPassword } from '../modules/forgot_password/forgot_password.model';
export { default as Equipment } from '../modules/equipment/equipment.model';
export { default as QuizAnswer } from '../modules/quiz_answer/quiz_answer.model';
export { default as Plan } from '../modules/plan/plan.model';
export { default as DefaultSettings } from '../modules/defaultSettings/defaultSettings.model';
export { default as Progress } from '../modules/progress/progress.model';
export { default as Payment } from '../modules/payment/payment.model';
export { default as PaymentSettings } from '../modules/payment_settings/payment_settings.model';
export { default as Watch } from '../modules/watch/watch.model';
export { default as Coach } from '../modules/coach/coach.model';
export { default as Track } from '../modules/track/track.model';

export { default as Example } from '../modules/example/example.model';
