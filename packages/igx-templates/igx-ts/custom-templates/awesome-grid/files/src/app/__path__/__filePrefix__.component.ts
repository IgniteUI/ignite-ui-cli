import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  Inject,
  ElementRef,
  AfterViewInit
  } from '@angular/core';
import {
  IgxGridComponent,
  IgxNumberSummaryOperand,
  IgxStringFilteringOperand,
  IgxSummaryResult,
  IgxGridCellComponent,
  OverlaySettings,
  IgxOverlayService,
  AbsolutePosition,
  OverlayClosingEventArgs
  } from '<%=igxPackage%>';
import { SparklineDisplayType } from 'igniteui-angular-charts';
import { Athlete, AthletesData, SpeedDescriptor } from './services/data';

@Component({
selector: 'app-<%=filePrefix%>',
templateUrl: './<%=filePrefix%>.component.html',
styleUrls: ['./<%=filePrefix%>.component.scss']
})
export class <%=ClassName%>Component implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1!: IgxGridComponent;

    @ViewChild('winnerAlert', { static: true })
    public winnerAlert!: ElementRef;

    @ViewChild('finishedAlert', { static: true })
    public finishedAlert!: ElementRef;

    public displayType = SparklineDisplayType;
    public topSpeedSummary = CustomTopSpeedSummary;
    public bnpSummary = CustomBPMSummary;
    public speedSummary = CustomSpeedSummary;
    public localData: Athlete[] = [];
    public isFinished = false;
    public hasWinner = false;
    public athleteColumnWidth = '30%';
    public showOverlay = false;
    public overlaySettings!: OverlaySettings;
    public winner: Athlete = { Avatar: '', Name: '' } as Athlete;
    public top3: Athlete[] = [];
    private _live: boolean = true;
    private _timer: any;
    private windowWidth: any;
    private _overlayId: string = '';

    get live(): boolean {
      return this._live;
    }
  
    set live(val: boolean) {
      this._live = val;
      if (this._live) {
        this._timer = setInterval(() => this.ticker(), 1500);
      } else {
        clearInterval(this._timer);
      }
    }
  
    get showWinnerOverlay(): boolean {
      return this.showOverlay && this.hasWinner && !this.isFinished;
    }
  
    get showFinishedOverlay(): boolean {
      return this.showOverlay && this.isFinished;
    }
  
    get hideAthleteNumber(): boolean {
      return this.windowWidth && this.windowWidth < 960;
    }
    get hideBeatsPerMinute(): boolean {
      return (this.windowWidth && this.windowWidth < 860) || !this.live;
    }
  
    constructor(@Inject(IgxOverlayService) public overlayService: IgxOverlayService) { }
    public ngOnInit(): void {
      this.localData = AthletesData.slice(0, 30).sort((a, b) => b.TrackProgress - a.TrackProgress);
      this.localData.forEach(rec => this.getSpeed(rec));
      this.windowWidth = window.innerWidth;
      this._timer = setInterval(() => this.ticker(), 1500);
      this.overlayService.onClosing.subscribe((event: OverlayClosingEventArgs) => {
        this.showOverlay = false;
      });
    }
  
    public ngAfterViewInit(): void {
      this.overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(
        AbsolutePosition.Center,
        this.grid1
      );
      this.overlaySettings.modal = true;
    }
  
    public getValue(cell: IgxGridCellComponent): number {
      const val = cell.value;
      return val;
    }
    public ngOnDestroy(): void {
      clearInterval(this._timer);
    }
  
    public isTop3(cell: IgxGridCellComponent): boolean {
      const top = this.grid1.page === 0 && cell.row.index < 4;
      return top;
    }
  
    public getTrophyUrl(index: number): string {
      if (index === 0) {
        return 'assets/images/trophy_gold.svg';
      }
      if (index === 1) {
        return 'assets/images/trophy_silver.svg';
      }
      if (index === 2) {
        return 'assets/images/trophy_bronze.svg';
      }
      return '';
    }
  
    public getIconType(cell: IgxGridCellComponent): string {
      switch (cell.row.rowData.Position) {
        case 'current':
          return 'arrow_forward';
        case 'down':
          return 'arrow_downward';
        case 'up':
        default:
          return 'arrow_upward';
      }
    }
  
    public getBadgeType(cell: IgxGridCellComponent): string {
      switch (cell.row.rowData.Position) {
        case 'current':
          return 'warning';
        case 'down':
          return 'error';
        case 'up':
        default:
          return 'success';
      }
    }
  
    public getSpeed(athlete: Athlete): void {
      athlete['Speed'] = this.addSpeedeData(athlete, 40);
    }
  
    public getSpeedeData(minutes?: number): SpeedDescriptor[] {
      if (minutes === undefined) {
        minutes = 20;
      }
      const speed: SpeedDescriptor[] = [];
      for (let m = 0; m < minutes; m += 3) {
        const value = this.getRandomNumber(17, 20);
        speed.push({ Speed: value, Minute: m });
      }
      return speed;
    }
  
    public addSpeedData(athlete: Athlete, minutes?: number): SpeedDescriptor[] {
      if (minutes === undefined) {
        minutes = 20;
      }
      const speedCollection = athlete.Speed ? athlete.Speed : [];
      for (let m = 3; m <= minutes; m += 3) {
        const value = this.getRandomNumber(16, 20);
        const speed = speedCollection[speedCollection.length - 1];
        const min = speed && speed.Minute ? speed.Minute + m : m;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        speedCollection.push({ Speed: value, Minute: min });
        if (speedCollection.length === 40) {
          speedCollection.shift();
        }
      }
      return speedCollection;
    }
  
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @HostListener('window:resize', ['$event'])
    public onResize(event: any): void {
      this.windowWidth = event.target.innerWidth;
    }
  
    public filter(event: Event): void {
      const target = event.target as HTMLInputElement;
      const term = target.value;
      this.grid1.filter('CountryName', term, IgxStringFilteringOperand.instance().condition('contains'), true);
      this.grid1.markForCheck();
    }
  
    public showAlert(element: ElementRef): void {
      this.showOverlay = true;
      this._overlayId = this.overlayService.attach(element, this.overlaySettings);
      this.overlayService.show(this._overlayId);
    }
  
    public hideAlert(): void {
      this.showOverlay = false;
      this.overlayService.hide(this._overlayId);
    }
  
    private generateRandomNumber(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    private ticker(): void {
      if (this.showWinnerOverlay) {
        this.hideAlert();
      }
      if (this.isFinished) {
        this.live = false;
        this.grid1.page = 0;
        return;
      }
      this.updateData();
      this.manageRace();
    }
  
    private getRandomNumber(min: number, max: number): number {
      return Math.round(min + Math.random() * (max - min));
    }
  
    private manageRace(): void {
      // show winner alert
      if (this.localData[0].TrackProgress) {
        if (!this.hasWinner && this.localData[0].TrackProgress >= 100) {
          this.winner = this.localData[0];
          this.hasWinner = true;
          this.showAlert(this.winnerAlert);
        }
      }
  
      // move grid to next page to monitor players who still run
      const firstOnPage = this.grid1.getCellByColumn(0, 'TrackProgress');
      if (firstOnPage && firstOnPage.value === 100) {
        this.grid1.page = this.grid1.page + 1;
      }
  
      // show Top 3 players after race has finished
      if (this.localData[this.localData.length - 1].TrackProgress === 100) {
        this.top3 = this.localData.slice(0, 3);
        this.isFinished = true;
        this.showAlert(this.finishedAlert);
      }
    }
  
    private updateData(): void {
      const newData: Athlete[] = [];
      this.localData.forEach((rec, index) => {
        rec.LastPosition = index;
        if ((rec.TrackProgress !== undefined) && rec.TrackProgress < 100) {
          rec.Speed = this.addSpeedeData(rec, 3);
          if (rec.BeatsPerMinute !== undefined) {
            rec.BeatsPerMinute += this.generateRandomNumber(-5, 5);
          }
          if (rec.Id !== undefined && rec.Id < this.grid1.perPage + 1) {
            rec.TrackProgress = Math.min(rec.TrackProgress + this.generateRandomNumber(15, 20), 100);
          } else {
            rec.TrackProgress = Math.min(rec.TrackProgress + this.generateRandomNumber(7, 12), 100);
          }
  
        }
        newData.push({ ...rec });
      });
  
      this.localData = newData.sort((a, b) => b.TrackProgress - a.TrackProgress);
      this.localData.forEach((elem, ind) => {
          if (elem.LastPosition) {
            const position = elem.LastPosition - ind;
            if (position < 0) {
              elem.Position = 'down';
            } else if (position === 0) {
              elem.Position = 'current';
            } else {
              elem.Position = 'up';
            }
          }
      });
    }
  }
  
  class CustomTopSpeedSummary {
  
    public operate(data?: number[]): IgxSummaryResult[] {
      const result: IgxSummaryResult[] = [];
      if (!data){
        return result;
      }
      result.push({
        key: 'max',
        label: 'max',
        summaryResult: data.length ? IgxNumberSummaryOperand.max(data).toFixed(0) : null
      });
  
      return result;
    }
  }
  
  export class CustomBPMSummary {
  
    public operate(data?: number[]): IgxSummaryResult[] {
      const result: IgxSummaryResult[] = [];
      if (!data){
        return result;
      }
      result.push(
        {
          key: 'average',
          label: 'average',
          summaryResult: data.length ? IgxNumberSummaryOperand.average(data).toFixed(2) : null
        });
  
      return result;
    }
  }
  
  export class CustomSpeedSummary {
  
    public operate(data: Athlete[]): IgxSummaryResult[] {
        const speedData = data.reduce((acc, val) => acc.concat(val), [] as Athlete[]).map(rec => rec.Speed);
        const result = [];
        result.push(
            {
                key: 'average',
                label: 'average',
                summaryResult: speedData.length ? IgxNumberSummaryOperand.average(speedData).toFixed(2) : null
            });
  
        return result;
    }
  }
  
