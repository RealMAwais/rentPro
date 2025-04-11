import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentsByMonthComponent } from './rents-by-month.component';

describe('RentsByMonthComponent', () => {
  let component: RentsByMonthComponent;
  let fixture: ComponentFixture<RentsByMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentsByMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentsByMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
