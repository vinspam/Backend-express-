import { BODY_TYPE, QUESTION_TYPE, UNIT } from './quiz.constant';

interface IAnswer {
  id: number;
  text: string;
  unit?: UNIT;
}

interface IBody {
  data: string;
  type: BODY_TYPE;
}

export interface ISlide {
  id?: number;
  type: QUESTION_TYPE;
  save?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  enum?: number[] | string[];

  body?: IBody[];
  answers?: IAnswer[];
}

export interface IQuizView {
  items: ISlide[];
  count: number;
}
