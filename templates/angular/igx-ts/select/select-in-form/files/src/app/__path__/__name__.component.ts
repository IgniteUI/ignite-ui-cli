import { Component, ViewChild } from '@angular/core';
import { IgxSelectComponent, IgxToastPosition, IgxToastComponent } from 'igniteui-angular';

@Component({
    selector: 'app-$(filePrefix)',
    styleUrls: ['$(filePrefix).component.scss'],
    templateUrl: '$(filePrefix).component.html'
})
export class $(ClassName)Component {
    @ViewChild(IgxSelectComponent)
    public igxSelect: IgxSelectComponent;

    @ViewChild(IgxToastComponent)
    public output: IgxToastComponent;

    public items: string[] = ['Orange', 'Apple', 'Banana', 'Mango'];
    public value: string;
    public outputPosition = IgxToastPosition.Bottom;

    public onSubmit() {
        this.value = this.igxSelect.value;
        this.output.show();
    }

    public handleSelection(event) {
        this.value = event.newSelection.value;
    }
}
