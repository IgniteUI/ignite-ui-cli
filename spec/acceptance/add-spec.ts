import { spawnSync } from "child_process";
import * as fs from "fs-extra";
import { EOL } from "os";
import { parse } from "path";
import cli = require("../../lib/cli");
import { GoogleAnalytics } from "../../lib/GoogleAnalytics";
import { ProjectConfig } from "../../lib/ProjectConfig";
import { resetSpy } from "../helpers/utils";
import { PromptSession } from "./../../lib/PromptSession";

describe("Add command", () => {
	let testFolder = parse(__filename).name;

	beforeEach(() => {
		spyOn(console, "log");
		spyOn(console, "error");
		spyOn(GoogleAnalytics, "post");

		// test folder, w/ existing check:
		while (fs.existsSync(`./output/${testFolder}`)) {
			testFolder += 1;
		}
		fs.mkdirSync(`./output/${testFolder}`);
		process.chdir(`./output/${testFolder}`);
	});

	afterEach(() => {
		// clean test folder:
		process.chdir("../../");
		fs.rmdirSync(`./output/${testFolder}`);
	});

	it("Should not work without a project", async done => {
		await cli.run(["add", "grid", "name"]);

		expect(console.error).toHaveBeenCalledWith(
			jasmine.stringMatching(/Add command is supported only on existing project created with igniteui-cli\s*/)
		);
		expect(console.log).toHaveBeenCalledTimes(0);
		expect(GoogleAnalytics.post).toHaveBeenCalledWith(
			{
				// tslint:disable:object-literal-sort-keys
				t: "screenview",
				cd: "Add"
				// tslint:enable:object-literal-sort-keys
			});
		expect(GoogleAnalytics.post).toHaveBeenCalledWith(
			{
				// tslint:disable:object-literal-sort-keys
				cd: "error: Add command is supported only on existing project created with igniteui-cli",
				t: "screenview"
				// tslint:enable:object-literal-sort-keys
			});
		expect(GoogleAnalytics.post).toHaveBeenCalledTimes(2);

		resetSpy(console.error);
		await cli.run(["add"]);
		expect(console.error).toHaveBeenCalledWith(
			jasmine.stringMatching(/Add command is supported only on existing project created with igniteui-cli\s*/)
		);
		expect(console.log).toHaveBeenCalledTimes(0);

		done();
	});

	it("Should not work quickstart project", async done => {
		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({ project: { isShowcase: true} }));
		await cli.run(["add", "grid", "name"]);

		expect(console.error).toHaveBeenCalledWith(
			jasmine.stringMatching(/Showcases and quickstart projects don't support the add command\s*/)
		);
		expect(console.log).toHaveBeenCalledTimes(0);

		fs.unlinkSync(ProjectConfig.configFile);
		done();
	});

	it("Should not work with wrong framework", async done => {
		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({ project: { framework: "angular2" } }));
		await cli.run(["add", "grid", "name"]);

		expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(/Framework not supported\s*/));
		expect(console.log).toHaveBeenCalledTimes(0);

		fs.unlinkSync(ProjectConfig.configFile);
		done();
	});

	it("Should not work with wrong template", async done => {
		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({ project: { framework: "jquery" } }));
		await cli.run(["add", "wrong", "name"]);

		expect(console.error).toHaveBeenCalledWith(
			jasmine.stringMatching(/Template doesn't exist in the current library\s*/)
		);
		expect(console.log).toHaveBeenCalledTimes(0);

		fs.unlinkSync(ProjectConfig.configFile);
		done();
	});

	it("Should correctly add jQuery template", async done => {
		// TODO: Mock out template manager and project register
		spyOn(ProjectConfig, "globalConfig").and.returnValue({});

		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({
			project: { framework: "jquery", projectType: "js", components: [], igniteuiSource: "", themePath: "" }
		}));
		fs.writeFileSync("ignite-cli-views.js", "[];");
		await cli.run(["add", "grid", "Test view"]);

		expect(console.error).toHaveBeenCalledTimes(0);
		expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/View 'Test view' added\s*/));

		expect(fs.existsSync("./test-view")).toBeTruthy();
		expect(fs.existsSync("./test-view/index.html")).toBeTruthy();
		fs.unlinkSync("./test-view/index.html");
		fs.rmdirSync("./test-view");

		fs.unlinkSync("ignite-cli-views.js");
		fs.unlinkSync(ProjectConfig.configFile);
		done();
	});

	it("Should not duplicate add jq Grid template", async done => {
		spyOn(ProjectConfig, "globalConfig").and.returnValue({});

		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({
			project: { framework: "jquery", projectType: "js", components: [], igniteuiSource: "", themePath: "" }
		}));
		fs.writeFileSync("ignite-cli-views.js", "[];");
		await cli.run(["add", "grid", "Test view"]);

		expect(console.error).toHaveBeenCalledTimes(0);
		expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/View 'Test view' added\s*/));

		expect(fs.existsSync("./test-view")).toBeTruthy();
		expect(fs.existsSync("./test-view/index.html")).toBeTruthy();

		fs.writeFileSync("./test-view/index.html", "test");
		await cli.run(["add", "grid", "Test view"]);

		expect(console.error).toHaveBeenCalledWith(
			jasmine.stringMatching(/test-view[\\\/]index.html already exists!*/)
		);
		expect(fs.readFileSync("./test-view/index.html").toString()).toEqual("test", "Shouldn't overwrite file contents");

		// dash
		resetSpy(console.error);
		await cli.run(["add", "grid", "test-View"]);

		expect(console.error).toHaveBeenCalledWith(
			jasmine.stringMatching(/test-view[\\\/]index.html already exists!*/)
		);
		expect(fs.readFileSync("./test-view/index.html").toString()).toEqual("test", "Shouldn't overwrite file contents");

		// trim
		resetSpy(console.error);
		await cli.run(["add", "grid", "    Test-view  \t "]);

		expect(console.error).toHaveBeenCalledWith(
			jasmine.stringMatching(/test-view[\\\/]index.html already exists!*/)
		);
		expect(fs.readFileSync("./test-view/index.html").toString()).toEqual("test", "Shouldn't overwrite file contents");

		fs.unlinkSync("./test-view/index.html");
		fs.rmdirSync("./test-view");
		fs.unlinkSync("ignite-cli-views.js");
		fs.unlinkSync(ProjectConfig.configFile);
		done();
	});

	it("Should correctly add Angular template", async done => {
		spyOn(ProjectConfig, "globalConfig").and.returnValue({});

		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({
			project: { framework: "angular", projectType: "ig-ts", components: [] }
		}));
		fs.mkdirSync(`./src`);
		fs.mkdirSync(`./src/app`);
		fs.writeFileSync("src/app/app-routing.module.ts", "const routes: Routes = [];");
		fs.writeFileSync("src/app/app.module.ts", `@NgModule({
			declarations: [
			  AppComponent,
			  HomeComponent
			],
			imports: [ BrowserModule ],
			bootstrap: [AppComponent]
		})
		export class AppModule { }`);
		await cli.run(["add", "grid", "Test view"]);

		expect(console.error).toHaveBeenCalledTimes(0);
		expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/View 'Test view' added\s*/));

		expect(fs.existsSync("./src/app/components/test-view")).toBeTruthy();
		const componentPath = "./src/app/components/test-view/test-view.component.ts";
		expect(fs.existsSync(componentPath)).toBeTruthy();
		// file contents:
		expect(fs.readFileSync(componentPath, "utf-8")).toContain("export class TestViewComponent");
		expect(fs.readFileSync("src/app/app-routing.module.ts", "utf-8").replace(/\s/g, "")).toBe(
			`import { TestViewComponent } from "./components/test-view/test-view.component";
			const routes: Routes = [{ path: "test-view", component: TestViewComponent, data: { text: "Test view" } }];
			`.replace(/\s/g, "")
		);
		expect(fs.readFileSync("src/app/app.module.ts", "utf-8").replace(/\s/g, "")).toBe(
			`import { TestViewComponent } from "./components/test-view/test-view.component";
			@NgModule({
				declarations: [
					AppComponent,
					HomeComponent,
					TestViewComponent
				],
				imports: [ BrowserModule ],
				bootstrap: [AppComponent]
			})
			export class AppModule {
			}
			`.replace(/\s/g, "")
		);
		fs.unlinkSync("./src/app/components/test-view/test-view.component.ts");
		fs.removeSync("./src");

		fs.unlinkSync(ProjectConfig.configFile);

		expect(GoogleAnalytics.post).toHaveBeenCalledWith(
			{
				// tslint:disable:object-literal-sort-keys
				t: "screenview",
				cd: "Add"
				// tslint:enable:object-literal-sort-keys
			});
		expect(GoogleAnalytics.post).toHaveBeenCalledWith(
			{
				// tslint:disable:object-literal-sort-keys
				t: "event",
				ec: "$ig add",
				ea: "template id: grid; file name: Test view",
				cd1: "angular",
				cd2: "ig-ts",
				cd5: "Data Grids",
				cd7: "grid",
				cd8: "Grid",
				cd11: false,
				cd14: undefined
				// tslint:enable:object-literal-sort-keys
			});
		expect(GoogleAnalytics.post).toHaveBeenCalledTimes(2);

		done();
	});

	it("Should correctly add Ignite UI for Angular template", async done => {
		spyOn(ProjectConfig, "globalConfig").and.returnValue({});

		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({
			project: { framework: "angular", projectType: "igx-ts", components: [] }
		}));
		fs.writeFileSync("tslint.json", JSON.stringify({
			rules: {
				"indent": [ true, "spaces", 2 ],
				"prefer-const": true,
				"quotemark": [ true, "single" ]
			}
		}));
		fs.mkdirSync(`./src`);
		fs.mkdirSync(`./src/app`);
		fs.writeFileSync("src/app/app-routing.module.ts", "const routes: Routes = [];");
		fs.writeFileSync("src/app/app.module.ts", `@NgModule({
			declarations: [
			  AppComponent,
			  HomeComponent
			],
			imports: [
			  BrowserModule
			],
			bootstrap: [AppComponent]
		})
		export class AppModule { }`);

		await cli.run(["add", "grid", "Test view"]);

		expect(console.error).toHaveBeenCalledTimes(0);
		expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/View 'Test view' added\s*/));

		expect(fs.existsSync("./src/app/test-view")).toBeTruthy();
		const componentPath = "./src/app/test-view/test-view.component.ts";
		expect(fs.existsSync(componentPath)).toBeTruthy();
		// file contents:
		expect(fs.readFileSync(componentPath, "utf-8")).toContain("export class TestViewComponent");
		expect(fs.readFileSync("src/app/app-routing.module.ts", "utf-8")).toBe(
			`import { TestViewComponent } from './test-view/test-view.component';` +  EOL +
			`const routes: Routes = [{ path: 'test-view', component: TestViewComponent, data: { text: 'Test view' } }];` +  EOL
		);

		expect(fs.readFileSync("src/app/app.module.ts", "utf-8")).toBe(
			`import { TestViewComponent } from './test-view/test-view.component';` +  EOL +
			`import { IgxGridModule } from 'igniteui-angular';` +  EOL +
			`@NgModule({` +  EOL +
			`  declarations: [` +  EOL +
			`    AppComponent,` +  EOL +
			`    HomeComponent,` +  EOL +
			`    TestViewComponent` +  EOL +
			`  ],` +  EOL +
			`  imports: [` +  EOL +
			`    BrowserModule,` +  EOL +
			`    IgxGridModule.forRoot()` +  EOL +
			`  ],` +  EOL +
			`  bootstrap: [AppComponent]` +  EOL +
			`})` +  EOL +
			`export class AppModule {` +  EOL +
			`}` +  EOL
		);
		fs.unlinkSync("./src/app/test-view/test-view.component.ts");
		fs.removeSync("./src");

		fs.unlinkSync(ProjectConfig.configFile);
		fs.unlinkSync("tslint.json");
		done();
	});

	it("Should correctly add React template", async done => {
		// TODO: Mock out template manager and project register
		spyOn(ProjectConfig, "globalConfig").and.returnValue({});

		fs.writeFileSync(ProjectConfig.configFile, JSON.stringify({
			project: { framework: "react", projectType: "es6", components: [] }
		}));
		fs.mkdirSync(`./client`);
		fs.mkdirSync(`./client/pages`);
		fs.writeFileSync("client/pages/routesTemplate.js", "[];");
		fs.writeFileSync("client/pages/routes.js", "[];");
		await cli.run(["add", "grid", "My grid"]);

		expect(console.error).toHaveBeenCalledTimes(0);
		expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/View 'My grid' added\s*/));

		expect(fs.existsSync("./client/components/my-grid")).toBeTruthy();
		expect(fs.existsSync("./client/components/my-grid/index.js")).toBeTruthy();
		expect(fs.existsSync("./client/pages/my-grid/index.js")).toBeTruthy();
		fs.unlinkSync("./client/components/my-grid/index.js");
		fs.removeSync("./client");

		fs.unlinkSync(ProjectConfig.configFile);
		done();
	});
});
