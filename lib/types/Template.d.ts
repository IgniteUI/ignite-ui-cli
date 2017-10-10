/** Template interface for views/components */
declare interface Template extends BaseTemplate {
	/** CustomTemplate */
	/** Component this template collection can belong to */
	components: string[];
	/** This property is controls on which control group to be shown the template */
	controlGroup: string;
	/** Step by step */
	listInComponentTemplates: boolean;
	listInCustomTemplates: boolean;
	/** Generates template files. */
	generateFiles(projectPath: string, name: string, ...options: any[]) : Promise<boolean>;
	/** Called when the template is added to a project */
	registerInProject(projectPath: string, name: string);
}