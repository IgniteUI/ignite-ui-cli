import { IgniteUIForAngularTemplate } from "../../../../../lib/templates/IgniteUIForAngularTemplate";

class IgxBottomNavTemplate extends IgniteUIForAngularTemplate {
	constructor() {
		super(__dirname);
		this.components = ["Bottom Navigation"];
		this.controlGroup = "Layouts";
		this.listInComponentTemplates = true;
		this.id = "bottom-nav";
		this.projectType = "igx-ts";
		this.name = "Bottom Navigation";
		this.description = "Three item bottom navigation template";
		this.dependencies = [{
			from: "igniteui-angular",
			import: ["IgxBottomNavModule", "IgxAvatarModule", "IgxIconModule", "IgxRippleModule"]
		}, {
			from: "@angular/common",
			import: "CommonModule"
		}];
	}
}
module.exports = new IgxBottomNavTemplate();
