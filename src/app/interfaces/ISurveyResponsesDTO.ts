import { IResponse } from "./IResponse";
import { IResponseDTO } from "./IResponseDTO";

export interface ISurveyResponsesDTO{
  surveyId: number,
  responses: IResponseDTO[]
}