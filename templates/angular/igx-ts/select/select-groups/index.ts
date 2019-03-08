import { IgniteUIForAngularTemplate } from "../../../../../lib/templates/IgniteUIForAngularTemplate";

class IgxSelectTemplate extends IgniteUIForAngularTemplate {
	constructor() {
		super(__dirname);
		this.components = ["Select With Groups"];
		this.controlGroup = "Grids & Lists";
		this.listInComponentTemplates = true;
		this.id = "select-groups";
		this.projectType = "igx-ts";
		this.name = "Select With Groups";
		this.description = "IgxSelect that has groups";
		this.dependencies = [{
			import: [
				"IgxSelectModule", "IgxFilterModule",
				"IgxButtonModule", "IgxToggleModule"
			],
			from: "igniteui-angular"
		}];
	}
}
module.exports = new IgxSelectTemplate();
