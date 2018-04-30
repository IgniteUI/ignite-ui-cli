import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { $(ClassName)Component } from './$(filePrefix).component';
import { IgxTimePickerModule } from 'igniteui-angular/main';

describe('$(ClassName)Component', () => {
  let component: $(ClassName)Component;
  let fixture: ComponentFixture<$(ClassName)Component>;
  const date: Date = new Date();
  const hours: number = date.getHours();
  const minutes: number =  date.getMinutes();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [$(ClassName)Component],
      imports: [IgxTimePickerModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent($(ClassName)Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('time is correct', () => {
    expect(component.date.getHours() === hours);
    expect(component.date.getMinutes() === minutes);
  });
});