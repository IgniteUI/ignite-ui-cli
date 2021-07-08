
import { BaseComponent } from "@igniteui/cli-core";

class IgxAccordionComponent extends BaseComponent {
	/**
	 *
	 */
	constructor() {
		super(__dirname);
		this.name  = "Accordion";
		this.group = "Layouts";
		this.description = `allows users to navigate among multiple collapsible panels displayed in a single container`;
	}
}
module.exports = new IgxAccordionComponent();
