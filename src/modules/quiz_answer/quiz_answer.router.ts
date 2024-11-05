import { BaseRouter } from '../../utils/base';
import actionHandler from '../../middleware/actionHandler';
import validateSchema from '../../middleware/validateSchema';
import checkPermissions from '../../middleware/checkPermissions';
import * as mapProperty from '../../utils/interfaces';
import * as validations from '../../utils/validations';

import QuizAnswerController from './quiz_answer.controller';
import * as validate from './quiz_answer.validate';
import { PAYMENT_STATUS } from '../payment/payment.constant';
import { ROLE } from '../user/user.constant';

export default class QuizAnswerRouter extends BaseRouter {
  private quizAnswerController: QuizAnswerController;
  constructor() {
    super();

    this.quizAnswerController = new QuizAnswerController();

    this.routes();
  }

  public routes(): void {
    this.router.post(
      '/',
      checkPermissions(),
      validateSchema(validate.saveAnswers, mapProperty.getBody),
      actionHandler(this.quizAnswerController.saveAnswers, [mapProperty.getUserInfo, mapProperty.getBody])
    );

    this.router.post(
      '/:id',
      checkPermissions({ roles: [ROLE.ADMIN] }),
      validateSchema(validations.byId, mapProperty.getIdFromParams),
      validateSchema(validate.saveAnswers, mapProperty.getBody),
      actionHandler(this.quizAnswerController.saveAnswersById, [
        mapProperty.getIdFromParams,
        mapProperty.getBody,
        mapProperty.getUserInfo,
      ])
    );

    this.router.get(
      '/user/:id',
      checkPermissions({ paymentStatusArr: [PAYMENT_STATUS.HAVE] }),
      actionHandler(this.quizAnswerController.getAnswer, mapProperty.getIdFromParams)
    );
  }
}
