import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.css']
})
export class UnitListComponent implements OnInit {


  localArray_building: any;
  totalLength: any;
  p: any;
  deleteIndexId: any
  unitArray: any[];
  fileName = 'Units.xlsx';
  mySelectedUnitFilterObj: any;
  SelectedUnitId: any;
  selectedUnitNo: any;
  selectedBuildingId: any;
  mySelectedIndexFilter: any;
  editUnitDataForm: FormGroup;
  unitDataForm: FormGroup
  editUnitId: any;
  selectedBuildingAddress: any;
  checkUnitNo: any;
  selectedUnitObj: any;
  unitNoExist: any;
  selectedBuilding: any;
  extractedBuildingId: any;
  searchQuery: any;
  unitTypeOptions = [{ value: 'Apartment' }, { value: 'Studio' }, { value: 'Office' }, { value: 'Commercial' }];
  filteredUnits: any;
  hasSearchQuery: boolean;
  isCoopApartment: boolean = true;


  constructor(
    public ApiService: ApiService,
    public fb: FormBuilder,
    private firestore: AngularFirestore,
    private toastr: ToastrService
  ) {
    this.editUnitDataForm = this.fb.group({
      building: [{ value: '', disabled: true }],
      unitNo: [{ value: '', disabled: true }],
      unitType: [{ value: '', disabled: true }],
      propertyType: [{ value: '', disabled: true }],
      beds: [''],
      baths: [''],
      floors: [''],
      rent: [{ value: '', disabled: true }],
      maintenanceFee: [''],
      security: ['']
    });

    this.unitDataForm = this.fb.group({
      building: ['', Validators.required],
      unitNo: ['', Validators.required],
      unitType: ['', Validators.required],
      propertyType: [{ value: '', disabled: true }],
      buildingId: [''],
      beds: [''],
      baths: [''],
      floors: [''],
      rent: [''],
      maintenanceFee: [''],
      security: ['']
    });

  }

  ngOnInit(): void {
    this.getUnitData();
  }

  // resetFilters() {
  //   this.searchQuery = '';
  //   this.filteredUnits = this.localArray_rent;
  //   this.hasSearchQuery = false; // Reset to false when filters are reset
  //   this.resetTable();
  // }

  searchButton() {
    // Filter the data based on the searchQuery
    this.filteredUnits = this.unitArray.filter(data =>
      data.building.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.unitNo.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    // Update the data source for rendering in the table
    this.unitArray = this.filteredUnits;
  }

  resetFilters() {
    this.searchQuery = '';
    this.getUnitData();
    this.hasSearchQuery = false; // Reset to false when filters are reset
  }

  getUnitData() {

    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_building = fireBaseData;

      this.unitArray = [];
      fireBaseData.forEach(element => {
        if (element.unitDetails && element.unitDetails.length > 0) {
          this.unitArray = this.unitArray.concat(element.unitDetails);
        }
      });
      // console.log('Unit array: ', this.unitArray);
    });

  }

  ////////////////////////////////////////-------EDIT METHOD START HERE----//////////////////////////////////////
  clickEdit(data: any) {
    this.selectedUnitObj = data;

    this.mySelectedIndexFilter = this.localArray_building.filter(element => element.id === data.buildingId);
    // this.checkUnitNo = this.mySelectedIndexFilter[0].unitDetails.filter(element => element.unitNo !== data.unitNo);
    // console.log('checkUnitNo', this.checkUnitNo);

    this.editUnitDataForm.patchValue({
      building: data.building,
      propertyType: data.propertyType,
      unitNo: data.unitNo,
      unitType: data.unitType,
      beds: data.beds,
      baths: data.baths,
      floors: data.floors,
      rent: data?.rent | 0,
      maintenanceFee: data?.maintenanceFee | 0,
      security: data.security
    });
    this.isCoopApartment = this.editUnitDataForm.get('propertyType').value === 'Co-op Apartments';

  }
  ////////////////////////////////////////-------UPDATE METHOD----//////////////////////////////////////////////
  updateUnit() {

    let userObject = this.editUnitDataForm.getRawValue();

    userObject.buildingId = this.selectedUnitObj.buildingId;
    userObject.unitId = this.selectedUnitObj.unitId;
    userObject.building = this.selectedUnitObj.building;
    userObject.propertyType = this.selectedUnitObj.propertyType;
    userObject.unitType = this.selectedUnitObj.unitType;
    userObject.unitNo = this.selectedUnitObj.unitNo;


    const buildingId = userObject.buildingId
    this.editUnitId = this.selectedUnitObj.unitId;
    const unitDetails = [...this.mySelectedIndexFilter[0].unitDetails];
    const index = unitDetails.findIndex(unit => unit.unitId === userObject.unitId);
    // const updatedUnitDetails = unitDetails.filter(element => element.unitId !== this.editUnitId).concat(userObject);
    if (index !== -1) {
      unitDetails[index] = userObject;
    }
    this.ApiService.updateUnit(unitDetails, buildingId).then(() => {
      this.toastr.success('Unit updated successfully!');
      this.editUnitDataForm.reset();
    }).catch(() => {
      this.toastr.error('Failed to update unit.');
    });
    this.editUnitDataForm.reset();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  get fUnit() {
    return this.editUnitDataForm.controls;
  }

  onEdit(id: any) {

  }
  
  storeIds(data) {
    // console.log('data:', data);
    this.SelectedUnitId = data.unitId;
    this.selectedUnitNo = data.unitNo;
  }

  deleteUnit() {

    this.mySelectedUnitFilterObj = this.unitArray.filter((data: any) => data.unitId === this.SelectedUnitId);
    // console.log('this.mySelectedUnitFilterObj', this.mySelectedUnitFilterObj);

    if (this.mySelectedUnitFilterObj.length > 0) {
      this.selectedBuildingId = this.mySelectedUnitFilterObj[0].buildingId;

      const selectedBuildingObj = this.localArray_building.filter(data => data.id === this.selectedBuildingId);
      let unitDetails = selectedBuildingObj[0].unitDetails.filter(data => data.unitId !== this.SelectedUnitId);
      // console.log('unitDetails:', unitDetails);
      this.ApiService.deleteUnit(unitDetails, this.selectedBuildingId);
    } else {
      console.log('Selected unit not found.');
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

  onBuildingDropDownForUnit(event: Event) {
    this.selectedBuilding = []; // Initialize it as an empty array
    this.selectedBuildingId = (event.target as HTMLSelectElement).value;
    this.selectedBuilding = this.localArray_building.filter(data => data.address.toLowerCase() === this.selectedBuildingId.toLowerCase());
    this.extractedBuildingId = this.selectedBuilding[0].id;
    this.unitDataForm.patchValue({ propertyType: this.selectedBuilding[0].propertyType });
    this.isCoopApartment = this.selectedBuilding[0].propertyType === 'Co-op Apartments';
  }

  checkUnitNoExistInUnitArr() {
    const enteredUnitNo = this.unitDataForm.get('unitNo').value;
    this.unitNoExist = this.selectedBuilding.some(data => {
      return data.unitDetails?.some(unit => unit.unitNo === enteredUnitNo);
    });
  }

  addUnitDataToFirestore() { // unit form modal to firestore
    const unitObject = this.unitDataForm.value;
    const finalUnitObject = {
      ...unitObject, unitId: this.firestore.createId(),
      buildingId: this.extractedBuildingId,
      building: this.selectedBuilding[0].address,
      propertyType: this.selectedBuilding[0].propertyType
    };

    if (this.unitNoExist) {
      alert('This unit already exist.');
    } else {
      this.ApiService.updateUnitToBuilding(finalUnitObject, this.extractedBuildingId);
    }

    this.resetUnitForm();
  }

  resetUnitForm() {
    this.unitDataForm.reset();
  }

  formatDate(getDate) {
    const parsedDate = new Date(getDate);
    return `${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}/${parsedDate.getDate().toString().padStart(2, '0')}/${parsedDate.getFullYear()}`;
  }


}

