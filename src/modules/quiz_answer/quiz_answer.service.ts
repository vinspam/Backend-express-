import BaseService from '../../utils/base/service';
import { QuizAnswer } from '../../utils/db';

import { Answer, IQuizAnswer } from './quiz_answer.types';
import Quiz from '../quiz/quiz';
import { QUESTION_TYPE } from '../quiz/quiz.constant';
import { WorkoutBodyPart, WorkoutStyle } from '../workout/workout.constant';

export default class QuizAnswerService extends BaseService<IQuizAnswer> {
  private quizTemplate: Quiz;
  constructor() {
    super(QuizAnswer);

    this.quizTemplate = new Quiz();
  }

  async getAnswer(userId: string) {
    const userAnswers = await this.getItem({ userId });

    if (!userAnswers) {
      return [];
    }

    const quiz = this.quizTemplate.getItems();

    return userAnswers.answers.reduce((acc, ans) => {
      const answer: any = { ...ans };
      const foundQuiz = quiz.find((q) => q.id == ans.questionId);

      if (foundQuiz.title) answer.title = foundQuiz.title;
      if (foundQuiz.subtitle) answer.subtitle = foundQuiz.subtitle;
      if (foundQuiz.description) answer.description = foundQuiz.description;
      answer.type = foundQuiz.type;

      if (
        answer.answer &&
        ![QUESTION_TYPE.DROPDOWN, QUESTION_TYPE.INPUT, QUESTION_TYPE.MULTI_INPUT].includes(foundQuiz.type)
      ) {
        answer.answer = answer.answer.reduce((accAnswer, a) => {
          if (!foundQuiz.answers) return accAnswer;

          const foundAnswer = foundQuiz.answers.find((el) => el.id == a.id);

          if (!foundAnswer) return accAnswer;

          if (!a?.text && foundAnswer?.text) a.text = foundAnswer.text;

          return [...accAnswer, a];
        }, []);
      } else if (QUESTION_TYPE.MULTI_INPUT == foundQuiz.type) {
        answer.answer = answer.answer.map((a) => {
          const foundAnswer = foundQuiz.answers.find((el) => el.id == a.id);

          return { ...a, fieldName: foundAnswer?.text || null };
        });
      }

      return [...acc, answer];
    }, []);
  }

  getStyles(chooseStyles: Answer[]): WorkoutStyle[] {
    const workoutStyleList = <WorkoutStyle[]>[];
    const barreArr = [1, 7, 8];
    for (let i = 0; i < chooseStyles.length; i++) {
      const chooseStyle = Number(chooseStyles[i].id);
      if (chooseStyle === 0) {
        workoutStyleList.push(WorkoutStyle.RUN);
      } else if (barreArr.includes(chooseStyle) && !workoutStyleList.includes(WorkoutStyle.BARRE)) {
        workoutStyleList.push(WorkoutStyle.BARRE);
      } else if (chooseStyle === 2) {
        workoutStyleList.push(WorkoutStyle.PILATES);
      } else if (chooseStyle === 3) {
        workoutStyleList.push(WorkoutStyle.STRENGTH);
      } else if (chooseStyle === 4) {
        workoutStyleList.push(WorkoutStyle.CYCLING);
      } else if (chooseStyle === 5) {
        workoutStyleList.push(WorkoutStyle.YOGA);
      } else if (chooseStyle === 6) {
        workoutStyleList.push(WorkoutStyle.HIIT);
      }
    }
    return workoutStyleList;
  }

  getBodyParts(chooseBodyParts: Answer[]): WorkoutBodyPart[] {
    const bodyPartsList = [WorkoutBodyPart.FULL_BODY];
    const lowArr = [1, 4];
    const upArr = [0, 2, 3];
    for (let i = 0; i < chooseBodyParts.length; i++) {
      const chooseBodyPart = Number(chooseBodyParts[i].id);
      if (lowArr.includes(chooseBodyPart) && !bodyPartsList.includes(WorkoutBodyPart.LOWER_BODY)) {
        bodyPartsList.push(WorkoutBodyPart.LOWER_BODY);
      } else if (upArr.includes(chooseBodyPart) && !bodyPartsList.includes(WorkoutBodyPart.UPPER_BODY)) {
        bodyPartsList.push(WorkoutBodyPart.UPPER_BODY);
      }
    }
    return bodyPartsList;
  }
}
