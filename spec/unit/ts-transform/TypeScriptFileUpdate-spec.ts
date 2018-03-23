import * as fs from "fs";
import * as ts from "typescript";
import { TypeScriptFileUpdate } from "../../../lib/project-utility/TypeScriptFileUpdate";
import { TypeScriptUtils } from "../../../lib/project-utility/TypeScriptUtils";
import { Util } from "../../../lib/Util";

describe("Unit - TypeScriptFileUpdate", () => {

	describe("Initialization", () => {
		it("Create with source file", async done => {
			class TestTsFileUpdate extends TypeScriptFileUpdate {
				public initState() {
				}
			}
			spyOn(TypeScriptUtils, "getFileSource");
			spyOn(TestTsFileUpdate.prototype, "initState");

			const tsUpdate = new TestTsFileUpdate("/test/file");
			expect(TypeScriptUtils.getFileSource).toHaveBeenCalledWith("/test/file");
			expect(TestTsFileUpdate.prototype.initState).toHaveBeenCalled();
			done();
		});

		it("Properly initialize imports info", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", `
					import { Named } from "package"; //normal named import

					import $ from "jQuery";  // default import
					import * as fs from "fs"; //namespace import

					import { SomeModule } from "another/package";
					import SOME_VAR, { Class } from "./this/file"; // default  + named import, latter is editable

					import "./my-module.js"; // no variables import
					import url = require("url"); //equals import

					class Statement {}
				`, ts.ScriptTarget.Latest, true)
			);
			class TestTsFileUpdate extends TypeScriptFileUpdate {
				public loadImportsMeta() {
					return super.loadImportsMeta();
				}
			}

			const spym = spyOn(TestTsFileUpdate.prototype, "loadImportsMeta").and.callThrough();

			const tsUpdate = new TestTsFileUpdate("/test/file");
			expect(TestTsFileUpdate.prototype.loadImportsMeta).toHaveBeenCalled();
			expect(spym.calls.mostRecent().returnValue).toEqual(
				jasmine.objectContaining({ lastIndex: 7, modulePaths: ["package", "another/package", "./this/file"] }),
				"Should collect all imports count and filter the editable paths"
			);
			done();
		});
	});

	describe("Imports", () => {

		class TestTsFileUpdate extends TypeScriptFileUpdate {
			public formatFile() {
			}
			public requestImport(identifiers: string[], modulePath: string) {
				super.requestImport(identifiers, modulePath);
			}
		}

		it("Creates new imports", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", `
					import { Named } from "package";
					import { SomeModule } from "another/package";
				`, ts.ScriptTarget.Latest, true)
			);
			spyOn(fs, "writeFileSync");
			spyOn(TestTsFileUpdate.prototype, "formatFile");
			spyOn(ts, "transform");

			const tsUpdate = new TestTsFileUpdate("/test/file");
			tsUpdate.requestImport(["newClass"], "./path/newfile");
			tsUpdate.requestImport(["newModule"], "package2");
			tsUpdate.requestImport(["newModule"], "package2"); //duplicate, should be ignored
			tsUpdate.finalize();

			expect(ts.transform).toHaveBeenCalledTimes(0);
			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/test/file",
				jasmine.stringMatching(`import { Named } from "package";\\s*` +
					`import { SomeModule } from "another/package";\\s*` +
					`import { newClass } from "./path/newfile";\\s*` +
					`import { newModule } from "package2";`
				)
			);
			expect(TestTsFileUpdate.prototype.formatFile).toHaveBeenCalled();
			done();
		});

		it("Create and edit imports", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", `
					import { Named } from "package";
					import { SomeModule } from "existing/package";
				`, ts.ScriptTarget.Latest, true)
			);
			spyOn(fs, "writeFileSync");
			spyOn(TestTsFileUpdate.prototype, "formatFile");

			const tsUpdate = new TestTsFileUpdate("/test/file");
			tsUpdate.requestImport(["newModule"], "existing/package");
			tsUpdate.requestImport(["newModule2"], "existing/package");
			tsUpdate.requestImport(["newModule2"], "existing/package"); //duplicate
			tsUpdate.requestImport(["newClass"], "./path/newfile");
			tsUpdate.finalize();
			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/test/file",
				jasmine.stringMatching(`import { Named } from "package";\\s*` +
					`import { SomeModule, newModule, newModule2 } from "existing/package";\\s*` +
					`import { newClass } from "./path/newfile";\\s*`
				)
			);
			expect(TestTsFileUpdate.prototype.formatFile).toHaveBeenCalled();
			done();
		});

		it("Register imports for meta edits", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", "", ts.ScriptTarget.Latest, true)
			);
			const requestImportSpy = spyOn(TestTsFileUpdate.prototype, "requestImport").and.callThrough();

			const tsUpdate = new TestTsFileUpdate("/test/file");
			tsUpdate.addNgModuleMeta({import: "test"});
			expect(requestImportSpy).toHaveBeenCalledTimes(0);
			tsUpdate.addNgModuleMeta({import: "testImport", from: "package"});
			expect(requestImportSpy).toHaveBeenCalledWith(["testImport"], "package");
			tsUpdate.addNgModuleMeta({declare: "testDeclare", from: "package"});
			expect(requestImportSpy).toHaveBeenCalledWith(["testDeclare"], "package");
			tsUpdate.addNgModuleMeta({provide: "testProvide", from: "package"});
			expect(requestImportSpy).toHaveBeenCalledWith(["testProvide"], "package");
			//combine
			tsUpdate.addNgModuleMeta({import: "import1", declare: ["declare1", "declare2"], provide: "prov1", from: "package"});
			expect(requestImportSpy).toHaveBeenCalledWith(["import1", "declare1", "declare2", "prov1"], "package");
			done();
		});
	});

	it("Adds routes", async done => {
		spyOn(TypeScriptUtils, "getFileSource").and.returnValues(
			ts.createSourceFile("route-module.ts", `
				const routes: Routes = [
					{ existing }
				];
				const routes2: Routes = [];
			`, ts.ScriptTarget.Latest, true),
			{ getChildren: () => ["component1"] },
			{ getChildren: () => ["component2"] }
		);
		spyOn(fs, "writeFileSync");
		const formatSpy = spyOn(TypeScriptFileUpdate.prototype as any, "formatFile");
		spyOn(TypeScriptUtils, "getClassName").and.returnValues("Component1", "Component2");
		spyOn(TypeScriptUtils, "relativePath").and.returnValues("./to/component", "./to/component2");

		const tsUpdate = new TypeScriptFileUpdate("route-module.ts");
		tsUpdate.addRoute("path/to/component", "href", "text");
		expect(TypeScriptUtils.relativePath).toHaveBeenCalledWith("route-module.ts", "path/to/component", true, true);
		expect(TypeScriptUtils.getClassName).toHaveBeenCalledWith(["component1"]);
		expect(fs.writeFileSync).toHaveBeenCalledWith(
			"route-module.ts",
			jasmine.stringMatching(`import { Component1 } from "./to/component";\\s*` +
				`const routes: Routes = \\[\\s*` +
				`{ existing },\\s*` +
				`{ path: "href", component: Component1, data: { text: "text" } }\\s*` +
				`\\];\\s*` +
				`const routes2: Routes = \\[\\];`
			)
		);
		expect(formatSpy).toHaveBeenCalled();

		tsUpdate.addRoute("path/to/component2", "href2", "text2", "routes2");
		expect(TypeScriptUtils.relativePath).toHaveBeenCalledWith("route-module.ts", "path/to/component2", true, true);
		expect(TypeScriptUtils.getClassName).toHaveBeenCalledWith(["component2"]);
		expect(fs.writeFileSync).toHaveBeenCalledWith(
			"route-module.ts",
			jasmine.stringMatching(`import { Component1 } from "./to/component";\\s*` +
			`import { Component2 } from "./to/component2";\\s*` +
				`const routes: Routes = \\[\\s*` +
				`{ existing },\\s*` +
				`{ path: "href", component: Component1, data: { text: "text" } }\\s*` +
				`\\];\\s*` +
				`const routes2: Routes = \\[{ path: "href2", component: Component2, data: { text: "text2" } }\\];`
			)
		);
		expect(formatSpy).toHaveBeenCalledTimes(2);
		done();
	});

	it("Adds declaration creates NgModule edit", async done => {
		spyOn(TypeScriptUtils, "getFileSource").and.returnValues(
			ts.createSourceFile("app.module.ts", "", ts.ScriptTarget.Latest, true),
			{ getChildren: () => ["component1"] }
		);

		spyOn(TypeScriptUtils, "getClassName").and.returnValue("DeclareComponent");
		spyOn(TypeScriptUtils, "relativePath").and.returnValue("./to/component");
		const addMetaSpy = spyOn(TypeScriptFileUpdate.prototype, "addNgModuleMeta");

		const tsUpdate = new TypeScriptFileUpdate("app.module.ts");
		tsUpdate.addDeclaration("relative/path");
		expect(TypeScriptUtils.relativePath).toHaveBeenCalledWith("app.module.ts", "relative/path", true, true);
		expect(TypeScriptUtils.getClassName).toHaveBeenCalledWith(["component1"]);
		expect(addMetaSpy).toHaveBeenCalledWith({ declare: "DeclareComponent", from: "./to/component" });
		done();
	});

	describe("NgModule meta edits", () => {

		class TestTsFileUpdate extends TypeScriptFileUpdate {
			public formatFile() {
			}
			public requestImport(identifiers: string[], modulePath: string) {
				super.requestImport(identifiers, modulePath);
			}
		}

		it("Adds to imports and calls forRoot()", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", `
					import { Named } from "package";
					import { SomeModule } from "another/package";
					@NgModule({
						imports: [
							Named,
							SomeModule
						]
					})
					export class TestModule { }
				`, ts.ScriptTarget.Latest, true)
			);
			spyOn(fs, "writeFileSync");
			spyOn(TestTsFileUpdate.prototype, "formatFile");

			const tsUpdate = new TestTsFileUpdate("/test/file");
			tsUpdate.addNgModuleMeta({ import: "GridModule", from: "package" });
			tsUpdate.addNgModuleMeta({ import: "GridModule2", from: "another/package", root: true });
			tsUpdate.addNgModuleMeta({ import: "GridModule", from: "package" }); //duplicate, should be ignored
			tsUpdate.finalize();

			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/test/file",
				jasmine.stringMatching([`import { Named, GridModule } from "package";`,
					`import { SomeModule, GridModule2 } from "another/package";`,
					`@NgModule({`,
					`imports: [`,
						"Named,",
						"SomeModule,",
						"GridModule,",
						"GridModule2.forRoot()",
					"]",
					"})",
					"export class TestModule {", "}"
				].join("\\s*").replace(/([\[\]\(\)])/g, "\\$1"))
			);
			expect(TestTsFileUpdate.prototype.formatFile).toHaveBeenCalled();
			done();
		});

		it("Adds to declarations/imports/provides", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", `
					import { Named } from "package";
					import { SomeModule } from "another/package";
					@NgModule({
						imports: [
							SomeModule
						],
						declarations: [],
						providers: [ Service ]
					})
					export class TestModule { }
				`, ts.ScriptTarget.Latest, true)
			);
			spyOn(fs, "writeFileSync");
			spyOn(TestTsFileUpdate.prototype, "formatFile");

			const tsUpdate = new TestTsFileUpdate("/test/file");
			tsUpdate.addNgModuleMeta({ import: "Named", from: "package" }); //reuse import
			tsUpdate.addNgModuleMeta({ declare: "Component1", from: "another/package" });
			tsUpdate.addNgModuleMeta({ provide: "GridService", import: "Module1", declare:  [ "Component2" ] }); // no import
			tsUpdate.finalize();

			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/test/file",
				jasmine.stringMatching([`import { Named } from "package";`,
					`import { SomeModule, Component1 } from "another/package";`,
					`@NgModule({`,
					`imports: [`,
						"SomeModule,",
						"Named,",
						"Module1",
					"],",
					`declarations: [`,
						"Component1,",
						"Component2",
					"],",
					`providers: [`,
						"Service,",
						"GridService",
					"]",
					"})",
					"export class TestModule {", "}"
				].join("\\s*").replace(/([\[\]\(\)])/g, "\\$1"))
			);
			expect(TestTsFileUpdate.prototype.formatFile).toHaveBeenCalled();
			done();
		});

		it("Creates NgModule properties if not found", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", `
					@NgModule({
						declarations: [],
					})
					export class TestModule { }
				`, ts.ScriptTarget.Latest, true)
			);
			spyOn(fs, "writeFileSync");
			spyOn(TestTsFileUpdate.prototype, "formatFile");

			const tsUpdate = new TestTsFileUpdate("/test/file");
			tsUpdate.addNgModuleMeta({ import: "Named" });
			tsUpdate.addNgModuleMeta({ declare: "Component1" });
			tsUpdate.addNgModuleMeta({ provide: "GridService", import: "Module1", declare:  [ "Component2" ] });
			tsUpdate.finalize();

			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/test/file",
				jasmine.stringMatching([
					`@NgModule({`,
					`declarations: [`,
						"Component1,",
						"Component2",
					"],",
					`imports: [`,
						"Named,",
						"Module1",
					"],",
					`providers: [`,
						"GridService",
					"]",
					"})",
					"export class TestModule {", "}"
				].join("\\s*").replace(/([\[\]\(\)])/g, "\\$1"))
			);
			expect(TestTsFileUpdate.prototype.formatFile).toHaveBeenCalled();
			done();
		});

		it("Formats dependency properties", async done => {
			spyOn(TypeScriptUtils, "getFileSource").and.returnValue(
				ts.createSourceFile("/test/file", "", ts.ScriptTarget.Latest, true)
			);
			const utilFormatSpy = spyOn(Util, "applyConfigTransformation").and.callThrough();
			spyOn(TestTsFileUpdate.prototype, "requestImport");

			const configVariables = {
				"$(key)": "Replace",
				"$(key2)" : "Replace2",
				"$(key3)" : "Replace3",
				"__key4__": "replace4",
				"__key5__": "replace5"
			};
			const tsUpdate = new TestTsFileUpdate("/test/file");
			tsUpdate.addNgModuleMeta({ import: "$(key)", from: "package" }, configVariables);
			expect(TestTsFileUpdate.prototype.requestImport).toHaveBeenCalledWith(["Replace"], "package");
			// tslint:disable:object-literal-sort-keys
			tsUpdate.addNgModuleMeta({
				import: "$(key)Module",
				declare: ["$(key2)Component", "$(key3)Component"],
				from: "__key4__"
			}, configVariables);
			expect(TestTsFileUpdate.prototype.requestImport).toHaveBeenCalledWith(
				["ReplaceModule", "Replace2Component", "Replace3Component"], "replace4"
			);
			tsUpdate.addNgModuleMeta({
				import: [ "$(key)Module", "$(key2)Module"],
				declare: "$(key3)Component",
				provide: [ "$(key)Service" ],
				from: "./src/__key4__/__key5__.service"
			}, configVariables);
			expect(TestTsFileUpdate.prototype.requestImport).toHaveBeenCalledWith(
				["ReplaceModule", "Replace2Module", "Replace3Component", "ReplaceService"],
				"./src/replace4/replace5.service"
			);
			// tslint:enable:object-literal-sort-keys
			done();
		});
	});

	it("Formats on finalize, preserves empty lines", async done => {
		// process is in root folder!
		const unformattedSource = fs.readFileSync("spec/unit/ts-transform/unformatted.ts-template", "utf-8");
		const formattedSource = fs.readFileSync("spec/unit/ts-transform/formatted.ts-template", "utf-8");
		const writeSpy = spyOn(fs, "writeFileSync");

		const tsUpdate = new TypeScriptFileUpdate("spec/unit/ts-transform/unformatted.ts-template");
		tsUpdate.finalize();
		expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
		// expect(fs.writeFileSync).toHaveBeenCalledWith(
		// 	"unformatted.ts-template",
		// 	unformattedSource.replace(/  /g, "    ") //default printer spacing
		// );
		expect(writeSpy.calls.first().args[1]).toEqual(unformattedSource.replace(/  /g, "    "));
		// expect(fs.writeFileSync).toHaveBeenCalledWith(
		// 	"unformatted.ts-template",
		// 	formattedSource
		// );
		expect(writeSpy.calls.mostRecent().args[1]).toEqual(formattedSource);
		done();
	});

});