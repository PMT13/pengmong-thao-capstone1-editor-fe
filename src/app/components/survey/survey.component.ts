import {Component, Input, OnInit} from '@angular/core';
import {ISurvey} from "../../interfaces/ISurvey";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {IResponse} from "../../interfaces/IResponse";
import {IResponseDTO} from "../../interfaces/IResponseDTO";
import { DataService } from 'src/app/services/data.service';
import { IQuestionDTO } from 'src/app/interfaces/IQuestionDTO';
import { ISurveyDTO } from 'src/app/interfaces/ISurveyDTO';
import { ISurveyResponses } from 'src/app/interfaces/ISurveyResponses';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {

  @Input() survey!: ISurvey;
  questionList!: IQuestionDTO[];
  surveyResponses!: ISurveyResponses[];
  error: boolean = false;
  errorMsg: string = "";
  title!: string;
  viewingResponses: boolean = false;

  constructor(private modalService: NgbModal, private dataService: DataService) {
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
    this.modalService.open(content);
  }

  addQuestion() {
    this.questionList.push({
      question: "",
      questionOrder: this.questionList.length,
      type: "",
      choices: ""
    });
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

  moveQuestion(question: IQuestionDTO) {
    this.questionList.splice(question.questionOrder, 0, question);
    this.setQuestionOrder();
  }
  
  setQuestionOrder(){
    let order = 0;
    for(let question of this.questionList){
      question.questionOrder = order;
      order++;
    }
  }
  
  deleteSurvey() {
    this.dataService.deleteSurvey(this.survey);
  }

  viewResponses(content: any) {
    this.modalService.open(content);
    this.dataService.getAllResponses();
    this.surveyResponses = this.dataService.surveyResponses.filter(response => response.surveyId === this.survey.id);
    this.sortResponses();
    this.viewingResponses = true;
  }
}
