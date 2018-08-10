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
		this.description = "three item bottom navigation template";
		this.dependencies = [{
			from: "igniteui-angular",
			import: ["IgxBottomNavModule", "IgxAvatarModule", "IgxIconModule", "IgxRippleModule"]
		}];
	}
}
module.exports = new IgxBottomNavTemplate();
