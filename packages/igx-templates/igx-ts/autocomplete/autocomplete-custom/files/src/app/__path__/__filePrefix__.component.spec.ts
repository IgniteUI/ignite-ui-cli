import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { <%=ClassName%>Component, <%=ClassName%>PipeStartsWith } from './<%=filePrefix%>.component';
import { IgxDropDownModule, IgxAutocompleteModule, IgxInputGroupModule } from '<%=igxPackage%>';
import { FormsModule } from '@angular/forms';

describe('<%=ClassName%>Component', () => {
    let component: <%=ClassName%>Component;
    let fixture: ComponentFixture<<%=ClassName%>Component>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [<%=ClassName%>Component, <%=ClassName%>PipeStartsWith],
            imports: [FormsModule, IgxDropDownModule, IgxAutocompleteModule, NoopAnimationsModule, IgxInputGroupModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(<%=ClassName%>Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
