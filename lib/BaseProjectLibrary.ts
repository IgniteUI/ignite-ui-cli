import * as path from "path";
import { Util } from "./Util";

export class BaseProjectLibrary implements ProjectLibrary {
	public projectType: string;
	public framework: string;
	//templates: Template[];
	public name: string;
	public themes: string[];

	protected _projectsPath: string = "projects";
	protected _customTemplatesPath: string = "custom-templates";

	private _templates: Template[];
	public get templates(): Template[] {
		let list: Template[] = [];
		for (const component of this.components) {
			list = list.concat(component.templates);
		}
		list = list.concat(this.customTemplates);
		return list;
	}
	private _projects: string[] = [];
	public get projects(): string[] {
		//read projects list
		if (!this._projects.length) {
			this._projects = Util.getDirectoryNames(path.join(this.rootPath, this._projectsPath));
		}
		return this._projects;
	}

/*	private _customTemplates : string[];
	public get customTemplates() : string[] {
		if (!this._customTemplates.length) {
			this._customTemplates = Util.getDirectoryNames(path.join(this.rootPath, this._customTemplatesPath));
		}
		return this._customTemplates;
	}*/

	private _customTemplates: Template[] = [];
	public get customTemplates(): Template[] {
		if (!this._customTemplates.length) {
			const customTemplatesFolders: string[] = Util.getDirectoryNames(path.join(this.rootPath, this._customTemplatesPath));

			for (const element of customTemplatesFolders) {
				this._customTemplates.push(require(path.join(
					this.rootPath,
					this._customTemplatesPath,
					element)) as Template);
			}
		}
		return this._customTemplates;
	}

	private _components: Component[] = [];
	public get components(): Component[] {
		if (!this._components.length) {
			//read file
			//read components lists
			const componentFolders: string[] = Util.getDirectoryNames(this.rootPath)
				.filter(x => x !== this._projectsPath && x !== this._customTemplatesPath);

			for (const componentFolder of componentFolders) {
				this._components.push(require(path.join(this.rootPath, componentFolder)) as Component);
			}
		}
		return this._components;
	}

	/**
	 *
	 */
	constructor(private rootPath: string) {}

	public getTemplateById(id: string): Template {
		return this.templates.find(x => x.id === id);
	}
	public getTemplateByName(name: string): Template {
		return this.templates.find(x => x.name === name);
	}
	public registerTemplate(template: Template): void {
		if (template) {
			this.templates.push(template);
			const newComponents = template.components.filter(x => !this.components.find(f => f.name === x));
			for (const newComponent of newComponents) {

				const component: Component = {
					group: template.controlGroup,
					name: newComponent,
					templates: []
				};
				this.components.push(component);
			}
		}
	}

	public getComponentByName(name: string): Component {
		return this.components.find(x => x.name === name);
	}
	public getCustomTemplateNames(): string[] {
		const cTemplates: string[] = [];
		for (const customTemplate of this.customTemplates) {
			//var p: CustomTemplate = this.customTemplates[index] as CustomTemplate;
			cTemplates.push(customTemplate.name);
		}
		return cTemplates;
	}
	public getCustomTemplateByName(name: string): Template {
		return this.customTemplates.find((x, y, z) => x.name === name);
	}

	public getComponentGroups(): string[] {
		let groups: string[];

		//poor-man's groupBy reduce
		groups = this.components.reduce((prev, current, index, array) => {
			if (prev.indexOf(current.group) === -1) {
				prev.push(current.group);
			}
			return prev;
		}, []);
		return groups;
	}

	public getComponentNamesByGroup(group: string): string[] {
		return this.components.filter(x => x.group === group).map(x => x.name);
	}

	/**
	 * Get project template
	 * @param name Optional name of the project template. Defaults to "empty"
	 */
	public getProject(name: string = "empty"): ProjectTemplate {
		if (this.hasProject(name)) {
			return require(path.join(this.rootPath, this._projectsPath, name)) as ProjectTemplate;
		}
		return null;
	}

	public hasProject(name: string): boolean {
		return this.projects.indexOf(name) > -1;
	}
	//abstraction for projects

	public hasTemplate(id: string): boolean {
		return this.templates.find(x => x.id === id) !== undefined;
	}
}
