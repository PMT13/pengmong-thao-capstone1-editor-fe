import {IQuestion} from "./IQuestion";

export interface ISurvey{
  id: number,
  title: string,
  questionSet: IQuestion[]
}
