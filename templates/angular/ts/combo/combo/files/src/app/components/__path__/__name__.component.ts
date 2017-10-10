import { Component } from "@angular/core";
import { ActivatedRoute, Routes } from "@angular/router";

@Component({
	selector: "app-combo",
	template: `<ig-combo [widgetId]="'combo2'"
				[(options)]="options"
				[(ngModel)]="combo.value"></ig-combo>`
})
export class ComboComponent {
	public options: IgCombo;
	public platforms: any;
	public combo: any;

	constructor() {
		this.platforms = [
			{ Name: "jQuery/HTML5/ASP.NET MVC Controls" },
			{ Name: "ASP.NET Controls" },
			{ Name: "Windows Forms Controls" },
			{ Name: "WPF Controls" },
			{ Name: "Android Native mobile controls" },
			{ Name: "iOS Controls" },
			{ Name: "SharePlus" },
			{ Name: "ReportPlus" },
			{ Name: "Indigo Studio" }
		];
		this.options = {
			width: 300,
			dataSource: this.platforms,
			valueKey: "Name",
			textKey: "Name",
			multiSelection: {
				enabled: true,
				showCheckboxes: true
			},
			dropDownOrientation: "bottom"
		};
		this.combo = {
			value: null
		};
	}
}
