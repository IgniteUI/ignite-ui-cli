import { IgniteUIForAngularTemplate } from "../../../IgniteUIForAngularTemplate";

class IgxHierarchicalGridTemplate extends IgniteUIForAngularTemplate {
	constructor() {
		super(__dirname);
		this.components = ["Hierarchical Grid With Batch Editing"];
		this.controlGroup = "Grids & Lists";
		this.listInComponentTemplates = true;
		this.id = "hierarchical-grid-batch-editing";
		this.projectType = "igx-ts";
		this.name = "Hierarchical Grid With Batch Editing";
		this.description = "IgxHierarchicalGrid with batch editing";
		this.dependencies = [
			{
				import: ["IgxGridModule", "IgxHierarchicalGridModule", "IgxDialogModule"],
				from: "<%=igxPackage%>"
			},
			{
				declare: ["HierarchicalGridWithTransactionsComponent"],
				from: "./src/app/<%=path%>/<%=filePrefix%>-transactions.component.ts"
			}
		];
	}
}
module.exports = new IgxHierarchicalGridTemplate();
