import { spawnSync } from "child_process";
import * as fs from "fs-extra";
import cli = require("../../lib/cli");
describe("Help command", () => {

	it("should list all available commands", async done => {
		const child = spawnSync("node", ["bin/execute.js", "--help" ], {
			encoding: "utf-8"
		});
		const originalHelpText: string = `Commands:
			quickstart             A quick start for your project
			start                  start the project
			new <name>             Creating a new project
			build                  build the project
			test                   test the project
			add <template> <name>  Add component by it ID and providing a name.
		  Options:
			--help  Show help      [boolean]`;

		const replacedHelpText: string = originalHelpText.replace(/\s/g, "");
		const actualText: string = (child.stdout.toString("utf-8")).replace(/\s/g, "");

		expect(replacedHelpText).toEqual(actualText);
		done();
	});

	it("should show help for individual commands", async done => {
		const child = spawnSync("node", ["bin/execute.js", "new", "--help" ], {
			encoding: "utf-8"
		});
		const originalNewHelpText: string = `Options:
		--help	Show help	[boolean]
		--name, -n	Project name	[string] [default: "app"]
		--framework, -f	Framework to setup project for	[string] [choices: "angular", "jquery", "react"] [default: "jquery"]
		--theme, -t	Project theme	[string] [default: "infragistics"]`;

		const replacedNewHelpText: string = originalNewHelpText.replace(/\s/g, "");
		const actualNewText: string = (child.stdout.toString("utf-8")).replace(/\s/g, "");

		expect(actualNewText).toContain(replacedNewHelpText);
		done();
	});
});
