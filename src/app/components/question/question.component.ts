import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IQuestion } from 'src/app/interfaces/IQuestion';
import { IQuestionDTO } from 'src/app/interfaces/IQuestionDTO';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent implements OnInit {

  @Output() updateQuestions = new EventEmitter<IQuestionDTO>();
  @Output() deleteQuestion = new EventEmitter<number>();
  @Output() moveQuestion = new EventEmitter<IQuestionDTO>();
  @Input() questionInput!: IQuestionDTO;

  question!: string;
  type!: string;
  isEditing!: boolean;
  error: boolean = false;
  errorMsg: string = "";

  choice1!: string;
  choice2!: string;
  choice3!: string;
  choice4!: string;

  constructor() { }

  ngOnInit(): void {
    if(this.questionInput.question != ""){
      this.isEditing = false;
    }else{
      this.isEditing = true;
    }
    this.question = this.questionInput.question;
    this.type = this.questionInput.type;
    const choices = this.questionInput.choices.split(",");
    this.choice1 = choices[0];
    this.choice2 = choices[1];
    this.choice3 = choices[2];
    this.choice4 = choices[3];
  }

  save() {
    if(this.question === "" || this.type === ""){
      this.error = true;
      this.errorMsg = "Please provide both a question and a question type!"
      return;
    }
    if(this.type === "choices" && (this.choice1 === "" || this.choice2 === "" || this.choice3 === "" || this.choice4 === "")){
      this.error = true;
      this.errorMsg = "Please fill in all choices for Multiple Choice type!"
      return;
    }
    if(this.type === "choices" && (this.choice1.includes(",") || this.choice2.includes(",") || this.choice3.includes(",") || this.choice4.includes(","))){
      this.error = true;
      this.errorMsg = "No commas allowed in the multiple choice!"
      return;
    }
    this.isEditing = false;
    if(this.type === "choices") {
      const newQuestion =
        {
          question: this.question,
          questionOrder: this.questionInput.questionOrder,
          type: this.type,
          choices: this.choice1 + "," + this.choice2 + "," + this.choice3 + "," + this.choice4
        }
      this.updateQuestions.emit(newQuestion);
    }else{
      const newQuestion =
        {
          question: this.question,
          questionOrder: this.questionInput.questionOrder,
          type: this.type,
          choices: ""
        }
      this.updateQuestions.emit(newQuestion);
    }
  }

  delete() {
    this.deleteQuestion.emit(this.questionInput.questionOrder);
  }

  moveDown() {
    this.deleteQuestion.emit(this.questionInput.questionOrder);
    this.questionInput.questionOrder++; 
    this.moveQuestion.emit(this.questionInput);
  }
  
  moveUp(){
    this.deleteQuestion.emit(this.questionInput.questionOrder);
    this.questionInput.questionOrder--; 
    this.moveQuestion.emit(this.questionInput);
  }
}
