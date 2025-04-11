import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private previousBalanceValue: number;
  private rentDataSubject = new BehaviorSubject<any[]>([]);
  rentData$ = this.rentDataSubject.asObservable();


  constructor(private apiService: ApiService) { }

  setPreviousBalanceValue(value: number): void {
    this.previousBalanceValue = value;
  }

  getPreviousBalanceValue(): number {
    return this.previousBalanceValue;
  }

}

