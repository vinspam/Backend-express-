import { URL } from 'url';
import { BASE_URL, BRAND_NAME } from '../../config';

import { BODY_TYPE, LIST_OF_YEARS, QUESTION_TYPE, SLIDE_IMAGE_FILENAME, UNIT } from './quiz.constant';
import { IQuizView, ISlide } from './quiz.types';
import { QUIZ_SLIDE_TWO_DISABLE } from '../../config';
import logger from '../../utils/logger';

export default class Quiz {
  private getQuestionZero = (): ISlide => {
    return {
      id: 0,
      type: QUESTION_TYPE.INPUT,
      save: false,
      title: 'What is your ideal weight?',
    };
  };

  private getQuestionOne = (): ISlide => {
    return {
      id: 1,
      type: QUESTION_TYPE.MULTI_INPUT,
      save: true,
      title: 'What is your height and weight?',
      answers: [
        {
          id: 0,
          text: 'height',
          unit: UNIT.FT,
        },
        {
          id: 1,
          text: '',
          unit: UNIT.IN,
        },
        {
          id: 2,
          text: 'weight',
          unit: UNIT.LBS,
        },
      ],
    };
  };

  private getQuestionTwo = (): ISlide => {
    return {
      id: 2,
      type: QUESTION_TYPE.DROPDOWN,
      save: true,
      title: 'What is your age?',
      enum: LIST_OF_YEARS,
    };
  };

  private getQuestionThree = (): ISlide => {
    return {
      id: 3,
      type: QUESTION_TYPE.SELECT,
      save: true,
      description:
        'Women in their 20s who want to reach an ideal weight between 47 lbs and 57 lbs will need a slightly different exercise strategy depending on their diet.  Which best describes you?',
      answers: [
        {
          id: 0,
          text: 'My diet needs a lot of work',
        },
        {
          id: 1,
          text: 'I have some healthy eating habits',
        },
        {
          id: 2,
          text: 'I mostly eat well',
        },
        {
          id: 3,
          text: 'I make eating well a priority',
        },
      ],
    };
  };

  private getQuestionFour = (isUpdate = false): ISlide => {
    return {
      id: 4,
      type: QUESTION_TYPE.SELECT,
      save: true,
      subtitle: '',
      description:
        isUpdate == false ? 'How often do you currently exercise? \nBy knowing what your body is currently used to, we can create a plan to build on what you have already achieved.' : 'How many days a week would you like to exercise?',
      answers: [
        {
          id: 0,
          text: '0 - 2 Days per week',
        },
        {
          id: 1,
          text: '3 - 4 Days per week',
        },
        {
          id: 2,
          text: '5+ Days per week',
        },
      ],
    };
  };
  

  private getSlideOne = (isMobile?): ISlide => {
    return {
      type: QUESTION_TYPE.INFO_SLIDE,
      save: false,
      subtitle:
        `${BRAND_NAME} gets results by customizing a workout plan just for you, designed to meet the needs of your body.`,
      body: [
        {
          data: isMobile
            ? new URL(`/assets/quiz/${SLIDE_IMAGE_FILENAME.slideOneAdaptive}`, BASE_URL).toString()
            : new URL(`/assets/quiz/${SLIDE_IMAGE_FILENAME.slideOne}`, BASE_URL).toString(),
          type: BODY_TYPE.IMAGE,
        },
        {
          data: `Everybody is different. \n${BRAND_NAME} helps users achieve their individual best by creating plans that allow users to progress at the optimal rate for their body.`,
          type: BODY_TYPE.TEXT,
        },
      ],
    };
  };

  private getQuestionFive = (isUpdate = false): ISlide => {
   if(!isUpdate) return {
      id: 5,
      type: QUESTION_TYPE.MULTI_SELECT,
      save: true,
      description:
        'In addition to how OFTEN you exercise, the TYPE of exercise can impact your metabolism. What types of exercise do you typically do?',
      answers: [
        { id: 0, text: 'Run' },
        { id: 1, text: 'Barre' },
        { id: 2, text: 'Pilates' },
        { id: 3, text: 'Light strength training' },
        { id: 4, text: 'Cycling' },
        { id: 5, text: 'Yoga' },
        { id: 6, text: 'HIIT' },
        { id: 7, text: 'Just starting' },
        { id: 8, text: 'Other' },
      ],
    };

    if(isUpdate) return {
      id: 5,
      type: QUESTION_TYPE.MULTI_SELECT,
      save: true,
      description:
        'What type of exercises would you like to do?',
      answers: [
        { id: 1, text: 'Barre' },
        { id: 2, text: 'Pilates' },
        { id: 3, text: 'Light strength training' },
        { id: 5, text: 'Yoga' },
        { id: 6, text: 'HIIT' },
        { id: 8, text: 'Other' },

      ],
    };
  };

  private getQuestionSix = (isUpdate = false): ISlide => {
    if(isUpdate == false)
      return {
        id: 6,
        type: QUESTION_TYPE.MULTI_SELECT,
        save: true,
        description: 'Are there areas that you have always wanted to improve but have had difficulty with?',
        answers: [
          { id: 0, text: 'Waistline' },
          { id: 1, text: 'Legs' },
          { id: 2, text: 'Back' },
          { id: 3, text: 'Arms' },
          { id: 4, text: 'Glutes' },
          { id: 5, text: 'Total Body' },
          { id: 6, text: 'No specific problems' },
        ],
      };
    if(isUpdate == true)
      return {
        id: 6,
        type: QUESTION_TYPE.MULTI_SELECT,
        save: true,
        description: 'Are there any areas you would like to focus on?',
        answers: [
          { id: 0, text: 'Waistline' },
          { id: 1, text: 'Legs' },
          { id: 2, text: 'Back' },
          { id: 3, text: 'Arms' },
          { id: 4, text: 'Glutes' },
          { id: 5, text: 'Total Body' },
          { id: 6, text: 'No specific problems' },
        ],
      };
  };

  private getSlideTwo = (isMobile?): ISlide => {
    return {
      type: QUESTION_TYPE.INFO_SLIDE,
      save: false,
      subtitle: `Staying with a fitness plan can be hard, ${BRAND_NAME} makes it easy.`,
      body: [
        {
          data: `Two of the top reasons why people give up on working out are the exercises are too hard or too easy. ${BRAND_NAME} gets feedback from you, and using AI predicts future workouts that are right in your zone so you never have this problem.`,
          type: BODY_TYPE.TEXT,
        },
        {
          data: isMobile
            ? new URL(`/assets/quiz/${SLIDE_IMAGE_FILENAME.slideTwoAdaptive}`, BASE_URL).toString()
            : new URL(`/assets/quiz/${SLIDE_IMAGE_FILENAME.slideTwo}`, BASE_URL).toString(),
          type: BODY_TYPE.IMAGE,
        },
        {
          data: `Users rate the difficulty of a workout from 1-10. The target for each workout is between 6-8. After a few workouts ${BRAND_NAME} will start adjusting your plan automatically.`,
          type: BODY_TYPE.TEXT,
        },
      ],
    };
  };

  private getQuestionSeven = (): ISlide => {
    return {
      id: 7,
      type: QUESTION_TYPE.SELECT,
      save: false,
      title: 'How busy are you on an \naverage day?',
      answers: [
        {
          id: 0,
          text: 'I barely have time for myself',
        },
        {
          id: 1,
          text: "I'm busy but I try to reserve some time each day to relax",
        },
        {
          id: 2,
          text: "I'm not too busy and try to keep time open for different things",
        },
        {
          id: 3,
          text: 'My schedule is fairly open and flexible',
        },
      ],
    };
  };

  private getQuestionEight = (): ISlide => {
    return {
      id: 8,
      type: QUESTION_TYPE.MULTI_SELECT,
      save: false,
      title: 'Have you attempted any of the following in the past to lose weight?',
      answers: [
        { id: 0, text: 'Gym membership' },
        { id: 1, text: 'Home workouts' },
        { id: 2, text: 'Restrictive diet' },
        { id: 3, text: 'None' },
      ],
    };
  };

  private getQuestionNine = (): ISlide => {
    return {
      id: 9,
      type: QUESTION_TYPE.SELECT,
      save: false,
      title: 'How long has it been since you were at your ideal weight?',
      answers: [
        { id: 0, text: '0 - 6 Months' },
        { id: 1, text: '6 - 12 Months' },
        { id: 2, text: '1 - 3 Years' },
        { id: 3, text: '3+ Years' },
      ],
    };
  };

  public getQuestionTen = (): ISlide => {
    return {
      id: 10,
      type: QUESTION_TYPE.SELECT,
      save: true,
      description: 'Would you to change the difficulty of your workouts?',
      answers: [
        { id: 0, text: 'A little harder' },
        { id: 1, text: 'A little easier' },
        { id: 2, text: 'No change' }
      ],
    };
  };


  public getItems = (isMobile?): ISlide[] => {
    let questions = [
      this.getQuestionZero(),
      this.getQuestionOne(),
      this.getQuestionTwo(),
      this.getQuestionThree(),
      this.getSlideOne(isMobile),
      this.getQuestionFour(),
      this.getQuestionFive(),
      this.getQuestionSix(),
      this.getQuestionSeven(),
      this.getQuestionEight(),
      this.getQuestionNine(),
      this.getQuestionTen()

    ]

    if (!QUIZ_SLIDE_TWO_DISABLE) {
      questions.splice(8, 0, this.getSlideTwo(isMobile));
    }

    return questions;
  };

  public getItemsForUpdate = (isMobile?): ISlide[] => {
    let questions = [
      this.getQuestionFour(true),
      this.getQuestionFive(true),
      this.getQuestionSix(true),
      this.getQuestionTen()
    ]
    return questions;
  };

  public getView = async (isMobile?): Promise<IQuizView> => {
    const items = this.getItems(isMobile);
    items.pop()
    return {
      items,
      count: items.length,
    };
  };
  public getViewForUpdate = async (isMobile?): Promise<IQuizView> => {
    const items = this.getItemsForUpdate(isMobile);

    return {
      items,
      count: items.length,
    };
  };
}
