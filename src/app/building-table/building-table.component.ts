import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ngxCsv } from 'ngx-csv';
import { ApiService } from '../services/api.service';
import * as XLSX from 'xlsx';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-building-table',
  templateUrl: './building-table.component.html',
  styleUrls: ['./building-table.component.css']
})

export class BuildingTableComponent implements OnInit {
  //////////////////////////////////////////////////////////////
  sortingOrder: string = 'ascending';
  localArray_building: any = [];
  p: any;
  deleteIndexId: any;
  deleted: any;
  totalLength: any;
  editBuildingDataForm: FormGroup;
  selectedBuildingId: any;
  editSelectedBuildingId: any;
  fileName = 'Buildings.xlsx';
  mySelectedIndexFilter: any;
  buildingDataForm: FormGroup
  localArray_company: any;
  selectedBuilding: any;
  extractedBuildingId: any;
  ownerArray: any;
  checkAddress: string[] = [];
  selectedCompany: any;
  selectedValue: string;
  searchQuery: any;
  ///////////////////////////////////////////////////////////////


  constructor(
    public ApiService: ApiService,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {
    this.editBuildingDataForm = this.fb.group({
      owner: [{ value: '', disabled: false }],
      companyName: [{ value: '', disabled: false }],
      propertyType: ['', Validators.required],
      address: [{ value: '', disabled: false }, Validators.required],
      city: [{ value: '', disabled: false }],
      state: [{ value: '', disabled: false }],
      zip: [{ value: '', disabled: false }],
      wsh_dry: [false],
      elevator: [false],
      totalUnit: [''],
      amount_fine: [''],
      remarks: ['']
    });

    this.buildingDataForm = this.fb.group({
      owner: [{ value: '', disabled: false }],
      companyName: [{ value: '', disabled: false }],
      propertyType: ['', Validators.required],
      address: ['', Validators.required],
      city: [{ value: '', disabled: false }],
      state: [{ value: '', disabled: false }],
      zip: [{ value: '', disabled: false }],
      wsh_dry: [false],
      elevator: [false],
      totalUnit: [''],
      amount_fine: [''],
      remarks: ['']
    });

  }

  ngOnInit(): void {
    this.getBuildingData();
    this.getCompanyData();
  }

  getBuildingData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_building = fireBaseData;
      this.checkAddress = this.localArray_building.map(data => data.address); //buildingname array to check
    });
  }

  getCompanyData() {
    this.ApiService.getCompanyAPI().subscribe((fireBaseData: any) => {
      this.localArray_company = fireBaseData;
      this.localArray_company.map(data => {
        this.ownerArray = data;
      })
    });
  }

  ////////////////////////////////////////-------SORTING BUTTON METHOD----///////////////////////////////////////////////
  sortArray(property: any, order: string) {
    if (order == 'ascending') {
      this.localArray_building.sort((a: any, b: any) => b[property] > a[property] ? -1 : 1);
      this.sortingOrder = 'descending';
    } else {
      this.localArray_building.sort((a: any, b: any) => b[property] > a[property] ? 1 : -1);
      this.sortingOrder = 'ascending';
    }
  }
  ////////////////////////////////////////-------EXPORT CSV FILE METHOD----//////////////////////////////////////////////


  exportData(): void {
    let element = document.getElementById('excel_table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, this.fileName); //save to file
  }

  ////////////////////////////////////////-------DELETE BUTTON METHOD----////////////////////////////////////////////////
  public deleteBuilding(deleteIndexId: any) {
    this.ApiService.deleteBuilding(deleteIndexId);
  }

  ////////////////////////////////////////-------EDIT METHOD START HERE----/////////////////////////////////////////////
  clickEdit(id: any) { 
    this.mySelectedIndexFilter = this.localArray_building.filter((data) => data.id === id);
    this.editBuildingDataForm.setValue({
      owner: this.mySelectedIndexFilter[0].owner,
      companyName: this.mySelectedIndexFilter[0].companyName,
      propertyType: this.mySelectedIndexFilter[0].propertyType,
      address: this.mySelectedIndexFilter[0].address,
      city: this.mySelectedIndexFilter[0].city,
      state: this.mySelectedIndexFilter[0].state,
      zip: this.mySelectedIndexFilter[0].zip,
      wsh_dry: this.mySelectedIndexFilter[0].wsh_dry,
      elevator: this.mySelectedIndexFilter[0].elevator,
      totalUnit: this.mySelectedIndexFilter[0].totalUnit,
      amount_fine: this.mySelectedIndexFilter[0].amount_fine,
      remarks: this.mySelectedIndexFilter[0].remarks
    });
    this.editSelectedBuildingId = id;
  }
  ////////////////////////////////////////-------UPDATE METHOD----///////////////////////////////////////////////
  
  updateBuilding() {
    if (!this.editSelectedBuildingId) return;
    const updatedFields = this.editBuildingDataForm.value;
    const selectedCompany = this.localArray_company.find(
      arr => arr.companyName === updatedFields.companyName || arr.id === updatedFields.companyId
    );

    // Retain previous fields instead of overwriting the entire object
    const existingBuilding = this.localArray_building.find(b => b.id === this.editSelectedBuildingId);
    if (!existingBuilding) return;

    // Prepare only changed fields
    const dirtyFields = Object.keys(updatedFields).reduce((acc, key) => {
      if (updatedFields[key] !== existingBuilding[key]) acc[key] = updatedFields[key];
      return acc;
    }, {} as any);
    if (!Object.keys(dirtyFields).length) return console.log('No changes detected');

    // Assign additional fields
    dirtyFields.companyId = selectedCompany?.id;
    dirtyFields.ownerEmail = selectedCompany?.email;
    this.ApiService.updateBuilding(dirtyFields, this.editSelectedBuildingId);
    this.editBuildingDataForm.reset();
    console.log('Building updated successfully without removing other fields.');
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  get fBuild() {
    return this.editBuildingDataForm.controls;
  }

  cityOptions = [{ value: 'Bronx' }, { value: 'Brooklyn' }, { value: 'Manhattan' }, { value: 'Queens' }, { value: 'State Island' }];
  propertyOptions = [{ value: 'Co-op Apartments' }, { value: 'Condos' }, { value: 'Residential' }, { value: 'Commercial' }, { value: 'Residential/Commercial' }];

  // onBuildingDropDown(event: Event) {
  //   this.selectedBuildingId = (event.target as HTMLSelectElement).value;
  //   this.selectedBuilding = this.localArray_building.filter(data => data.address.toLowerCase() === this.selectedBuildingId.toLowerCase());
  //   this.extractedBuildingId = this.selectedBuilding[0].id;
  // }

  // Handle dropdown selection/change
  onCompanyDropDown(event: Event) {
    this.selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCompany = this.localArray_company.find(data => data.companyName === this.selectedValue);
        // Patch the values to the form controls
    this.patchFormValues(this.selectedCompany);
  }

  // Function to patch the values to the Building form controls
  patchFormValues(company: any) {
    this.buildingDataForm.patchValue({
      owner: company?.owner || '',
      companyName: company?.companyName || '',
      city: company?.city || '',
      state: company?.state || '',
      zip: company?.zip || ''
    });
  }

  addBuildingDataToFirestore() { //add building form values in building modal
    const formValue = this.buildingDataForm.value;
    const lowercaseAddress = formValue.address.toLowerCase(); // Convert formValue.address to lowercase

    if (this.checkAddress.some(address => address.toLowerCase() === lowercaseAddress)) {
      alert('Building already exists. Please change the building address.');
    } else {
      const userObject = { ...formValue, id: this.firestore.createId() };

      // Manually add the disabled fields to the Firestore data
      userObject.owner = this.buildingDataForm.get('owner').value;
      userObject.address = this.buildingDataForm.get('address').value;
      userObject.companyName = this.buildingDataForm.get('companyName').value;
      userObject.city = this.buildingDataForm.get('city').value;
      userObject.state = this.buildingDataForm.get('state').value;
      userObject.zip = this.buildingDataForm.get('zip').value;
      userObject.ownerEmail = this.selectedCompany.email;
      userObject.companyId = this.selectedCompany.id;

      this.ApiService.addBuilding(userObject);
    }
    this.resetBuildingForm();
  }

  resetBuildingForm() {
    this.buildingDataForm.reset();
  }
  searchButton() {
    const filteredDataArr = this.localArray_building.filter(data =>
      data.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.companyName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.owner.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.localArray_building = filteredDataArr;
  }
  resetFilters() {
    if (this.searchQuery) {
      this.searchQuery = '';
      this.getBuildingData();
    } else { }
  }

}
