import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../services/api.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../services/loader.service';
import * as bootstrap from 'bootstrap';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-lease',
  templateUrl: './lease.component.html',
  styleUrls: ['./lease.component.css']
})

export class LeaseComponent implements OnInit, OnDestroy  {
  localArray_lease: any;
  totalLength: any;
  p: any;
  deleteIndexId: any;
  fileName = 'Lease.xlsx';
  mySelectedIndexFilter: any;
  selectedLeaseId: any;
  selectedBuildingName: string;
  unitOptionsArray: any[] = [];
  unitExistInLeaseArray: boolean = false;
  selectedBuilding: any;
  localArray_building: any;
  leaseEditForm: FormGroup;
  leaseForm: FormGroup;
  extractedBuildingId: any;
  selectedUnit: any;
  searchQuery: any;
  filteredlease: any;
  isCoopApartment: boolean;
  hasSearchQuery: boolean;
  leaseIdToDisable: string;
  leaseIdToEdit: any;
  private showModalSubscription: Subscription;


  constructor(
    public ApiService: ApiService,
    public fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) {
    this.leaseForm = this.fb.group({
      building: ['', Validators.required],
      state: ['New York'],
      buildingId: [''],
      id: [''],
      unitNo: ['', Validators.required],
      isSublet: [false],
      subletAmount: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      socialSecurity: [''],
      phone: [''],
      mobile: ['', [Validators.required, Validators.minLength(7)]],
      legalRent: [''],
      prefRent: [''],
      securityHeld: { value: '', disabled: true },
      leaseStartDate: [''],
      leaseEndDate: [''],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      remarks: [''],
      maintenanceFee: [''],
      garageFee: [''],
      storageSpaceFee: [''],
      fuelCharges: [''],
      internetFee: [''],
      unitType: [{ value: '', disabled: true }],
      propertyType: [{ value: '', disabled: true }]
    });

    this.leaseEditForm = this.fb.group({
      building: [{ value: '', disabled: true }],
      unitNo: [{ value: '', disabled: false }],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      socialSecurity: [''],
      phone: [''],
      mobile: ['', [Validators.required, Validators.minLength(7)]],
      legalRent: [{ value: '', disabled: true }],
      prefRent: [{ value: '', disabled: true }],
      securityHeld: [{ value: '', disabled: false }],
      leaseStartDate: [''],
      leaseEndDate: [''],
      isSublet: [false],
      subletAmount: [''],
      maintenanceFee: [''],
      garageFee: [''],
      storageSpaceFee: [''],
      fuelCharges: [''],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      remarks: [''],
      id: [{ value: '', disabled: true }],
      propertyType: [{ value: '', disabled: true }],
      unitType: [{ value: '', disabled: true }],
    });
    // Subscribe to changes in the isSublet control
    this.leaseForm.get('isSublet').valueChanges.subscribe((value) => {
            if (value === true) {
        this.leaseForm.get('subletAmount').setValue(56); // Set the subletAmount to $56 when isSublet is checked
      } else {
        this.leaseForm.get('subletAmount').setValue(''); // Clear the subletAmount when isSublet is unchecked
      }
    });
  }
  searchButton() {
    this.hasSearchQuery = true;
    // Filter the data based on the searchQuery
    this.filteredlease = this.localArray_lease.filter(data =>
      data.building.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.unitNo.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.firstName.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.lastName?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  resetFilters() {
    this.searchQuery = '';
    this.getLeaseData();
    this.hasSearchQuery = false; // Reset to false when filters are reset
  }

  ngOnInit(): void {
    this.showModalSubscription = this.loaderService.showModal$.subscribe(() => {
      this.openModal();
      console.log('Modal called from service.')
    });
    this.getLeaseData();
    this.getBuildingData();
  }

  ngOnDestroy(): void {
    this.showModalSubscription?.unsubscribe();
  }

  openModal() {
    const modalElement = document.getElementById('leaseModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  getBuildingData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_building = fireBaseData;
    });
  }
  getLeaseData() {
    this.ApiService.getLeaseAPI().subscribe((fireBaseData: any) => {
      this.localArray_lease = fireBaseData;
      this.filteredlease = this.localArray_lease;
    });
  }
  ////////////////////////////////////////-------EXPORT CSV FILE METHOD----//////////////////////////////////////////////
  exportData(): void {
    let element = document.getElementById('excel_table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.fileName); //save to file
  }

  ////////////////////////////////////////-------EDIT METHOD START HERE----/////////////////////////////////////////////

  clickEdit(data: any) {
    this.mySelectedIndexFilter = this.localArray_lease.filter(element => element.id === data.id);
    this.extractedBuildingId = data.buildingId;
    this.selectedBuilding = data.building;
    this.selectedLeaseId = data.id;
    this.selectedUnit = data.unitNo;
    this.mySelectedIndexFilter?.isSublet ? this.mySelectedIndexFilter.subletAmount = 56 : this.mySelectedIndexFilter.subletAmount = 0;

    this.leaseEditForm.patchValue({
      building: data.building,
      unitNo: data.unitNo,
      id: this.selectedLeaseId,
      propertyType: data.propertyType,
      unitType: data.unitType,
      firstName: data.firstName,
      lastName: data.lastName,
      socialSecurity: data.socialSecurity,
      phone: data.phone | 0,
      isSublet: data?.isSublet || false,
      subletAmount: this.mySelectedIndexFilter?.subletAmount,
      maintenanceFee: data.maintenanceFee | 0,
      fuelCharges: data.fuelCharges | 0,
      mobile: data.mobile,
      legalRent: data.legalRent,
      garageFee: data.garageFee | 0,
      prefRent: data.prefRent,
      securityHeld: data.securityHeld,
      leaseStartDate: data.leaseStartDate,
      leaseEndDate: data.leaseEndDate,
      email: data.email,
      remarks: data.remarks
    });
    this.isCoopApartment = this.leaseEditForm.get('propertyType').value === 'Co-op Apartments';
  }

  // Custom date formatter function for US format (MM/dd/yyyy)
  formatDate(getDate) {
    const parsedDate = new Date(getDate);
    return `${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}/${parsedDate.getDate().toString().padStart(2, '0')}/${parsedDate.getFullYear()}`;
  }

  updateLease() {
    const userObject = this.leaseEditForm.getRawValue();

    userObject.buildingId = this.extractedBuildingId;
    userObject.building = this.selectedBuilding;
    userObject.unitNo = this.leaseEditForm.get('unitNo').value
    userObject.id = this.selectedLeaseId;
    userObject.propertyType = this.mySelectedIndexFilter[0].propertyType;
    userObject.unitType = this.mySelectedIndexFilter[0].unitType;
    userObject.legalRent = userObject.legalRent || 0;
    userObject.prefRent = this.mySelectedIndexFilter[0].prefRent;
    userObject.securityHeld = this.mySelectedIndexFilter[0]?.securityHeld || 0;

    this.ApiService.updateLease(userObject, this.selectedLeaseId);
    this.leaseEditForm.reset();
  }

  deleteLease(deleteIndexId: any) {
    this.ApiService.deleteLease(deleteIndexId);
  }

  get fLease() {
    return this.leaseEditForm.controls;
  }

  resetLeaseForm() {
    this.leaseForm.reset();
  }

  onBuildingDropDown(event: Event) {
    this.selectedBuildingName = (event.target as HTMLSelectElement).value;
    this.selectedBuilding = this.localArray_building.filter(data => data.address.toLowerCase() === this.selectedBuildingName.toLowerCase());
    this.extractedBuildingId = this.selectedBuilding[0].id;
    this.isCoopApartment = this.selectedBuilding[0].propertyType === 'Co-op Apartments';
  }

  unitOptionsForSelectedBuilding() { //patching values in add lease form modal
    const selectedBuildingData = this.localArray_building.find(item => item.address === this.selectedBuildingName);

    if (selectedBuildingData) {
      this.unitOptionsArray = selectedBuildingData.unitDetails; // Use this array in ngFor loop in html for data binding

      // Autofill rent in legalRent field in leasform modal
      const selectedUnitNo = this.leaseForm.get('unitNo').value; // get value of unit No from html
      const selectedUnitObj = this.unitOptionsArray.find(item => item.unitNo === selectedUnitNo);
      // console.log('selectedUnitObj:', selectedUnitObj);

      // filter lease Array with same building name
      const filteredLeaseArray = this.localArray_lease.filter(element => {
        return element.building.toLowerCase() === this.selectedBuildingName.toLowerCase();
      });

      // check duplicate unit from lease array
      this.unitExistInLeaseArray = filteredLeaseArray.some(element => {
        return element.unitNo.toLowerCase() === selectedUnitNo.toLowerCase();
      });

      // Patching values of lease form from selected unit of selected building
      if (selectedUnitObj) {
        this.leaseForm.patchValue({
          legalRent: selectedUnitObj.rent,
          // prefRent: selectedUnitObj?.prefRent,
          unitType: selectedUnitObj.unitType,
          securityHeld: selectedUnitObj.security,
          propertyType: selectedUnitObj.propertyType,
          maintenanceFee: selectedUnitObj?.maintenanceFee
        });
      }
    }
  }

  addLeasetoFirestore() { // add lease button method in lease modal
    const leaseFormObject = this.leaseForm.value;
    leaseFormObject.leaseStartDate = this.formatDate(this.leaseForm.get('leaseStartDate').value);
    leaseFormObject.leaseEndDate = this.formatDate(this.leaseForm.get('leaseEndDate').value);


    const filteredleaseFormObjects = this.localArray_lease.filter(element => {
      return element.building.toLowerCase() === leaseFormObject.building.toLowerCase();
    });
    const currentDate = new Date();    
  
    filteredleaseFormObjects.forEach(data => {
      if (data.unitNo.toLowerCase() === leaseFormObject.unitNo.toLowerCase() && data?.disabled && !data?.isRenewed) {
        data.isRenewed = true;
        this.ApiService.updateLease({ isRenewed: true }, data.id);
      }
    });

    const unitExist = filteredleaseFormObjects.some(data => {
      const leaseEndDate = new Date(data.leaseEndDate);
      const isExpired = leaseEndDate < currentDate;
      return data.unitNo.toLowerCase() === leaseFormObject.unitNo.toLowerCase() && !data?.disabled && !data?.isRenewed && !isExpired;
    });

    if (!unitExist) {
      const buildingId = this.extractedBuildingId;
      const unitType = this.leaseForm.get('unitType').value;
      const propertyType = this.leaseForm.get('propertyType').value;

      if (buildingId  && unitType) {
        leaseFormObject?.isSublet ? leaseFormObject.subletAmount = 56 : leaseFormObject.subletAmount = 0;
        const leaseId = this.generateLeaseId(); // Generate the lease ID
        leaseFormObject.id = leaseId;
        leaseFormObject.maintenanceFee = this.leaseForm.get('maintenanceFee').value;
        leaseFormObject.garageFee = this.leaseForm.get('garageFee').value;
        leaseFormObject.storageSpaceFee = this.leaseForm.get('storageSpaceFee').value;
        leaseFormObject.fuelCharges = this.leaseForm.get('fuelCharges').value;
        leaseFormObject.internetFee = this.leaseForm.get('internetFee').value;
        leaseFormObject.state = this.leaseForm.get('state').value;
        leaseFormObject.buildingId = buildingId;
        leaseFormObject.legalRent = this.leaseForm.get('legalRent').value || 0 ;
        leaseFormObject.prefRent = this.leaseForm.get('prefRent').value || 0 ;
        leaseFormObject.unitType = unitType;
        leaseFormObject.propertyType = propertyType;
        leaseFormObject.leaseStartDate = this.leaseForm.get('leaseStartDate').value ? this.formatDate(this.leaseForm.get('leaseStartDate').value) : '';
        leaseFormObject.leaseEndDate = this.leaseForm.get('leaseEndDate').value ? this.formatDate(this.leaseForm.get('leaseEndDate').value) : '';
        
        this.ApiService.addLease(leaseFormObject);
      } else {
        alert('Please fill in all the required fields.');
      }
    } else {
      alert('Lease Already Exist for this Unit.');
    }

    this.leaseForm.reset();
  }

  generateLeaseId() {
    const prefix = 'AMMS-';
    const existingLeaseIds = this.localArray_lease.map(element => element.id);
    let maxNumber = 0;

    for (const leaseId of existingLeaseIds) {
      if (leaseId.startsWith(prefix)) {
        const numberPart = parseInt(leaseId.slice(prefix.length), 10);
        if (!isNaN(numberPart) && numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    }

    const newNumber = maxNumber + 1;
    return prefix + newNumber;
  }

  prepareToEditLease(leaseId: string) {
    this.leaseIdToEdit = leaseId;
  }

  disableLease() {
    if (this.leaseIdToEdit) {
      const disabledDate = new Date().toLocaleDateString();
      this.ApiService.disableLease(this.leaseIdToEdit, disabledDate).then(() => {
        this.searchButton();
        this.toastr.success(`${this.leaseIdToEdit} Lease has been disabled.`, 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }).catch((error) => {
        this.toastr.error('Error in disabling the Lease.');
      });
    }
  }
  enableLease() {
    if (this.leaseIdToEdit) {
      const enabledDate = new Date().toLocaleDateString();
      this.ApiService.enableLease(this.leaseIdToEdit, enabledDate).then(() => {
        this.searchButton();
        this.toastr.success(`${this.leaseIdToEdit} Lease has been enabled.`, 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }).catch((error) => {
        this.toastr.error('Error in enabling the Lease.');
      });
    }
  }
  
}
