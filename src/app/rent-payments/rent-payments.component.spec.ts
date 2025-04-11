import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentPaymentsComponent } from './rent-payments.component';

describe('RentReportComponent', () => {
  let component: RentPaymentsComponent;
  let fixture: ComponentFixture<RentPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
