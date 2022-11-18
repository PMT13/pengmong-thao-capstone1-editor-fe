import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ISurvey} from "../../interfaces/ISurvey";
import {NgbModal, NgbModalOptions} from "@ng-bootstrap/ng-bootstrap";
import {IResponse} from "../../interfaces/IResponse";
import {IResponseDTO} from "../../interfaces/IResponseDTO";
import { DataService } from 'src/app/services/data.service';
import { IQuestionDTO } from 'src/app/interfaces/IQuestionDTO';
import { ISurveyDTO } from 'src/app/interfaces/ISurveyDTO';
import { ISurveyResponses } from 'src/app/interfaces/ISurveyResponses';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit, OnDestroy {

  @Input() survey!: ISurvey;
  questionList!: IQuestionDTO[];
  surveyResponses!: ISurveyResponses[];
  error: boolean = false;
  errorMsg: string = "";
  title!: string;
  viewingResponses: boolean = false;
  modalOption: NgbModalOptions = {}; // not null!
  sub: Subscription;

  constructor(private modalService: NgbModal, private dataService: DataService) {
    this.dataService.getAllResponses();
    this.sub =
      this.dataService.$surveyResponses.subscribe((surveyResponses) => {
        this.surveyResponses = surveyResponses.filter(response => response.surveyId === this.survey.id);
        this.sortResponses();
      });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.sortQuestions();
    this.reset();
  }

  sortQuestions(){
    this.survey.questionSet = this.survey.questionSet.sort(function(a,b){return a.questionOrder - b.questionOrder});
  }

  sortResponses(){
    for(let response of this.surveyResponses){
      response.responses = response.responses.sort(function(a,b){return a.responseOrder - b.responseOrder});
    }
  }

  open(content:any) {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalService.open(content,this.modalOption);
  }

  addQuestion() {
    this.questionList.push({
      question: "",
      questionOrder: this.questionList.length,
      type: "",
      choices: ""
    });
    const emptyResponse: IResponseDTO =
      {
        response: "",
        responseOrder: this.questionList.length - 1
      }
    this.dataService.addResponse(emptyResponse,this.survey.id);
    this.dataService.getAllResponses();
  }

  submit() {
    if(this.title === ""){
      this.error = true;
      this.errorMsg = "Please give the survey a title!"
      return;
    }
    for(let question of this.questionList){
      if(question.question === ""){
        this.error = true;
        this.errorMsg = "Blank question detected. Make sure to save all questions!"
        return;
      }
    }
    this.setQuestionOrder();
    const newSurvey: ISurveyDTO =
      {
        title: this.title,
        questionList: this.questionList
      }
    this.dataService.updateSurvey(newSurvey, this.survey.id);
    this.setResponseOrder()
    for(let surveyResponse of this.surveyResponses){
      this.dataService.updateSurveyResponses(surveyResponse);
      for (let response of surveyResponse.responses) {
        this.dataService.updateResponses(response);
      }
    }
    this.reset();
    this.modalService.dismissAll();
  }

  reset() {
    this.questionList = [];
    for(let question of this.survey.questionSet){
      this.questionList.push(
        {
          question: question.question,
          questionOrder:question.questionOrder,
          type: question.type,
          choices: question.choices
        }
      )
    }
    this.title = this.survey.title;
    this.error = false;
  }

  updateQuestions(question: IQuestionDTO) {
    this.questionList[question.questionOrder] = question;
    this.setQuestionOrder();
  }

  deleteQuestion(questionOrder: number) {
    this.questionList = this.questionList.filter(question => question.questionOrder !== questionOrder);
    this.setQuestionOrder();
  }

  deleteResponse(order: number){
    for(let surveyResponse of this.surveyResponses) {
      const newResponses = surveyResponse.responses.filter(response => response.responseOrder !== order);
      surveyResponse.responses = newResponses;
    }
    this.setResponseOrder();
    // for(let surveyResponse of this.surveyResponses) {
    //   this.dataService.updateSurveyResponses(surveyResponse);
    //   for (let response of surveyResponse.responses) {
    //     this.dataService.updateResponses(response);
    //   }
    // }
  }

  moveQuestion(question: IQuestionDTO) {
    this.questionList.splice(question.questionOrder, 0, question);
    this.setQuestionOrder();
  }

  moveResponseUp(order: number){
    for(let surveyResponse of this.surveyResponses){
      let responseCopy = surveyResponse.responses[order];
      const newResponses = surveyResponse.responses.filter(response => response.id !== surveyResponse.responses[order].id);
      surveyResponse.responses = newResponses;
      surveyResponse.responses.splice(order - 1, 0, responseCopy);
      this.setResponseOrder();
      // for (let response of surveyResponse.responses) {
      //   this.dataService.updateResponses(response);
      // }
    }
  }

  moveResponseDown(order: number){
    for(let surveyResponse of this.surveyResponses){
      const responseCopy = surveyResponse.responses[order];
      const newResponses = surveyResponse.responses.filter(response => response.id !== surveyResponse.responses[order].id);
      surveyResponse.responses = newResponses;
      surveyResponse.responses.splice(order + 1, 0, responseCopy);
      this.setResponseOrder();
      // for (let response of surveyResponse.responses) {
      //   this.dataService.updateResponses(response);
      // }
    }
  }

  setQuestionOrder(){
    let order = 0;
    for(let question of this.questionList){
      question.questionOrder = order;
      order++;
    }
  }

  setResponseOrder(){
    for(let surveyResponse of this.surveyResponses){
      let order = 0;
      for(let response of surveyResponse.responses){
        response.responseOrder = order;
        order++;
      }
    }
  }

  deleteSurvey() {
    this.dataService.deleteSurvey(this.survey);
  }

  viewResponses(content: any) {
    this.modalService.open(content);
    this.dataService.getAllResponses();
    this.sortResponses();
    this.setResponseOrder();
    this.viewingResponses = true;
  }
}
