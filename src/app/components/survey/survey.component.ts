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
  surveyResponsesCopy: ISurveyResponses[] = [];
  error: boolean = false;
  errorMsg: string = "";
  title!: string;
  viewingResponses: boolean = false;

  modalOption: NgbModalOptions = {};
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

  // sort the questions as sometimes thye doesn't come in from the backend in order
  sortQuestions(){
    this.survey.questionSet = this.survey.questionSet.sort(function(a,b){return a.questionOrder - b.questionOrder});
  }

  // sort the responses as sometimes they doesn't come in from the backend in order
  sortResponses(){
    for(let response of this.surveyResponses){
      response.responses = response.responses.sort(function(a,b){return a.responseOrder - b.responseOrder});
    }
  }

  // Make sure the order of the questions are set correctly
  setQuestionOrder(){
    let order = 0;
    for(let question of this.questionList){
      question.questionOrder = order;
      order++;
    }
  }

  // Make sure the order of the responses to the questions are set correctly and align with the correct questions
  setResponseOrder(){
    for(let surveyResponse of this.surveyResponses){
      let order = 0;
      for(let response of surveyResponse.responses){
        response.responseOrder = order;
        order++;
      }
    }
  }

  // open the modal for editing and don't allow the user to exit by pressing 'ESC' key or clicking out of modal,
  // they must click the 'X' mark in the upper right hand corner
  open(content:any) {
    this.surveyResponsesCopy = JSON.parse(JSON.stringify(this.surveyResponses));
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalService.open(content,this.modalOption);
  }

  // When a new question is added during editing, add a new blank question to the questionlist, and
  // add an empty response to all existing survey responses that correlate with the new question
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

  // when the edits are submitted, update the survey and responses in the backend
  submit() {
    if(this.title === ""){
      this.error = true;
      this.errorMsg = "Please give the survey a title!"
      return;
    }
    if(this.questionList.length === 0){
      this.error = true;
      this.errorMsg = "Please have at least one question!"
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

    this.setResponseOrder();
    for(let surveyResponse of this.surveyResponses){
      this.dataService.updateSurveyResponses(surveyResponse);
      for (let response of surveyResponse.responses) {
        this.dataService.updateResponses(response);
      }
    }

    this.reset();
    this.modalService.dismissAll();
  }

  // reset some values
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

  // when the 'X' in the edit modal is clicked
  exitEdit(){
    this.reset();
    this.surveyResponses = JSON.parse(JSON.stringify(this.surveyResponsesCopy));
    for(let surveyResponse of this.surveyResponses){
      this.dataService.updateSurveyResponses(surveyResponse);
      for (let response of surveyResponse.responses) {
        this.dataService.updateResponses(response);
      }
    }
  }

  // when a question is edited and then saved, update the question in the list
  updateQuestions(question: IQuestionDTO) {
    this.questionList[question.questionOrder] = question;
    this.setQuestionOrder();
  }

  // when a question is deleted, remove it from the list
  deleteQuestion(questionOrder: number) {
    this.questionList = this.questionList.filter(question => question.questionOrder !== questionOrder);
    this.setQuestionOrder();
  }

  // when a question is deleted, delete the responses associated with that question
  deleteResponse(order: number){
    for(let surveyResponse of this.surveyResponses) {
      const newResponses = surveyResponse.responses.filter(response => response.responseOrder !== order);
      surveyResponse.responses = newResponses;
    }
    this.setResponseOrder();
  }

  // insert the question into its new position
  moveQuestion(question: IQuestionDTO) {
    this.questionList.splice(question.questionOrder, 0, question);
    this.setQuestionOrder();
  }

  // when a question is moved up, move the responses accordingly in the list so that they line up with their correlating question
  moveResponseUp(order: number){
    for(let surveyResponse of this.surveyResponses){
      let responseCopy = surveyResponse.responses[order];
      const newResponses = surveyResponse.responses.filter(response => response.id !== surveyResponse.responses[order].id);
      surveyResponse.responses = newResponses;
      surveyResponse.responses.splice(order - 1, 0, responseCopy);
      this.setResponseOrder();
    }
  }

  // when a question is moved down, move the responses accordingly in the list so that they line up with their correlating question
  moveResponseDown(order: number){
    for(let surveyResponse of this.surveyResponses){
      const responseCopy = surveyResponse.responses[order];
      const newResponses = surveyResponse.responses.filter(response => response.id !== surveyResponse.responses[order].id);
      surveyResponse.responses = newResponses;
      surveyResponse.responses.splice(order + 1, 0, responseCopy);
      this.setResponseOrder();
    }
  }

  // delete an entire survey
  deleteSurvey() {
    this.dataService.deleteSurvey(this.survey);
  }

  // allow the user to see the responses to the survey in a modal
  viewResponses(content: any) {
    this.modalService.open(content);
    this.dataService.getAllResponses();
    this.sortResponses();
    this.viewingResponses = true;
  }
}
