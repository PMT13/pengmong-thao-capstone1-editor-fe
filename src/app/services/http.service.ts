import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ISurvey} from "../interfaces/ISurvey";
import {ISurveyResponses} from "../interfaces/ISurveyResponses";
import { ISurveyResponsesDTO } from '../interfaces/ISurveyResponsesDTO';
import { ISurveyDTO } from '../interfaces/ISurveyDTO';
import { IResponse } from '../interfaces/IResponse';
import { IResponseDTO } from '../interfaces/IResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  getAllSurveys() {
    return this.httpClient.get('http://localhost:3000/api/survey') as Observable<ISurvey[]>
  }

  getAllResponses() {
    return this.httpClient.get('http://localhost:3000/api/surveyresponses') as Observable<ISurveyResponses[]>
  }

  addSurvey(newSurvey: ISurveyDTO){
    return this.httpClient.post('http://localhost:3000/api/survey', newSurvey) as Observable<ISurvey[]>
  }

  updateSurvey(newSurvey: ISurveyDTO, surveyId: number) {
    return this.httpClient.put('http://localhost:3000/api/survey/' + surveyId, newSurvey) as Observable<ISurvey[]>
  }

  deleteSurvey(survey: ISurvey){
    return this.httpClient.post('http://localhost:3000/api/survey/delete',survey) as Observable<ISurvey[]>
  }
  updateResponse(response: IResponse){
    return this.httpClient.put('http://localhost:3000/api/response',response) as Observable<ISurveyResponses[]>
  }

  addResponse(response: IResponseDTO, surveyId: number) {
    return this.httpClient.post('http://localhost:3000/api/response/' + surveyId,response) as Observable<ISurveyResponses[]>
  }

  updateSurveyResponses(surveyResponse: ISurveyResponses) {
    return this.httpClient.put('http://localhost:3000/api/surveyresponses',surveyResponse) as Observable<ISurveyResponses[]>
  }
}
