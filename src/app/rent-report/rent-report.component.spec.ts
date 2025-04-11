import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentReportComponent } from './rent-report.component';

describe('RentReportComponent', () => {
  let component: RentReportComponent;
  let fixture: ComponentFixture<RentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
