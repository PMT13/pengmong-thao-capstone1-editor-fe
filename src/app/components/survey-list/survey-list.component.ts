import {Component, OnDestroy, OnInit} from '@angular/core';
import {ISurvey} from "../../interfaces/ISurvey";
import {DataService} from "../../services/data.service";
import {ISurveyResponses} from "../../interfaces/ISurveyResponses";
import {Subscription} from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IQuestionDTO } from 'src/app/interfaces/IQuestionDTO';
import { IQuestion } from 'src/app/interfaces/IQuestion';
import { ISurveyDTO } from 'src/app/interfaces/ISurveyDTO';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit,OnDestroy {

  surveyList!: ISurvey[];
  surveyResponses!: ISurveyResponses[];
  questionList!: IQuestionDTO[];
  error: boolean = false;
  errorMsg: string = "";
  title!: string;

  sub:Subscription;
  subTwo: Subscription;

  constructor(private dataService: DataService, private modalService: NgbModal) {
    this.surveyList = this.dataService.surveyList;
    this.surveyResponses = this.dataService.surveyResponses;

    this.sub =
      this.dataService.$surveyList.subscribe((surveyList) => {
        this.surveyList = surveyList;
      });

    this.subTwo =
      this.dataService.$surveyResponses.subscribe((surveyResponses) => {
        this.surveyResponses = surveyResponses;
      });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.subTwo.unsubscribe();
  }

  open(content:any) {
    this.modalService.open(content);
    this.reset();
    this.questionList.push({
      question: "",
      questionOrder: this.questionList.length,
      type: "",
      choices: ""
    });
  }

  addQuestion() {
    console.log(this.questionList.length);
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
    this.setOrder();
    const newSurvey: ISurveyDTO =
      {
        title: this.title,
        questionList: this.questionList
      }
    this.dataService.addSurvey(newSurvey); 
    this.reset();
    this.modalService.dismissAll();
  }

  reset() {
    this.questionList = [];
    this.title = "";
    this.error = false;
  }

  updateQuestions(question: IQuestionDTO) {
    this.questionList[question.questionOrder] = question;
    this.setOrder(); 
  }

  deleteQuestion(questionOrder: number) {
    this.questionList = this.questionList.filter(question => question.questionOrder !== questionOrder); 
    this.setOrder(); 
  }

  moveQuestion(question: IQuestionDTO) {
    this.questionList.splice(question.questionOrder, 0, question);
    this.setOrder();
  }
  
  setOrder(){
    let order = 0;
    for(let question of this.questionList){
      question.questionOrder = order;
      order++;
    }
  }
}
