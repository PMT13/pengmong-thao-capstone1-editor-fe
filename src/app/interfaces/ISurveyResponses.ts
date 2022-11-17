import {IResponse} from "./IResponse";

export interface ISurveyResponses {
  id: number,
  surveyId: number,
  responses: IResponse[]
}
