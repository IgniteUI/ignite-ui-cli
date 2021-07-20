import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChild,
  ElementRef
} from '@angular/core';

import {
  CloseScrollStrategy,
  ConnectedPositioningStrategy,
  GridSelectionMode,
  HorizontalAlignment,
  IColumnExportingEventArgs,
  IgxColumnComponent,
  IgxDateSummaryOperand,
  IgxCsvExporterService,
  IgxExcelExporterService,
  IgxGridComponent,
  IgxNumberSummaryOperand,
  IgxSummaryResult,
  IgxToggleDirective,
  OverlaySettings,
  PositionSettings,
  VerticalAlignment} from '<%=igxPackage%>';
import { SparklineDisplayType } from 'igniteui-angular-charts';
import { data, DealsDescriptor, Employee } from './data';

@Component({
  selector: 'app-<%=filePrefix%>',
  templateUrl: './<%=filePrefix%>.component.html',
  styleUrls: ['./<%=filePrefix%>.component.scss']
})
export class <%=ClassName%>Component implements OnInit, AfterViewInit {

  @ViewChild('grid1', { read: IgxGridComponent, static: true })
  public grid1!: IgxGridComponent;

  @ViewChild('toggleRefHiding') public toggleRefHiding!: IgxToggleDirective;
  @ViewChild('toggleRefPinning') public toggleRefPinning!: IgxToggleDirective;

  @ViewChild('hidingButton') public hidingButton!: ElementRef;
  @ViewChild('pinningButton') public pinningButton!: ElementRef;

  public localData: Employee[] = [];
  public dealsSummary = DealsSummary;
  public earliestSummary = EarliestSummary;
  public soonSummary = SoonSummary;

  public cols!: QueryList<IgxColumnComponent>;
  public hiddenColsLength: number = 0;
  public pinnedColsLength: number = 0;

  public searchText = '';
  public caseSensitive = false;
  public selectionMode: GridSelectionMode = 'multiple';
  public displayType = SparklineDisplayType;

  public positionSettings: PositionSettings = {
    horizontalDirection: HorizontalAlignment.Left,
    horizontalStartPoint: HorizontalAlignment.Right,
    verticalStartPoint: VerticalAlignment.Bottom
  };

  public overlaySettings: OverlaySettings = {
    closeOnOutsideClick: true,
    modal: false,
    positionStrategy: new ConnectedPositioningStrategy(this.positionSettings),
    scrollStrategy: new CloseScrollStrategy()
  };

  constructor(
    private csvExporter: IgxCsvExporterService,
    private excelExporter: IgxExcelExporterService) {

    const exporterCb = (args: IColumnExportingEventArgs): void => {
      if (args.field === 'Deals') { args.cancel = true; }
    };

    this.excelExporter.columnExporting.subscribe(exporterCb);
    this.csvExporter.columnExporting.subscribe(exporterCb);
  }

  public ngOnInit(): void {
    const employees: Employee[] = data;
    for (const employee of employees) {
      this.getDeals(employee);
    }
    this.localData = employees;
  }

  public toggleHiding(): void {
    this.overlaySettings.target = this.hidingButton.nativeElement;
    this.toggleRefHiding.toggle(this.overlaySettings);
  }

  public togglePinning(): void {
    this.overlaySettings.target = this.pinningButton.nativeElement;
    this.toggleRefPinning.toggle(this.overlaySettings);
  }

  public ngAfterViewInit(): void {
    this.cols = this.grid1.columnList;
    this.hiddenColsLength = this.cols.filter((col) => col.hidden).length;
    this.pinnedColsLength = this.cols.filter((col) => col.pinned).length;
  }

  public toggleVisibility(col: IgxColumnComponent): void {
    if (col.hidden) {
      this.hiddenColsLength--;
    } else {
      this.hiddenColsLength++;
    }
    col.hidden = !col.hidden;
  }

  public togglePin(col: IgxColumnComponent, evt: any): void {
    if (col.pinned) {
      this.grid1.unpinColumn(col.field);
      this.pinnedColsLength--;
    } else {
      if (this.grid1.pinColumn(col.field)) {
        this.pinnedColsLength++;
      } else {
        // if pinning fails uncheck the checkbox
        evt.checkbox.checked = false;
      }
    }
  }
  
  public formatDate(val: Date) {
    return new Intl.DateTimeFormat('en-US').format(val);
  }

  public searchKeyDown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' || ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
      ev.preventDefault();
      this.grid1.findNext(this.searchText, this.caseSensitive);
    } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
      ev.preventDefault();
      this.grid1.findPrev(this.searchText, this.caseSensitive);
    }
  }

  public updateSearch(): void {
    this.caseSensitive = !this.caseSensitive;
    this.grid1.findNext(this.searchText, this.caseSensitive);
  }

  public clearSearch(): void {
    this.searchText = '';
    this.grid1.clearSearch();
  }

  public formatValue(val: any): string {
    return val.toLocaleString('en-us', { maximumFractionDigits: 2 });
  }

  public getDeals(employee: Employee): void {
    employee.deals = this.getDealsData();
  }

  public getDealsData(months?: number): DealsDescriptor[] {
    if (months === undefined) {
      months = 12;
    }
    const deals: DealsDescriptor[] = [];
    for (let m = 0; m < months; m++) {
      const value = this.getRandomNumber(-20, 30);
      deals.push({ Deals: value, Month: m });
    }
    return deals;
  }

  public getRandomNumber(min: number, max: number): number {
    return Math.round(min + Math.random() * (max - min));
  }
}

class DealsSummary extends IgxNumberSummaryOperand {
  constructor() {
    super();
  }

  public operate(summaries?: any[]): IgxSummaryResult[] {
    const result = super.operate(summaries).filter((obj) => {
      if (obj.key === 'average' || obj.key === 'sum') {
        const summaryResult = obj.summaryResult;
        // apply formatting to float numbers
        if (Number(summaryResult) === summaryResult) {
          obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
        }
        return obj;
      }
    });
    return result;
  }
}

function formatDate(val: Date) {
    return new Intl.DateTimeFormat('en-US').format(val);
}

class EarliestSummary extends IgxDateSummaryOperand {
  constructor() {
    super();
  }

  public operate(summaries?: any[]): IgxSummaryResult[] {
    const result = super.operate(summaries).filter((obj) => {
      if (obj.key === 'earliest') {
        obj.summaryResult = formatDate(obj.summaryResult);
        return obj;
      }
    });
    return result;
  }
}

class SoonSummary extends IgxDateSummaryOperand {
  constructor() {
    super();
  }

  public operate(summaries?: any[]): IgxSummaryResult[] {
    const result = super.operate(summaries).filter((obj) => {
      if (obj.key === 'latest') {
        obj.label = 'Soon';
        obj.summaryResult = formatDate(obj.summaryResult);
        return obj;
      }
    });
    return result;
  }
}
