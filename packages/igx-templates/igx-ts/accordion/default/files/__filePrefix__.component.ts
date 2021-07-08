import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-<%=filePrefix%>',
  templateUrl: './<%=filePrefix%>.component.html',
  styleUrls: ['./<%=filePrefix%>.component.scss']
})
export class <%=ClassName%>Component implements OnInit {
	public singleBranchExpand = false;
	constructor() { }

	public ngOnInit() {
  	}
}
