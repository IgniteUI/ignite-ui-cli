import { GoogleAnalytic } from "../GoogleAnalytic";
import { ProjectConfig } from "../ProjectConfig";
import { Util } from "../Util";

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

		GoogleAnalytic.post({
			t: "event",
			ec: "$ig test",
			ea: "user parameters",
			el: `e2e: ${argv.e2e};`
		});

		if (!ProjectConfig.hasLocalConfig()) {
			Util.error("Test command is supported only on existing project created with igniteui-cli", "red");
			return;
		}

		command.test(argv);
	},
	async test(argv) {
		const projConfig = ProjectConfig.getConfig().project;
		if (argv.e2e && projConfig.framework === "angular" && projConfig.projectType === "igx-ts") {
			Util.exec("npm run e2e", { stdio: "inherit" });
		} else {
			Util.exec("npm test", { stdio: "inherit" });
		}
	}
};
export default command;
