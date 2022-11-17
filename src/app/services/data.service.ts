import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {first, Subject} from "rxjs";
import {ISurvey} from "../interfaces/ISurvey";
import {ISurveyResponses} from "../interfaces/ISurveyResponses";
import {ISurveyResponsesDTO} from "../interfaces/ISurveyResponsesDTO";
import {ISurveyDTO} from "../interfaces/ISurveyDTO";
@Injectable({
  providedIn: 'root'
})
export class DataService {

  surveyList!: ISurvey[];
  $surveyList: Subject<ISurvey[]> = new Subject<ISurvey[]>();

  surveyResponses!: ISurveyResponses[];
  $surveyResponses: Subject<ISurveyResponses[]> = new Subject<ISurveyResponses[]>();

  constructor(private httpService: HttpService) {
    this.getAllSurveys();
    this.getAllResponses();
  }

  getAllSurveys(){
    this.httpService.getAllSurveys().pipe(first()).subscribe({
      next: data => {
        this.surveyList = data;
        this.$surveyList.next(this.surveyList);
      },
      error: (err) => {
        alert(err);
      }
    })
  }

  getAllResponses(){
    this.httpService.getAllResponses().pipe(first()).subscribe({
      next: data => {
        this.surveyResponses = data;
        this.$surveyResponses.next(this.surveyResponses);
      },
      error: (err) => {
        alert(err);
      }
    })
  }

  addSurvey(newSurvey: ISurveyDTO) {
    this.httpService.addSurvey(newSurvey).pipe(first()).subscribe({
      next: data => {
        this.surveyList = data;
        this.$surveyList.next(this.surveyList);
      },
      error: (err) => {
        alert(err);
      }
    })
  }

  updateSurvey(newSurvey: ISurveyDTO, surveyId: number) {
    this.httpService.updateSurvey(newSurvey, surveyId).pipe(first()).subscribe({
      next: data => {
        this.surveyList = data;
        this.$surveyList.next(this.surveyList);
      },
      error: (err) => {
        alert(err);
      }
    })
  }

  deleteSurvey(survey: ISurvey) {
    this.httpService.deleteSurvey(survey).pipe(first()).subscribe({
      next: data => {
        this.surveyList = data;
        this.$surveyList.next(this.surveyList);
      },
      error: (err) => {
        alert(err);
      }
    })
  }
}
