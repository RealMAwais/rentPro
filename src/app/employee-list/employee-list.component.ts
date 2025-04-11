import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  localArray_employee: any;
  totalLength: any;
  p: any;
  deleteIndexId: any
  fileName = 'Employees.xlsx';
  employeeForm: FormGroup
  localArray_home: any;


  constructor(
    private fb: FormBuilder,
    public ApiService: ApiService,
    private firestore: AngularFirestore
  ) {

    this.employeeForm = this.fb.group({
      building: { value: '586 Union Street', disabled: false },
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employementStartDate: '',
      employementEndDate: '',
      salary: '',
      remarks: ''
    });

  }

  ngOnInit(): void {
    this.getEmployeeData();
    this.getBuildingData();
  }
  getBuildingData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_home = fireBaseData;
    })
  }

  getEmployeeData() {
    this.ApiService.getEmployeeAPI().subscribe((fireBaseData: any) => {
      this.localArray_employee = fireBaseData;
    });
  }

  onEdit(id: any) {

  }

  deleteEmployee(id: any) {
    this.ApiService.deleteEmployee(id);
  }

  ////////////////////////////////////////-------EXPORT CSV FILE METHOD----//////////////////////////////////////////////
  exportData(): void {
    let element = document.getElementById('excel_table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.fileName); //save to file
  }

  resetEmployeeForm() {
    this.employeeForm.reset();
  }

  addEmployeetoFirestore() {
    let employeeObject = this.employeeForm.value;
    const id = this.firestore.createId();
    employeeObject['id'] = id;
    this.ApiService.addEmployee(employeeObject);
    this.employeeForm.reset();
  }
  get fEmployee() {
    return this.employeeForm.controls;
  }


}
