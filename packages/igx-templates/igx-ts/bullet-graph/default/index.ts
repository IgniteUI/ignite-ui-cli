import { IgniteUIForAngularTemplate } from "../../../IgniteUIForAngularTemplate";

class IgxBulletGraphTemplate extends IgniteUIForAngularTemplate {
	constructor() {
		super(__dirname);
		this.components = ["Bullet Graph"];
		this.controlGroup = "Gauges";
		this.listInComponentTemplates = true;
		this.id = "bullet-graph";
		this.projectType = "igx-ts";
		this.name = "Bullet Graph";
		this.description = "IgxBulletGraph with different animations.";
		this.dependencies = [{
			import: ["IgxBulletGraphModule"],
			from: "igniteui-angular-gauges"
		}];
		this.packages = ["tslib@^1.7.1", "igniteui-angular-core@~9.1.0", "igniteui-angular-gauges@~9.1.0"];
	}
}
module.exports = new IgxBulletGraphTemplate();
