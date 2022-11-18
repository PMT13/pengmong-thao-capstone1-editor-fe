import { Component, Input, OnInit } from '@angular/core';
import { ISurvey } from 'src/app/interfaces/ISurvey';
import { ISurveyResponses } from 'src/app/interfaces/ISurveyResponses';

@Component({
  selector: 'app-response-list',
  templateUrl: './response-list.component.html',
  styleUrls: ['./response-list.component.css']
})
export class ResponseListComponent implements OnInit {

  @Input() survey!: ISurvey;
  @Input() surveyResponses!: ISurveyResponses[];
  
  constructor() { }

  ngOnInit(): void {
    
  }

}
