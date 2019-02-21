import { IgniteUIForAngularTemplate } from "../../../../../lib/templates/IgniteUIForAngularTemplate";

class IgxAutocompleteTemplate extends IgniteUIForAngularTemplate {
	private userExtraConfiguration: {} = {};

	constructor() {
		super(__dirname);
		this.components = ["Autocomplete"];
		this.controlGroup = "Data Entry & Display";
		this.listInComponentTemplates = true;
		this.id = "autocomplete";
		this.projectType = "igx-ts";
		this.name = "Autocomplete";
		this.description = "Basic IgxAutocomplete sample";
		this.dependencies = [{
			import: ["IgxAutocompleteModule", "IgxDropDownModule", "IgxInputGroupModule"],
			from: "igniteui-angular"
		}, {
			declare: ["$(ClassName)PipeStartsWith"],
			from: "./src/app/__path__/__name__.component.ts"
		}, {
			declare: ["$(ClassName)RegionContains"],
			from: "./src/app/__path__/__name__.component.ts"
		}];
		this.hasExtraConfiguration = true;
	}

	public setExtraConfiguration(extraConfigKeys: {}) {
		this.userExtraConfiguration = extraConfigKeys;
	}

	public getExtraConfiguration(): ControlExtraConfiguration[] {
		return [{
			choices: ["Simple Autocomplete", "Autocomplete With Groups"],
			default: "Simple Autocomplete",
			key: "autocompleteOptions",
			message: "Select the type of IgxAutocomplete you prefer",
			type: Enumerations.ControlExtraConfigType.Choice
		}];
	}

	public generateFiles(projectPath: string, name: string, ...options: any[]): Promise<boolean> {
		const selection = this.userExtraConfiguration["autocompleteOptions"];
		const extraConfig = {
			"$(autocomplete)": "",
			"$(LocalData)": ""
		};
		switch (selection) {
			case "Simple Autocomplete":
				extraConfig["$(autocomplete)"] = this.getSimpleAutoCompleteTmp();
				extraConfig["$(LocalData)"] = "townsSimple";
				break;
			case "Autocomplete With Groups":
				extraConfig["$(autocomplete)"] = this.getAutocompleteWithGroupsTmp();
				extraConfig["$(LocalData)"] = "townsGrouped";
				break;
			default:
				throw new Error("Unexpected input.");
		}

		return super.generateFiles(projectPath, name, { extraConfig });
	}

	private getSimpleAutoCompleteTmp() {
		const template =
			`<igx-drop-down #townsPanel maxHeight="300px">
				<igx-drop-down-item *ngFor="let town of towns | $(camelCaseName)StartsWith:townSelected" [value]="town">
					{{town}}
				</igx-drop-down-item>
			</igx-drop-down>`;
		return template;
	}
	private getAutocompleteWithGroupsTmp() {
		const template =
			`<igx-drop-down #townsPanel maxHeight="300px">
				<igx-drop-down-item-group *ngFor="let region of towns.regions |
					$(camelCaseName)RegionContains:townSelected" [label]="region.name">
					<igx-drop-down-item *ngFor="let town of region.towns | $(camelCaseName)StartsWith:townSelected" [value]="town">
						{{town}}
					</igx-drop-down-item>
				</igx-drop-down-item-group>
			</igx-drop-down>`;
		return template;
	}
}
module.exports = new IgxAutocompleteTemplate();