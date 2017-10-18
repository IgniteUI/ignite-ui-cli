import * as path from "path";
import * as fs from "fs-extra";
import { GridHelper } from "../../../../../lib/project-utility/GridHelper";
import { jQueryTemplate } from "../../../../../lib/templates/jQueryTemplate";
import { ProjectConfig } from "../../../../../lib/ProjectConfig";
import { Util } from "../../../../../lib/Util";

class HierarchicalGridTemplate extends jQueryTemplate {
	private gridHelper: GridHelper;
	extraConfigurations: ControlExtraConfiguration[];

	public userExtraConfiguration: {};


	/**
	 *
	 */
	constructor() {
		super(__dirname)
		this.extraConfigurations = [];
		this.name = "Hierarchical Grid";
		this.description = "Hierarchical Grid default template";
		this.dependencies = ["igHierarchicalGrid"];
		this.id = "hierarchical-grid";
		this.hasExtraConfiguration = true;

		this.gridHelper = new GridHelper();
		this.gridHelper.hierarchical = true;
		this.gridHelper.space = "    ";
		var featureConfiguration: ControlExtraConfiguration = {
			key: "features",
			choices: ["Sorting", "Paging", "Filtering"],
			default: "",
			type: Enumerations.ControlExtraConfigType.MultiChoice,
			message: "Select features for the igHierarchicalGrid"
		}
		this.extraConfigurations.push(featureConfiguration);
	}
	setExtraConfiguration(extraConfigKeys: {}) {
		this.userExtraConfiguration = extraConfigKeys;
	}
	generateFiles(projectPath: string, name: string, ...options: any[]): Promise<boolean> {
		var success = true,
			destinationPath = path.join(projectPath, this.folderName(name));
		//read html
		const config = {};
		this.gridHelper.addFeature("Responsive", {
			inherit: false,
			enableVerticalRendering: false,
			columnSettings: [
				{
					columnKey: "Title",
					classes: "ui-hidden-phone"
				},
				{
					columnKey: "Region",
					classes: "ui-hidden-phone"
				},
				{
					columnKey: "City",
					classes: "ui-hidden-phone"
				}
			]
		});
		const features = this.gridHelper.generateFeatures(this.userExtraConfiguration["features"], 4);

		config["$(gridfeatures)"] = features;
		config["$(componentName)"] = name;
		config["$(cssBlock)"] = this.getCssTags();
		config["$(scriptBlock)"] = this.getScriptTags();
		const pathsConfig = {};
		return Util.processTemplates(path.join(__dirname, "files"), destinationPath, config, pathsConfig);
	}
	getExtraConfiguration(): ControlExtraConfiguration[] {
		return this.extraConfigurations;
	}
}

module.exports = new HierarchicalGridTemplate();
