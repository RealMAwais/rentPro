import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeListComponent } from './employee-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as XLSX from 'xlsx';

describe('EmployeeListComponent', () => {
  let component: EmployeeListComponent;
  let fixture: ComponentFixture<EmployeeListComponent>;
  let mockApiService: any;
  let mockFirestore: any;

  beforeEach(async () => {
    mockApiService = {
      getEmployeeAPI: jasmine.createSpy().and.returnValue(of([])),
      getBuildingsAPI: jasmine.createSpy().and.returnValue(of([])),
      deleteEmployee: jasmine.createSpy(),
      addEmployee: jasmine.createSpy()
    };

    mockFirestore = {
      createId: jasmine.createSpy().and.returnValue('abc123')
    };

    await TestBed.configureTestingModule({
      declarations: [EmployeeListComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AngularFirestore, useValue: mockFirestore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getEmployeeData on init', () => {
    spyOn(component, 'getEmployeeData');
    component.ngOnInit();
    expect(component.getEmployeeData).toHaveBeenCalled();
  });

  it('should call getBuildingData on init', () => {
    spyOn(component, 'getBuildingData');
    component.ngOnInit();
    expect(component.getBuildingData).toHaveBeenCalled();
  });

  it('should fetch building data and assign to localArray_home', () => {
    const mockBuildings = [{ id: 1, name: 'Building A' }];
    mockApiService.getBuildingsAPI.and.returnValue(of(mockBuildings));

    component.getBuildingData();
    expect(component.localArray_home).toEqual(mockBuildings);
  });

  it('should fetch employee data and assign to localArray_employee', () => {
    const mockEmployees = [{ id: 1, name: 'Ali' }];
    mockApiService.getEmployeeAPI.and.returnValue(of(mockEmployees));

    component.getEmployeeData();
    expect(component.localArray_employee).toEqual(mockEmployees);
  });

  it('should call deleteEmployee with id', () => {
    const id = '123';
    component.deleteEmployee(id);
    expect(mockApiService.deleteEmployee).toHaveBeenCalledWith(id);
  });

  it('should export data to Excel', () => {
    const dummyTable = document.createElement('table');
    dummyTable.id = 'excel_table';
    document.body.appendChild(dummyTable);

    spyOn(XLSX.utils, 'table_to_sheet').and.callThrough();
    spyOn(XLSX.utils, 'book_new').and.callThrough();
    spyOn(XLSX.utils, 'book_append_sheet').and.callThrough();
    spyOn(XLSX, 'writeFile').and.callThrough();

    component.exportData();

    expect(XLSX.utils.table_to_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalled();

    document.body.removeChild(dummyTable);
  });

  it('should reset the employee form', () => {
    component.employeeForm.patchValue({ firstName: 'Ali', lastName: 'Khan' });
    component.resetEmployeeForm();
    expect(component.employeeForm.value.firstName).toBeNull();
  });

  it('should add employee to Firestore and reset form', () => {
    component.employeeForm.patchValue({
      firstName: 'Ali',
      lastName: 'Khan',
      salary: '10000'
    });

    component.addEmployeetoFirestore();

    expect(mockFirestore.createId).toHaveBeenCalled();
    expect(mockApiService.addEmployee).toHaveBeenCalled();
    expect(component.employeeForm.value.firstName).toBeNull(); // form reset
  });

  it('should return employee form controls', () => {
    const controls = component.fEmployee;
    expect(controls).toBe(component.employeeForm.controls);
  });
});
