import { Rule, schematic, Tree } from "@angular-devkit/schematics";
import {
	BasePromptSession, BaseTemplateManager, Framework, IUserInputOptions,
	ProjectLibrary, ProjectTemplate, PromptTaskContext, Task, ProjectConfig, NgTreeFileSystem } from "@igniteui-cli/core";

export class SchematicsPromptSession extends BasePromptSession {

	constructor(templateManager: BaseTemplateManager, private rulesChain: Rule[]) {
		super(templateManager);
		this.config = ProjectConfig.getConfig();
	}

	public setTree(tree: Tree) {
		ProjectConfig.virtFs = new NgTreeFileSystem(tree);
	}

	public async getUserInput(options: IUserInputOptions, withBackChoice: boolean = false): Promise<string> {
		return super.getUserInput(options, withBackChoice);
	}

	public async getProjectLibrary(framework: Framework): Promise<ProjectLibrary> {
		return super.getProjectLibrary(framework);
	}

	public async getProjectTemplate(projectLibrary: ProjectLibrary): Promise<ProjectTemplate> {
		return super.getProjectTemplate(projectLibrary);
	}

	public async getTheme(projectLibrary: ProjectLibrary): Promise<string> {
		return super.getTheme(projectLibrary);
	}

	public nameIsValid(name: string, checkFolder = true): boolean {
		return super.nameIsValid(name, checkFolder);
	}

	protected completeAndRun(_port?: number) {
		// TODO?
	}

	protected templateSelectedTask(type: "component" | "view" = "component"): Task<PromptTaskContext> {
		return async (_runner, context) => {
			if (!context.template) {
				return false;
			}
			const name = await this.chooseTemplateName(context.template, type);
			if (context.template.hasExtraConfiguration) {
				await this.customizeTemplateTask(context.template);
			}
			this.rulesChain.push(schematic("component", {
				name,
				template: context.template
			}));
			return true;
		};
	}

}
