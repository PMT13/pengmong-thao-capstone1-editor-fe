import { IQuestionDTO } from "./IQuestionDTO";

export interface ISurveyDTO{
  title: string,
  questionList: IQuestionDTO[]
}