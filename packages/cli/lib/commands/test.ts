import { GoogleAnalytics, ProjectConfig, Util } from "@igniteui/cli-core";

const command = {
	// tslint:disable:object-literal-sort-keys
	command: "test",
	desc: "executes project tests",
	builder: {
		e2e: {
			describe: "Executes end-to-end tests",
			type: "boolean"
		}
	},
	async execute(argv) {

		GoogleAnalytics.post({
			t: "screenview",
			cd: "Test"
		});

		command.test(argv);
	},
	async test(argv) {

		if (!ProjectConfig.hasLocalConfig()) {
			Util.error("Test command is supported only on existing project created with igniteui-cli", "red");
			return;
		}

		const project = ProjectConfig.getConfig().project;

		if (!argv.skipAnalytics) {
			GoogleAnalytics.post({
				t: "event",
				ec: "$ig test",
				ea: `e2e: ${argv.e2e};`,
				cd1: project.framework,
				cd2: project.projectType,
				cd11: !!project.skipGit,
				cd14: project.theme
			});
		}

		if (argv.e2e && project.framework === "angular" && project.projectType === "igx-ts") {
			Util.execSync("npm run e2e", { stdio: "inherit" });
		} else {
			Util.execSync("npm test", { stdio: "inherit" });
		}
	}
};
export default command;
