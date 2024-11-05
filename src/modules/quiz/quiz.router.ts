import { Router } from 'express';

import checkPermissions from '../../middleware/checkPermissions';
import actionHandler from '../../middleware/actionHandler';
import * as mapProperty from '../../utils/interfaces';
import Quiz from './quiz';

export default class QuizRouter {
  public router: Router;
  private quiz: Quiz;

  constructor() {
    this.quiz = new Quiz();
    this.router = Router();
    this.routes();
  }

  public routes(): void {
    this.router.get('/', checkPermissions(), actionHandler(this.quiz.getView, [mapProperty.isMobile]));
    this.router.get('/update-plan', checkPermissions(), actionHandler(this.quiz.getViewForUpdate, []));

  }
}
