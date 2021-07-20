import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  GridSelectionMode,
  DefaultSortingStrategy,
  IDialogEventArgs,
  IgxButtonGroupComponent,
  IgxDialogComponent,
  IgxGridCellComponent,
  IgxGridComponent,
  IgxSliderComponent,
  SortingDirection,
  IGridKeydownEventArgs,
  IRowSelectionEventArgs
} from '<%=igxPackage%>';
import { CategoryChartType, IgxCategoryChartComponent } from 'igniteui-angular-charts';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { Contract, REGIONS } from './localData/financialData';
import { LocalDataService } from './localData.service';

@Component({
  providers: [LocalDataService],
  selector: 'app-<%=filePrefix%>',
  templateUrl: './<%=filePrefix%>.component.html',
  styleUrls: ['./<%=filePrefix%>.component.scss']
})
export class <%=ClassName%>Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('grid1', { static: true }) public grid1!: IgxGridComponent;
  @ViewChild('buttonGroup1', { static: true }) public buttonGroup1!: IgxButtonGroupComponent;
  @ViewChild('buttonGroup2', { static: true }) public buttonGroup2!: IgxButtonGroupComponent;
  @ViewChild('slider1', { static: true }) public volumeSlider!: IgxSliderComponent;
  @ViewChild('slider2', { static: true }) public intervalSlider!: IgxSliderComponent;
  @ViewChild('chart1', { static: true }) public chart1!: IgxCategoryChartComponent;
  @ViewChild('dialog', { static: true }) public dialog!: IgxDialogComponent;

  public showToolbar: boolean = false;
  public properties: string[] = [];
  public selectionMode: GridSelectionMode = 'multiple';
  public chartType = CategoryChartType;
  public theme: boolean = false;
  public volume: number = 1000;
  public frequency: number = 500;
  public data: any[] = [];
  public chartData: any[] = [];
  public multiCellSelection: { data: any[] } = { data: [] };
  public controls = [
    {
      disabled: false,
      icon: 'update',
      label: 'LIVE PRICES',
      selected: false
    },
    {
      disabled: false,
      icon: 'update',
      label: 'LIVE ALL PRICES',
      selected: false
    },
    {
      disabled: true,
      icon: 'stop',
      label: 'Stop',
      selected: false
    },
    {
      disabled: false,
      icon: 'insert_chart_outlined',
      label: 'Chart',
      selected: false
    }
  ];

  public contracts = Contract;
  public regions = REGIONS;
  private subscription: any;
  private selectedButton: number = -1;
  private timer: any;
  private volumeChanged: any;
  constructor(private localService: LocalDataService, private elRef: ElementRef) {
    this.subscription = this.localService.getData(this.volume);
    this.localService.records.subscribe(x => { this.data = x; });
  }

  public ngOnInit() {
    this.grid1.groupingExpressions = [{
      dir: SortingDirection.Desc,
      fieldName: 'Category',
      ignoreCase: false,
      strategy: DefaultSortingStrategy.instance()
    },
    {
      dir: SortingDirection.Desc,
      fieldName: 'Type',
      ignoreCase: false,
      strategy: DefaultSortingStrategy.instance()
    },
    {
      dir: SortingDirection.Desc,
      fieldName: 'Settlement',
      ignoreCase: false,
      strategy: DefaultSortingStrategy.instance()
    }
    ];
    this.volumeChanged = this.volumeSlider.valueChange.pipe(debounce(() => timer(200)));
    this.volumeChanged.subscribe(
      (x: any) => {
        this.localService.getData(this.volume);
      },
      (err: string) => console.log('Error: ' + err));
  }

  public ngAfterViewInit() {
    this.grid1.hideGroupedColumns = true;
    this.grid1.reflow();
    this.selectFirstGroupAndFillChart();
  }

  public selectFirstGroupAndFillChart() {
    this.properties = ['Price', 'Country'];
    this.setChartConfig('Countries', 'Prices (USD)', 'Data Chart with prices by Category and Country');

    if (this.grid1.groupsRecords[0].groups && this.grid1.groupsRecords[0]?.groups[0]?.groups) {
        const recordsToBeSelected = this.grid1.selectionService.getRowIDs(this.grid1.groupsRecords[0].groups[0].groups[0].records);
        recordsToBeSelected.forEach(item => {
          this.grid1.selectionService.selectRowById(item, false, true);
        });
      }
  }

  public setChartConfig(xAsis: string, yAxis: string, title: string) {
    // update label interval and angle based on data
    this.setLabelIntervalAndAngle();

    this.chart1.xAxisTitle = xAsis;
    this.chart1.yAxisTitle = yAxis;
    this.chart1.chartTitle = title;
  }

  public onButtonAction(event: any) {
    switch (event.index) {
      case 0: {
        this.disableOtherButtons(event.index, true);
        const currData = this.grid1.data;
        this.timer = setInterval(() => this.ticker(currData), this.frequency);
        break;
      }
      case 1: {
        this.disableOtherButtons(event.index, true);
        const currData = this.grid1.data;
        this.timer = setInterval(() => this.tickerAllPrices(currData), this.frequency);
        break;
      }
      case 2: {
        this.disableOtherButtons(event.index, false);
        this.stopFeed();
        break;
      }
      case 3: {
        this.disableOtherButtons(event.index, true);
        this.dialog.open();
        break;
      }
      default:
        {
          break;
        }
    }
  }

  public onCloseHandler(evt: IDialogEventArgs) {
    this.buttonGroup1.selectButton(2);
    if (this.grid1.navigation.activeNode) {
      if (this.grid1.navigation.activeNode.row === -1) {
        this.grid1.theadRow.nativeElement.focus();
      } else {
        this.grid1.tbody.nativeElement.focus();
      }
    }
  }

  public closeDialog(evt: any) {
    if (this.dialog.isOpen &&
      evt.shiftKey === true && evt.ctrlKey === true && evt.key.toLowerCase() === 'd') {
      evt.preventDefault();
      this.dialog.close();
    }
  }

  public onChange(event: any) {
    if (this.grid1.groupingExpressions.length > 0) {
      this.grid1.groupingExpressions = [];
    } else {
      this.grid1.groupingExpressions = [{
        dir: SortingDirection.Desc,
        fieldName: 'Category',
        ignoreCase: false,
        strategy: DefaultSortingStrategy.instance()
      },
      {
        dir: SortingDirection.Desc,
        fieldName: 'Type',
        ignoreCase: false,
        strategy: DefaultSortingStrategy.instance()
      },
      {
        dir: SortingDirection.Desc,
        fieldName: 'Contract',
        ignoreCase: false,
        strategy: DefaultSortingStrategy.instance()
      }
      ];
    }
  }

  public rowSelectionChanged(args: IRowSelectionEventArgs) {
    this.grid1.clearCellSelection();
    this.chartData = [];
    args.newSelection.forEach(row => {
        if (this.grid1.data) {
            this.chartData.push(this.grid1.data[row]);
            this.chart1.notifyInsertItem(this.chartData, this.chartData.length - 1,
              this.grid1.data[row]);
        }
    });
    this.setLabelIntervalAndAngle();
    this.setChartConfig('Countries', 'Prices (USD)', 'Data Chart with prices by Category and Country');
  }

  public openSingleRowChart(cell: IgxGridCellComponent) {
    this.chartData = [];
    setTimeout(() => {
      this.chartData = this.data.filter(item => item.Region === cell.rowData.Region &&
        item.Category === cell.rowData.Category);

      this.chart1.notifyInsertItem(this.chartData, this.chartData.length - 1, {});

      this.setLabelIntervalAndAngle();
      this.chart1.chartTitle = 'Data Chart with prices of ' + this.chartData[0].Category + ' in ' +
        this.chartData[0].Region + ' Region';

      this.dialog.open();
    }, 200);
  }

  public stopFeed() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public formatNumber(value: number) {
    return value.toFixed(2);
  }

  public percentage(value: number) {
    return value.toFixed(2) + '%';
  }

  public formatCurrency(value: number) {
    return '$' + value.toFixed(3);
  }

  /**
   * the below code is needed when accessing the sample through the navigation
   * it will style all the space below the sample component element, but not the navigation menu
   */
  public onThemeChanged(event: any) {
    const parentEl = this.parentComponentEl();
    if (event.checked && parentEl.classList.contains('main')) {
      parentEl.classList.add('fin-dark-theme');
    } else {
      parentEl.classList.remove('fin-dark-theme');
    }
  }

  public ngOnDestroy() {
    this.stopFeed();
    this.volumeChanged.unsubscribe();
  }

  public toggleToolbar() {
    this.showToolbar = !this.showToolbar;
  }

  private negative = (rowData: any): boolean => {
    return rowData['Change(%)'] < 0;
  }
  private positive = (rowData: any): boolean => {
    return rowData['Change(%)'] > 0;
  }
  private changeNegative = (rowData: any): boolean => {
    return rowData['Change(%)'] < 0 && rowData['Change(%)'] > -1;
  }
  private changePositive = (rowData: any): boolean => {
    return rowData['Change(%)'] > 0 && rowData['Change(%)'] < 1;
  }
  private strongPositive = (rowData: any): boolean => {
    return rowData['Change(%)'] >= 1;
  }
  private strongNegative = (rowData: any, key: string): boolean => {
    return rowData['Change(%)'] <= -1;
  }

  // tslint:disable:member-ordering
  public trends = {
    changeNeg: this.changeNegative,
    changePos: this.changePositive,
    negative: this.negative,
    positive: this.positive,
    strongNegative: this.strongNegative,
    strongPositive: this.strongPositive
  };

  public trendsChange = {
    changeNeg2: this.changeNegative,
    changePos2: this.changePositive,
    strongNegative2: this.strongNegative,
    strongPositive2: this.strongPositive
  };

  public setLabelIntervalAndAngle() {
    const intervalSet = this.chartData.length;
    if (intervalSet < 10) {
      this.chart1.xAxisLabelAngle = 0;
      this.chart1.xAxisInterval = 1;
    } else if (intervalSet < 15) {
      this.chart1.xAxisLabelAngle = 30;
      this.chart1.xAxisInterval = 1;
    } else if (intervalSet < 40) {
      this.chart1.xAxisLabelAngle = 90;
      this.chart1.xAxisInterval = 1;
    } else if (intervalSet < 100) {
      this.chart1.xAxisLabelAngle = 90;
      this.chart1.xAxisInterval = 3;
    } else if (intervalSet < 200) {
      this.chart1.xAxisLabelAngle = 90;
      this.chart1.xAxisInterval = 5;
    } else if (intervalSet < 400) {
      this.chart1.xAxisLabelAngle = 90;
      this.chart1.xAxisInterval = 7;
    } else if (intervalSet > 400) {
      this.chart1.xAxisLabelAngle = 90;
      this.chart1.xAxisInterval = 10;
    }
    this.chart1.yAxisAbbreviateLargeNumbers = true;
  }

  public gridKeydown(evt: any) {
    if (this.grid1.selectedRows.length > 0 &&
      evt.shiftKey === true && evt.ctrlKey === true && evt.key.toLowerCase() === 'd') {
      evt.preventDefault();
      this.dialog.open();
    }
  }

  public customKeydown(args: IGridKeydownEventArgs) {
    const target: IgxGridCellComponent = args.target as IgxGridCellComponent;
    const evt: KeyboardEvent = args.event as KeyboardEvent;
    const type = args.targetType;

    if (type === 'dataCell' && target.column.field === 'Chart' && evt.key.toLowerCase() === 'enter') {
      this.grid1.selectRows([target.row.rowID], true);
      this.openSingleRowChart(target);
    }
  }

  // tslint:enable:member-ordering

  private disableOtherButtons(ind: number, disableButtons: boolean) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.volumeSlider.disabled = disableButtons;
    this.intervalSlider.disabled = disableButtons;
    this.selectedButton = ind;
    this.buttonGroup1.buttons.forEach((button, index) => {
      if (index === 2) { button.disabled = !disableButtons; } else {
        this.buttonGroup1.buttons[0].disabled = disableButtons;
        this.buttonGroup1.buttons[1].disabled = disableButtons;
      }
    });
  }

  /**
   * returns the main div container of the Index Component,
   * if path is /samples/sample-url, or the appRoot, if path is /sample-url
   */
  private parentComponentEl() {
    return this.elRef.nativeElement.parentElement.parentElement;
  }

  private ticker(data: any) {
    this.grid1.data = this.updateRandomPrices(data);
  }

  private tickerAllPrices(data: any) {
    this.grid1.data = this.updateAllPrices(data);
  }

  /**
   * Updates values in every record
   */
  private updateAllPrices(data: any[]): any[] {
    const newData = [];
    for (const dataRow of data) {
      newData.push(this.randomizeObjectData(dataRow));
    }
    return newData;
  }

  /**
   * Updates values in random number of records
   */
  private updateRandomPrices(data: any[]): any {
    const newData = data.slice();
    for (let i = Math.round(Math.random() * 10), y = 0; i < data.length; i += Math.round(Math.random() * 10)) {
      newData[i] = this.randomizeObjectData(data[i]);
      y++;
    }
    return newData;
  }

  /**
   * Generates ne values for Change, Price and ChangeP columns
   */
  private randomizeObjectData(dataObj: any) {
    const changeP = 'Change(%)';
    const res = this.generateNewPrice(dataObj.Price);
    dataObj.Change = res.Price - dataObj.Price;
    dataObj.Price = res.Price;
    dataObj[changeP] = res.ChangePercent;
    return {...dataObj};
  }

  private generateNewPrice(oldPrice: number): any {
    let rnd = Math.random();
    rnd = Math.round(rnd * 100) / 100;
    const volatility = 2;
    let newPrice = 0;
    let changePercent = 2 * volatility * rnd;
    if (changePercent > volatility) {
      changePercent -= (2 * volatility);
    }
    const changeAmount = oldPrice * (changePercent / 100);
    newPrice = oldPrice + changeAmount;
    newPrice = Math.round(newPrice * 100) / 100;
    const result = { Price: 0, ChangePercent: 0 };
    changePercent = Math.round(changePercent * 100) / 100;
    result.Price = newPrice;
    result.ChangePercent = changePercent;

    return result;
  }

  get grouped(): boolean {
    return this.grid1.groupingExpressions.length > 0;
  }

  get buttonSelected(): number {
    return this.selectedButton || this.selectedButton === 0 ? this.selectedButton : -1;
  }
}
