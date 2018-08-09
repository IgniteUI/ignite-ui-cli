
import { BaseComponent } from "../../../../lib/BaseComponent";

class IgxGridComponent extends BaseComponent {
	/**
	 *
	 */
	constructor() {
		super(__dirname);
		this.name  = "Grid";
		this.group = "Grids & Lists";
		this.description = "pick from Grids: Basic or Custom";
	}
}
module.exports = new IgxGridComponent();
