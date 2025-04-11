import { Component, OnInit } from '@angular/core';
import { ngxCsv } from 'ngx-csv';
import { ApiService } from '../services/api.service';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnInit {

  localArray_company: any;
  totalLength: any;
  p: any;
  deleteIndexId: any
  fileName = 'Companies.xlsx';
  companyForm: FormGroup;
  cityOptions = [{ value: 'Bronx' }, { value: 'Brooklyn' }, { value: 'Manhattan' }, { value: 'Queens' }, { value: 'State Island' }];
  companyTypeOptions = [{ value: 'Admin' }, { value: 'Owner' }];
  isCompanyExist: boolean = false;
  editCompanyId: any;
  localArray_buildings: any;
  localArray_expense: any;

  constructor(
    public ApiService: ApiService,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {
    this.companyForm = this.fb.group({
      owner: ['', Validators.required],
      companyName: ['', Validators.required],
      city: ['', Validators.required],
      state: { value: 'New York', disabled: false },
      zip: '',
      phone: '',
      mobile: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      companyType: ['', Validators.required]
    });
   }

  async ngOnInit() {
    await this.getCompanyData();
    await this.getBuildingsData();
    await this.getExpenseData();
  }

  getCompanyData() {
    this.ApiService.getCompanyAPI().subscribe((fireBaseData: any) => {
      this.localArray_company = fireBaseData;
    });
  }

  getBuildingsData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_buildings = fireBaseData;
    });
  }

  getExpenseData() {
    this.ApiService.getExpenseAPI().subscribe((fireBaseData: any) => {
      this.localArray_expense = fireBaseData;
    });
  }

  onEdit(id: any) {
    const company = this.localArray_company.find((comp: any) => comp.id === id);
    if (company) {
      this.editCompanyId = id;
      this.companyForm.patchValue(company);
    }
  }

  // async updateCompanyInFirestore() {
  //   if (!this.editCompanyId) return;  
  //   const companyObject = this.companyForm.value;
  //   await this.ApiService.updateCompany(this.editCompanyId, companyObject);

  //   this.updateRelatedData(this.editCompanyId, companyObject);  
  //   this.editCompanyId = null;
  //   this.resetCompanyForm();
  // }

  async updateCompanyInFirestore() {
    if (!this.editCompanyId) return;

    const updatedCompany = this.companyForm.value;
    const originalCompany = this.localArray_company.find(comp => comp.id === this.editCompanyId);
    if (!originalCompany) return;

    // this.updateHardCodedExpense();
    // Extract only changed fields
    const dirtyFields = Object.keys(updatedCompany).reduce((acc, key) => {
      if (updatedCompany[key] !== originalCompany[key]) acc[key] = updatedCompany[key];
      return acc;
    }, {} as any);

    if (!Object.keys(dirtyFields).length) return console.log('No changes detected');

    this.ApiService.updateCompany(this.editCompanyId, dirtyFields);
    this.updateRelatedData(this.editCompanyId, dirtyFields);

    this.editCompanyId = null;
    this.resetCompanyForm();
  }

  async updateRelatedData(companyId: string, dirtyFields: any) {
    const relatedBuildings = this.localArray_buildings.filter(building => building.companyId === companyId);

    relatedBuildings.forEach(building => {
      Object.assign(building, dirtyFields); // Update fields locally
      this.ApiService.updateBuilding(building, building.id); // Send update request
    });

    console.log('Buildings updated successfully');

    // Now, update related expenses
    const relatedExpenses = this.localArray_expense.filter(expense => expense?.companyId === companyId);
    relatedExpenses.forEach(expenseObject => {
      Object.assign(expenseObject, dirtyFields); // Update fields locally
      this.ApiService.updateExpense(expenseObject, expenseObject.id); // Send update request
    });
    console.log('Expenses updated successfully');

  }

  // updateHardCodedExpense(){
  //   const relatedExpenses = this.localArray_expense.filter(expense => expense?.owner === "Shaukat Andleep");
  //   relatedExpenses.forEach(expenseObject => {

  //     const updatedExpense = {
  //       // owner: "Shaukat Andleeb",
  //       // companyName: "Andleeb Private Owner",
  //       // companyId: this.editCompanyId
  //     };

  //     Object.assign(expenseObject, updatedExpense); // Update fields locally
  //     this.ApiService.updateExpense(expenseObject, expenseObject.id); // Send update request
  //   });
  //   console.log('Hard coded Expenses updated successfully');
  // }
  

  deleteCompany(id: any) {
    this.ApiService.deleteCompany(id);
  }

  ////////////////////////////////////////-------EXPORT CSV FILE METHOD----//////////////////////////////////////////////
  exportData(): void {
    let element = document.getElementById('excel_table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.fileName); //save to file
  }

  addCompanytoFirestore() {
    const companyObject = this.companyForm.value;
    const checkDuplicate = companyObject.companyName.toLowerCase(); // Convert company name to lowercase for case-insensitive check

    if (this.localArray_company.some(company => company.companyName.toLowerCase() === checkDuplicate)) {
      alert('Company already exists. Please change the company name.');
      this.isCompanyExist = true;
    } else {
      const id = this.firestore.createId();
      companyObject.id = id;
      this.ApiService.addCompany(companyObject);
    }
    this.resetCompanyForm();
  }
  
  resetCompanyForm() {
    this.companyForm.reset();
  }
  get fCompany() {
    return this.companyForm.controls;
  }

}

