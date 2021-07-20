import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
import { FinancialData } from './localData/financialData';

@Injectable()
export class LocalDataService {
  public records: Observable<any[]>;
  public records$: BehaviorSubject<any[]>;

  constructor() {
    this.records$ = new BehaviorSubject([] as any);
    this.records = this.records$.asObservable();
  }

  public getData(count: number = 10) {
    const financialData: FinancialData = new FinancialData();
    this.records$.next(financialData.generateData(count));
  }
}
