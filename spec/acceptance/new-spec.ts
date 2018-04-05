import * as fs from "fs";
import cli = require("../../lib/cli");
import { GoogleAnalytic } from "../../lib/GoogleAnalytic";
import { Util } from "../../lib/Util";
import { deleteAll, filesDiff, resetSpy } from "../helpers/utils";

describe("New command", () => {
	beforeEach(() => {
		spyOn(console, "log");
		spyOn(console, "error");
		spyOn(GoogleAnalytic, "post");
		process.chdir("./output");
	});

	afterEach(() => {
		// clean test folder:
		deleteAll(this.testFolder);
		fs.rmdirSync(this.testFolder);
		process.chdir("../");
	});

	it("Creates jQuery project", async done => {

		await cli.run(["new", "jQuery Proj", "--framework=jquery"]);

		expect(fs.existsSync("./jQuery Proj")).toBeTruthy();
		expect(filesDiff("../templates/jquery/js/projects/empty/files", "./React Proj")).toEqual([]);
		const packageText = fs.readFileSync("./jQuery Proj/package.json", "utf-8");
		expect(JSON.parse(packageText).name).toEqual("jquery-proj");
		expect(fs.existsSync("./jQuery Proj/.gitignore")).toBeTruthy();
		this.testFolder = "./jQuery Proj";

		expect(GoogleAnalytic.post).toHaveBeenCalledWith({cd: "$ig new", t: "screenview"});
		expect(GoogleAnalytic.post).toHaveBeenCalledWith(
			{
				t: "event",
				// tslint:disable-next-line:object-literal-sort-keys
				ec: "$ig new",
				ea: "user parameters",
				el: "project name: jQuery Proj; framework: jquery; project type: undefined; theme: undefined; skip-git: false"
			});
		expect(GoogleAnalytic.post).toHaveBeenCalledTimes(2);

		done();
	});

	it("Creates React project", async done => {
		// process.argv = ["new", "reactProj", "--framework=react"];

		await cli.run(["new", "React Proj", "--framework=react"]);

		expect(fs.existsSync("./React Proj")).toBeTruthy();
		expect(filesDiff("../templates/react/es6/projects/empty/files", "./React Proj")).toEqual([]);
		const packageText = fs.readFileSync("./React Proj/package.json", "utf-8");
		expect(JSON.parse(packageText).name).toEqual("react-proj");
		expect(fs.existsSync("./React Proj/.gitignore")).toBeTruthy();
		this.testFolder = "./React Proj";
		done();
	});

	it("Creates Angular project", async done => {
		// process.argv = ["new", "reactProj", "--framework=react"];

		await cli.run(["new", "ngx Proj", "--framework=angular", "--type=igx-ts"]);

		expect(fs.existsSync("./ngx Proj")).toBeTruthy();
		expect(filesDiff("../templates/angular/ig-ts/projects/empty/files", "./ngx Proj")).toEqual([]);
		const packageText = fs.readFileSync("./ngx Proj/package.json", "utf-8");
		expect(JSON.parse(packageText).name).toEqual("ngx-proj");
		expect(fs.existsSync("./ngx Proj/.gitignore")).toBeTruthy();
		this.testFolder = "./ngx Proj";
		done();
	});

	it("Creates Ignite UI for Angular project", async done => {

		await cli.run(["new", "Ignite UI for Angular", "--framework=angular", "--type=igx-ts"]);

		expect(fs.existsSync("./Ignite UI for Angular")).toBeTruthy();
		expect(filesDiff("../templates/angular/igx-ts/projects/empty/files", "./Ignite UI for Angular")).toEqual([]);
		const packageText = fs.readFileSync("./Ignite UI for Angular/package.json", "utf-8");
		expect(JSON.parse(packageText).name).toEqual("ignite-ui-for-angular");
		expect(fs.existsSync("./Ignite UI for Angular/.gitignore")).toBeTruthy();
		this.testFolder = "./Ignite UI for Angular";
		done();
	});

	it("Should not work on existing folders", async done => {
		fs.mkdirSync("testProj");
		await cli.run(["new", "testProj"]);
		expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(/Folder "testProj" already exists!/));
		expect(GoogleAnalytic.post).toHaveBeenCalledWith({cd: "$ig new", t: "screenview"});
		expect(GoogleAnalytic.post).toHaveBeenCalledWith(
			{
				t: "event",
				// tslint:disable-next-line:object-literal-sort-keys
				ec: "$ig new",
				ea: "user parameters",
				el: "project name: testProj; framework: jquery; project type: undefined; theme: undefined; skip-git: false"
			});
		expect(GoogleAnalytic.post).toHaveBeenCalledWith(
			{
				cd: "error: Folder \"testProj\" already exists!",
				t: "screenview"
			});
		expect(GoogleAnalytic.post).toHaveBeenCalledTimes(3);
		fs.rmdirSync("testProj");

		await cli.run(["new", "testProj2"]);
		expect(fs.existsSync("./testProj2")).toBeTruthy();
		expect(fs.existsSync("./testProj2/ignite-cli-views.js")).toBeTruthy();

		fs.writeFileSync("./testProj2/ignite-cli-views.js", "text");
		await cli.run(["new", "testProj2"]);
		expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(/Folder "testProj2" already exists!/));
		expect(fs.readFileSync("./testProj2/ignite-cli-views.js").toString())
			.toEqual("text", "Shouldn't overwrite existing project files!");

		resetSpy(console.error);
		await cli.run(["new", "   testProj2  \t  "]);
		expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(/Folder "testProj2" already exists!/));
		expect(fs.readFileSync("./testProj2/ignite-cli-views.js").toString())
			.toEqual("text", "Shouldn't overwrite existing project files!");

		this.testFolder = "./testProj2";
		done();
	});

	it("Git Status", async done => {
		const projectName = "angularProj";
		await cli.run(["new", projectName, "--framework=angular", "--type=igx-ts"]);

		process.chdir(projectName);
		expect(fs.existsSync(".git")).toBeTruthy();
		expect(Util.exec("git log -1 --pretty=format:'%s'").toString())
			.toMatch("Initial commit for project: " + projectName);
		process.chdir("../");
		this.testFolder = "./angularProj";
		done();
	});

	it("Skip Git with command option", async done => {
		const projectName = "angularProj";
		await cli.run(["new", projectName, "--framework=angular", "--type=igx-ts", "--skip-git"]);

		expect(fs.existsSync("./" + projectName + "/.git")).not.toBeTruthy();
		done();
	});

	it("Creates project with single word name", async done => {
		const projectName = "a";
		await cli.run(["new", projectName, "--framework=jquery"]);

		//TODO: read entire structure from ./templates and verify everything is copied over
		expect(fs.existsSync("./a")).toBeTruthy();

		this.testFolder = "./a";
		done();
	});
});
