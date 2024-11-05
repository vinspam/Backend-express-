import UserService from '../user/user.service';
import QuizAnswerService from './quiz_answer.service';
import ProgressService from '../progress/progress.service';
import CustomPlan from '../plan/custom_plan';
import { WorkoutBodyPart, WorkoutStyle } from '../workout/workout.constant';
import { IBaseQuizAnswer } from './quiz_answer.types';
import { GENDER, ROLE, UNITS } from '../user/user.constant';
import { PLAN_TYPE } from '../plan/plan.constant';
import { IAuthInfo } from '../auth/auth.types';
import Quiz from '../quiz/quiz';

export default class QuizAnswerController {
  private quizAnswerService: QuizAnswerService;
  private userService: UserService;
  private progressService: ProgressService;
  private customPlan: CustomPlan;

  constructor() {
    this.quizAnswerService = new QuizAnswerService();
    this.userService = new UserService();
    this.progressService = new ProgressService();
    this.customPlan = new CustomPlan();
  }

  getAnswer = async (userId: string) => {
    const formatedAnswer = await this.quizAnswerService.getAnswer(userId);
    return {
      items: formatedAnswer,
    };
  };

  saveAnswersById = async (id, { answers }: IBaseQuizAnswer, profile: IAuthInfo): Promise<object> => {
    return this.saveAnswers({ userId: id }, <IBaseQuizAnswer>{ answers }, profile);
  };

  saveAnswers = async ({ userId }, { answers }: IBaseQuizAnswer, profile?: IAuthInfo): Promise<object> => {
    const user = await this.userService.getItemById(userId);
    const old_answers = await this.quizAnswerService.getAnswer(userId);
    const findFunc = (num: number, fieldName: string) => (question) => Number(question[fieldName]) === num;
    if(old_answers.length > 0) {
      for(var i = 0; i < answers.length; i ++){
        var isExist = false;
        for(var j = 0; j < old_answers.length; j ++) {
            if(old_answers[j]['questionId'] == answers[i].questionId) {
              old_answers[j]['answer'] = answers[i].answer;
              isExist = true
            }
        }
        console.log(isExist, old_answers)
        if(isExist == false) {
          const updateDifficulty = answers.find(findFunc(10, 'questionId'));
          console.log(updateDifficulty.answer[0])
          old_answers.push({
            questionId : 10,
            answer : answers[i].answer,
            description : (new Quiz()).getQuestionTen().title,
            type : 'SELECT'
          })
        }
      }
    answers = old_answers
    }
   
    if (answers.length) await this.quizAnswerService.updateOrInsert({ userId }, { answers });

    const needQuestions = [1, 2, 4, 5, 6, 10];
    if (answers.some((question) => needQuestions.includes(Number(question.questionId)))) {
      const userInfoToUpdate: Partial<{
        height: number;
        weight: number;
        birthday: Date;
        abilityLevel: number;
        workoutStyleList: WorkoutStyle[];
        bodyPartList: WorkoutBodyPart[];
        countWorkoutRepeat: number;
        unit: UNITS
      }> = {};

      
      const heightAndWeightInfo = answers.find(findFunc(1, 'questionId'));
      const ageInfo = answers.find(findFunc(2, 'questionId'));
      const countWorkoutRepeat = answers.find(findFunc(4, 'questionId'));
      const chooseStyles = answers.find(findFunc(5, 'questionId'));
      const chooseBodyParts = answers.find(findFunc(6, 'questionId'));
      const updateDifficulty = answers.find(findFunc(10, 'questionId'));

      if (heightAndWeightInfo) {
        const ftHeight = +heightAndWeightInfo.answer.find(findFunc(0, 'id')).text;
        const inHeight = +heightAndWeightInfo.answer.find(findFunc(1, 'id')).text;
        const lbs = +heightAndWeightInfo.answer.find(findFunc(2, 'id')).text;
        if(heightAndWeightInfo.answer.find(findFunc(3, 'id')))
        {
          const unit = heightAndWeightInfo.answer.find(findFunc(3, 'id')).text
          userInfoToUpdate.unit = unit == UNITS.KG ? UNITS.KG : UNITS.LBS
        } 
        const height = +(ftHeight * 30.48 + inHeight * 2.54).toFixed(2);
        const weight = +lbs.toFixed(2);
        
        if (height && height >= 0) userInfoToUpdate.height = height;
        if (weight && weight >= 0) userInfoToUpdate.weight = weight;
      }

      if (ageInfo) {
        const date = new Date();
        date.setFullYear(date.getFullYear() - (parseInt(ageInfo.answer[0].text) || 0), 0, 1);

        userInfoToUpdate.birthday = date;
      }

      if (heightAndWeightInfo && countWorkoutRepeat && profile?.role !== ROLE.ADMIN) {
        if(updateDifficulty) {
           console.log(updateDifficulty.answer[0].id)
           if(updateDifficulty.answer[0].id == 0) { // harder
            userInfoToUpdate.abilityLevel = user.abilityLevel < 10 ? user.abilityLevel + 1 : 10; 
           }
           else if (updateDifficulty.answer[0].id == 1){ //easier
            userInfoToUpdate.abilityLevel = user.abilityLevel > 0 ? user.abilityLevel - 1 : 0; 
           } 
        }
        else {
          let lbs = +heightAndWeightInfo.answer.find(findFunc(2, 'id')).text;
          const workoutCountId = +countWorkoutRepeat.answer[0].id;
  
          userInfoToUpdate.abilityLevel =
            user.gender === GENDER.MALE
              ? this.userService.getDifficulty(workoutCountId, lbs, 50)
              : this.userService.getDifficulty(workoutCountId, lbs);
  
        }
      }

      if (countWorkoutRepeat) {
        userInfoToUpdate.countWorkoutRepeat = Number(countWorkoutRepeat.answer[0].id) + 4;
      }

      if (chooseStyles) {
        userInfoToUpdate.workoutStyleList = this.quizAnswerService.getStyles(chooseStyles.answer);
      }

      if (chooseBodyParts) {
        userInfoToUpdate.bodyPartList = this.quizAnswerService.getBodyParts(chooseBodyParts.answer);
      }

      const updateUser = await this.userService.updateById(userId, userInfoToUpdate);

      if (
        updateUser &&
        updateUser.abilityLevel &&
        updateUser.countWorkoutRepeat &&
        userInfoToUpdate &&
        (userInfoToUpdate.bodyPartList ||
          userInfoToUpdate.workoutStyleList ||
          userInfoToUpdate.countWorkoutRepeat ||
          userInfoToUpdate.abilityLevel)
      ) {
        const newCustomPLan = await this.customPlan.createOrUpdate(userId);

        if (profile?.role === ROLE.ADMIN) {
          const progress = await this.progressService.getItem({
            userId,
            active: true,
          });

          if (progress?.type === PLAN_TYPE.MY_PLAN) {
            await this.progressService.updateProgressByPlan(progress, newCustomPLan);
          }
        } else await this.progressService.activeUserPlan(userId, newCustomPLan);
      }
    }

    return {
      message: 'Success',
    };
  };
}
