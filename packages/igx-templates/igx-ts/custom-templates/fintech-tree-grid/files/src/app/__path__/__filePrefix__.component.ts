import {
  Component,
  AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild, NgZone
} from '@angular/core';
import {
  AbsoluteScrollStrategy,
  ConnectedPositioningStrategy,
    GridSelectionMode,
  HorizontalAlignment,
  IgxButtonGroupComponent,
  IgxSliderComponent,
  IgxTreeGridComponent,
  OverlaySettings,
  PositionSettings,
  SortingDirection,
  VerticalAlignment
} from '<%=igxPackage%>';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { LocalDataService } from './localData.service';
import { ITreeGridAggregation } from './tree-grid-grouping.pipe';

@Component({
  providers: [LocalDataService],
  selector: 'app-<%=filePrefix%>',
  templateUrl: './<%=filePrefix%>.component.html',
  styleUrls: ['./<%=filePrefix%>.component.scss']
})
export class <%=ClassName%>Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('grid1', { static: true }) public grid1!: IgxTreeGridComponent;
  @ViewChild('buttonGroup1', { static: true }) public buttonGroup1!: IgxButtonGroupComponent;
  @ViewChild('slider1', { static: true }) public volumeSlider!: IgxSliderComponent;
  @ViewChild('slider2', { static: true }) public intervalSlider!: IgxSliderComponent;

  public showToolbar: boolean = true;
  public selectionMode: GridSelectionMode = 'multiple';
  public theme: boolean = false;
  public volume: number = 1000;
  public frequency: number = 500;
  public data: any[] = [];
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
    }
  ];
  public groupColumns = ['Category', 'Type', 'Contract'];
  public aggregations: ITreeGridAggregation[] = [
    {
      aggregate: (parent: any, data: any[]) => {
        return data.map((r) => r.Change).reduce((ty, u) => ty + u, 0);
      },
      field: 'Change'
    },
    {
      aggregate: (parent: any, data: any[]) => {
        return data.map((r) => r.Price).reduce((ty, u) => ty + u, 0);
      },
      field: 'Price'
    },
    {
      aggregate: (parent: any, data: any[]) => {
        return parent.Change / (parent.Price - parent.Change) * 100;
      },
      field: 'Change(%)'
    }
  ];
  public primaryKey = 'ID';
  public childDataKey = 'Children';
  public groupColumnKey = 'Categories';

  public items: any[] = [{field: 'Export native'}, { field: 'Export JS Excel'}];

  public positionSettings: PositionSettings = {
    horizontalDirection: HorizontalAlignment.Left,
    horizontalStartPoint: HorizontalAlignment.Right,
    verticalStartPoint: VerticalAlignment.Bottom
  };

  public overlaySettings: OverlaySettings = {
    closeOnOutsideClick: true,
    modal: false,
    positionStrategy: new ConnectedPositioningStrategy(this.positionSettings),
    scrollStrategy: new AbsoluteScrollStrategy()
  };

  private subscription: any;
  private selectedButton: number = -1;
  private timer: any;
  private volumeChanged: any;

  constructor(private zone: NgZone, private localService: LocalDataService, private elRef: ElementRef) {
    this.subscription = this.localService.getData(this.volume);
    this.localService.records.subscribe((d) => this.data = d);
  }

  public ngOnInit() {
    this.grid1.sortingExpressions = [{ fieldName: this.groupColumnKey, dir: SortingDirection.Desc }];
    this.volumeChanged = this.volumeSlider.valueChange.pipe(debounce(() => timer(200)));
    this.volumeChanged.subscribe(
      (x: any) => {
        this.localService.getData(this.volume);
      },
      (err: string) => console.log('Error: ' + err));
  }

  public ngAfterViewInit() {
    this.grid1.reflow();
  }
  public onButtonAction(event: any) {
    switch (event.index) {
      case 0: {
          this.disableOtherButtons(event.index, true);
          this.timer = setInterval(() => this.ticker(this.data), this.frequency);
          break;
        }
      case 1: {
          this.disableOtherButtons(event.index, true);
          this.timer = setInterval(() => this.tickerAllPrices(this.data), this.frequency);
          break;
        }
        case 2: {
          this.disableOtherButtons(event.index, false);
          this.stopFeed();
          break;
        }
      default:
        {
          break;
        }
    }
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
    return value ? value.toFixed(2) : '';
  }

  public percentage(value: number) {
    return value ? value.toFixed(2) + '%' : '';
  }

  public formatCurrency(value: number) {
    return value ? '$' + value.toFixed(3) : '';
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
        button.disabled = disableButtons;
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
    this.data = this.updateRandomPrices(data);
  }

  private tickerAllPrices(data: any) {
    this.updateAllPrices(data);
  }

  /**
   * Updates values in every record
   */
  private updateAllPrices(data: any[]): any {
    for (const dataRow of data) {
      this.randomizeObjectData(dataRow);
    }
    (this.grid1 as any).notifyChanges();
  }

  /**
   * Updates values in random number of records
   */
  private updateRandomPrices(data: any[]): any {
    const newData = data.slice();
    let y = 0;
    for (let i = Math.round(Math.random() * 10); i < newData.length; i += Math.round(Math.random() * 10)) {
      this.randomizeObjectData(newData[i]);
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
  }

  private generateNewPrice(oldPrice:number): any {
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
    const result = {Price: 0, ChangePercent: 0};
    changePercent = Math.round(changePercent * 100) / 100;
    result.Price = newPrice;
    result.ChangePercent = changePercent;

    return result;
  }

  get buttonSelected(): number {
    return this.selectedButton || this.selectedButton === 0 ? this.selectedButton : -1;
  }
}
