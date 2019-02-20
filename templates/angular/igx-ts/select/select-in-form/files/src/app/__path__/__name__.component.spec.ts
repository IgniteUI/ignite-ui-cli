import { FormsModule } from '@angular/forms';
import { async, TestBed, ComponentFixture } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

import { $(ClassName)Component } from "./$(filePrefix).component";
import { IgxSelectModule, IgxToggleModule } from "igniteui-angular";

describe("$(ClassName)Component", () => {
    let component: $(ClassName)Component;
    let fixture: ComponentFixture<$(ClassName)Component >;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [$(ClassName)Component],
            imports: [
                FormsModule,
                IgxSelectModule,
                IgxToggleModule,
                NoopAnimationsModule,
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent($(ClassName)Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
