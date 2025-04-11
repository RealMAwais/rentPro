// import { OnInit, Component } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { ApiService } from '../services/api.service';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { Router } from '@angular/router';
// import { MatDialog } from '@angular/material/dialog';
// import { AngularFireStorage } from '@angular/fire/compat/storage';
// import { DatePipe } from '@angular/common';
// import { DataSharingService } from '../services/data-sharing.service';
// import { ToastrService } from 'ngx-toastr';
// import * as moment from 'moment-timezone';

// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })

// export class HomeComponent implements OnInit {

//   /////////////////////////////////////
//   buildingDataForm: FormGroup
//   unitDataForm: FormGroup
//   companyForm: FormGroup
//   leaseForm: FormGroup
//   incomeForm: FormGroup
//   expenseForm: FormGroup
//   taskForm: FormGroup
//   employeeForm: FormGroup
//   rentForm: FormGroup
//   monthlyRentForm: FormGroup
//   /////////////////////////////////////
//   selectedBuilding: any;
//   deleteIndexId: any;
//   localArray_home: any = [];
//   selectedBuildingId: any;
//   unitOptionsArray: any = [];
//   mySelectedIndexFilter: any;
//   localArray_lease: any;
//   selectedBuildingName: any;
//   checkAddress: string[] = [];
//   unitArray: any;
//   extractedBuildingId: any;
//   selectedTenantObj: any;
//   selectedUnitNo: string;
//   localArray_company: any;
//   ownerArray: any;
//   unitNoExist: boolean = false;
//   unitExistInLeaseArray: boolean;
//   isActiveLease: boolean = false;
//   localArray_rent: any;
//   selectedRentObj: any;
//   selectedRentArray: any;
//   calculatedRentDueDate: any | null;
//   formatedDatePaid: string;
//   month: number;
//   year: any;
//   isMonthYearValid: boolean;
//   localArray_monthlyRents: any;
//   isInvoiceExist: boolean;
//   selectedYearUpdate: any;
//   monthName: string = '';
//   isAlreadyAdded: any;

//   ngOnInit() {
//     this.getBuildingData();
//     this.getCompanyData();
//   }

//   getBuildingData() {
//     this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
//       this.localArray_home = fireBaseData;
//       this.getLeaseData(); // call api to get all leases to show in dropdown for building form
//       this.getRentData();
//       this.getMonthlyInvoiceSummary();
//       this.checkAddress = this.localArray_home.map(data => data.address); //buildingname array to check
//     });
//   }

//   getCompanyData() {
//     this.ApiService.getCompanyAPI().subscribe((fireBaseData: any) => {
//       this.localArray_company = fireBaseData;

//       this.localArray_company.map(data => {
//         this.ownerArray = data;
//         // console.log('owner', this.ownerArray);
//       })

//     });
//   }

//   getLeaseData() {
//     this.ApiService.getLeaseAPI().subscribe((fireBaseData: any) => {
//       this.localArray_lease = fireBaseData;
//       // console.log('lease Data Array', this.localArray_lease);
//     });
//   }

//   getRentData() {
//     this.ApiService.getRentAPI().subscribe((fireBaseData: any) => {
//       this.localArray_rent = fireBaseData;
//       // console.log('rent Data Array', this.localArray_rent);
//     });
//   }

//   getMonthlyInvoiceSummary() {
//     this.ApiService.getMonthlyRentsAPI().subscribe((fireBaseData: any) => {
//       this.localArray_monthlyRents = fireBaseData;
//     });
//   }

//   constructor(
//     private fb: FormBuilder,
//     private ApiService: ApiService,
//     private firestore: AngularFirestore,
//     private fireStorage: AngularFireStorage,
//     // public router: Router,
//     public dialog: MatDialog,
//     private datePipe: DatePipe,
//     private dataSharingService: DataSharingService,
//     private toastr: ToastrService
//   ) {


//     // Initialize the form with default values or data from the server

//     this.companyForm = this.fb.group({
//       owner: ['', Validators.required],
//       companyName: ['', Validators.required],
//       address: ['', Validators.required],
//       city: ['', Validators.required],
//       state: { value: 'New York', disabled: false },
//       zip: '',
//       phone: '',
//       mobile: ['', [Validators.required, Validators.minLength(7)]],
//       email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
//       companyType: ['', Validators.required]
//     });

//     this.buildingDataForm = this.fb.group({
//       owner: [{ value: '', disabled: true }],
//       companyName: [{ value: '', disabled: true }],
//       propertyType: ['', Validators.required],
//       address: ['', Validators.required],
//       city: [{ value: '', disabled: true }],
//       state: [{ value: '', disabled: true }],
//       zip: [{ value: '', disabled: true }],
//       wsh_dry: [false],
//       elevator: [false],
//       totalUnit: [''],
//       amount_fine: [''],
//       remarks: ['']
//     });

//     this.unitDataForm = this.fb.group({
//       building: ['', Validators.required],
//       unitNo: ['', Validators.required],
//       unitType: ['', Validators.required],
//       propertyType: [{ value: '', disabled: true }],
//       buildingId: [''],
//       beds: [''],
//       baths: [''],
//       floors: [''],
//       rent: [''],
//       security: ['']
//     });

//     this.leaseForm = this.fb.group({
//       building: ['', Validators.required],
//       state: ['New York'],
//       buildingId: [''],
//       id: [''],
//       unitNo: ['', Validators.required],
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//       socialSecurity: [''],
//       phone: [''],
//       mobile: ['', [Validators.required, Validators.minLength(7)]],
//       legalRent: { value: '', disabled: true },
//       prefRent: [''],
//       securityHeld: { value: '', disabled: true },
//       leaseStartDate: [''],
//       leaseEndDate: [''],
//       email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
//       remarks: [''],
//       maintenanceFee: [''],
//       garageFee: [''],
//       storageSpaceFee: [''],
//       fuelCharges: [''],
//       internetFee: [''],
//       unitType: [{ value: '', disabled: true }],
//       propertyType: [{ value: '', disabled: true }]
//     });

//     this.rentForm = this.fb.group({
//       building: ['', Validators.required],
//       unitNo: ['', Validators.required],
//       propertyType: [{ value: '', disabled: true }],
//       unitType: [{ value: '', disabled: true }],
//       tenantName: [{ value: '', disabled: true }, Validators.required],
//       leaseId: [{ value: '', disabled: true }, Validators.required],
//       email: [{ value: '', disabled: true }, Validators.required],
//       month: ['', Validators.required],
//       year: ['', Validators.required],
//       discount: [''],
//       charges: [{ value: '', disabled: true }],
//       rent: [{ value: '', disabled: true }, Validators.required],
//       paidRent: ['', Validators.required],
//       totalPayable: [{ value: '', disabled: true }],
//       rentDueDate: null,
//       datePaid: ['', Validators.required],
//       previousBalance: [{ value: '', disabled: true }],
//       remainingBalance: [{ value: '', disabled: true }],
//       chequeNo: [''],
//       chequeImage: [''],
//       bankName: [''],
//       comments: [''],
//       maintenanceFee: [{ value: '', disabled: true }],
//       lateFee: [''],
//       garageFee: [{ value: '', disabled: true }],
//       storageSpaceFee: [{ value: '', disabled: true }],
//       fuelCharges: [{ value: '', disabled: true }],
//       internetFee: [{ value: '', disabled: true }],
//     });

//     this.incomeForm = this.fb.group({
//       incomeType: '',
//       amount: '',
//       dateOfIncome: '',
//       remarks: ''
//     });

//     this.monthlyRentForm = this.fb.group({
//       building: ['', Validators.required],
//       unitNo: ['', Validators.required],
//       propertyType: [{ value: '', disabled: true }],
//       unitType: [{ value: '', disabled: true }],
//       tenantName: [{ value: '', disabled: true }, Validators.required],
//       leaseId: [{ value: '', disabled: true }, Validators.required],
//       month: ['', Validators.required],
//       year: ['', Validators.required],
//       rent: [{ value: '', disabled: true }, Validators.required],
//       totalPayable: [{ value: '', disabled: true }],
//       rentDueDate: [{ value: '', disabled: true }],
//       previousBalance: [{ value: '', disabled: true }],
//       maintenanceFee: [{ value: '', disabled: true }],
//       garageFee: [{ value: '', disabled: true }],
//       storageSpaceFee: [{ value: '', disabled: true }],
//       fuelCharges: [{ value: '', disabled: true }],
//       internetFee: [{ value: '', disabled: true }]
//     });

//   }
//   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//   companyTypeOptions = [{ value: 'Admin' }, { value: 'Owner' }];

//   cityOptions = [{ value: 'Bronx' }, { value: 'Brooklyn' }, { value: 'Manhattan' }, { value: 'Queens' }, { value: 'State Island' }];

//   propertyOptions = [{ value: 'Co-op Apartments' }, { value: 'Condos' }, { value: 'Residential' }, { value: 'Commercial' }, { value: 'Residential/Commercial' }];

//   unitTypeOptions = [{ value: 'Apartment' }, { value: 'Studio' }, { value: 'Office' }, { value: 'Commercial' }];

//   unitNoOptions = [{ value: '1L' }, { value: '1R' }, { value: '2L' }, { value: '2R' }, { value: '3L' }, { value: '3R' }, { value: '4L' }, { value: '4R' }];

//   yearOptions = [{ value: '2018' }, { value: '2019' }, { value: '2020' }, { value: '2021' }, { value: '2022' }, { value: '2023' }];

//   monthOptions = [{ value: 'January' }, { value: 'Febuary' }, { value: 'March' }, { value: 'April' }, { value: 'May' }, { value: 'June' },
//   { value: 'July' }, { value: 'August' }, { value: 'September' }, { value: 'October' }, { value: 'November' }, { value: 'December' }];



//   /////////////////////////////////------ADDING DATA TO FIRESTORE------///////////////////////////////////

//   onBuildingDropDown(event: Event) {

//     this.selectedBuildingId = (event.target as HTMLSelectElement).value;
//     // console.log('building dropdown id: ', this.selectedBuildingId);

//     this.selectedBuilding = this.localArray_home.filter(data => data.address.toLowerCase() === this.selectedBuildingId.toLowerCase());
//     this.extractedBuildingId = this.selectedBuilding[0].id;
//     // console.log('extractedBuildingId', this.extractedBuildingId);

//   }

//   onBuildingDropDownForUnit(event: Event) {

//     this.selectedBuildingId = (event.target as HTMLSelectElement).value;
//     this.selectedBuilding = this.localArray_home.filter(data => data.address.toLowerCase() === this.selectedBuildingId.toLowerCase());
//     this.extractedBuildingId = this.selectedBuilding[0].id;
//     this.unitDataForm.patchValue({ propertyType: this.selectedBuilding[0].propertyType });
//   }



//   // Handle dropdown selection/change
//   onAddressDropDown(event: Event) {
//     this.selectedBuildingId = (event.target as HTMLSelectElement).value;
//     this.selectedBuilding = this.localArray_company.find(data => data.address === this.selectedBuildingId);
//     // console.log('selectedBuilding', this.selectedBuilding);

//     // Patch the values to the form controls
//     this.patchFormValues(this.selectedBuilding);
//   }

//   // Function to patch the values to the Building form controls
//   patchFormValues(building: any) {
//     this.buildingDataForm.patchValue({
//       owner: building?.owner || '',
//       companyName: building?.companyName || '',
//       city: building?.city || '',
//       state: building?.state || '',
//       zip: building?.zip || ''
//     });
//   }

//   addBuildingDataToFirestore() { //add building form values in building modal

//     const formValue = this.buildingDataForm.value;
//     const lowercaseAddress = formValue.address.toLowerCase(); // Convert formValue.address to lowercase

//     if (this.checkAddress.some(address => address.toLowerCase() === lowercaseAddress)) {
//       alert('Building already exists. Please change the building address.');
//     } else {
//       const userObject = { ...formValue, id: this.firestore.createId() };

//       // Manually add the disabled fields to the Firestore data
//       userObject.owner = this.buildingDataForm.get('owner').value;
//       userObject.companyName = this.buildingDataForm.get('companyName').value;
//       userObject.city = this.buildingDataForm.get('city').value;
//       userObject.state = this.buildingDataForm.get('state').value;
//       userObject.zip = this.buildingDataForm.get('zip').value;
//       this.ApiService.addBuilding(userObject);
//       console.log('userObject:', userObject);
//     }
//     this.resetBuildingForm();

//   }


//   checkUnitNoExistInUnitArr() {
//     const enteredUnitNo = this.unitDataForm.get('unitNo').value;
//     this.unitNoExist = this.selectedBuilding.some(data => {
//       return data.unitDetails?.some(unit => unit.unitNo === enteredUnitNo);
//     });
//   }

//   addUnitDataToFirestore() { // unit form modal to firestore
//     const unitObject = this.unitDataForm.value;
//     const finalUnitObject = {
//       ...unitObject, unitId: this.firestore.createId(),
//       buildingId: this.extractedBuildingId,
//       building: this.selectedBuilding[0].address,
//       propertyType: this.selectedBuilding[0].propertyType
//     };

//     if (this.unitNoExist) {
//       alert('This unit already exist.');
//     } else {
//       this.ApiService.updateUnitToBuilding(finalUnitObject, this.extractedBuildingId);
//     }

//     this.resetUnitForm();
//   }

//   formatDate(getDate) {
//     const parsedDate = new Date(getDate);
//     return `${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}/${parsedDate.getDate().toString().padStart(2, '0')}/${parsedDate.getFullYear()}`;
//   }

//   addLeasetoFirestore() { // add lease button method in lease modal
//     const leaseObject = this.leaseForm.value;
//     leaseObject.leaseStartDate = this.formatDate(this.leaseForm.get('leaseStartDate').value);
//     leaseObject.leaseEndDate = this.formatDate(this.leaseForm.get('leaseEndDate').value);


//     const filteredLeaseObjects = this.localArray_lease.filter(element => {
//       return element.building.toLowerCase() === leaseObject.building.toLowerCase();
//     });

//     const unitExist = filteredLeaseObjects.some(element => {
//       return element.unitNo.toLowerCase() === leaseObject.unitNo.toLowerCase();
//     });

//     if (!unitExist) {
//       const buildingId = this.extractedBuildingId;
//       const legalRent = this.leaseForm.get('legalRent').value;
//       const unitType = this.leaseForm.get('unitType').value;
//       const propertyType = this.leaseForm.get('propertyType').value;

//       if (buildingId && legalRent && unitType) {
//         // leaseObject.id = this.firestore.createId();
//         const leaseId = this.generateLeaseId(); // Generate the lease ID
//         leaseObject.id = leaseId;
//         leaseObject.maintenanceFee = this.leaseForm.get('maintenanceFee').value;
//         leaseObject.garageFee = this.leaseForm.get('garageFee').value;
//         leaseObject.storageSpaceFee = this.leaseForm.get('storageSpaceFee').value;
//         leaseObject.fuelCharges = this.leaseForm.get('fuelCharges').value;
//         leaseObject.internetFee = this.leaseForm.get('internetFee').value;
//         leaseObject.state = this.leaseForm.get('state').value;
//         leaseObject.buildingId = buildingId;
//         leaseObject.legalRent = legalRent;
//         leaseObject.unitType = unitType;
//         leaseObject.propertyType = propertyType;

//         this.ApiService.addLease(leaseObject);
//       } else {
//         alert('Please fill in all the required fields.');
//       }
//     } else {
//       alert('Lease Already Exist for this Unit.');
//     }

//     this.leaseForm.reset();
//   }

//   generateLeaseId() {
//     const prefix = 'AMMS-';
//     const existingLeaseIds = this.localArray_lease.map(element => element.id);
//     let maxNumber = 0;

//     for (const leaseId of existingLeaseIds) {
//       if (leaseId.startsWith(prefix)) {
//         const numberPart = parseInt(leaseId.slice(prefix.length), 10);
//         if (!isNaN(numberPart) && numberPart > maxNumber) {
//           maxNumber = numberPart;
//         }
//       }
//     }

//     const newNumber = maxNumber + 1;
//     return prefix + newNumber;
//   }

//   tenantOptions(event: Event) {
//     this.selectedUnitNo = (event.target as HTMLSelectElement).value;
//     this.mySelectedIndexFilter = this.localArray_home.filter(data => data.id === this.extractedBuildingId);
//     this.mySelectedIndexFilter.map(items => this.unitOptionsArray = items.unitDetails);

//     this.selectedTenantObj = this.localArray_lease.find(data =>
//       data.buildingId === this.extractedBuildingId && data.unitNo.toLowerCase() === this.selectedUnitNo.toLowerCase()
//     );

//     this.selectedRentArray = this.localArray_rent.filter(data =>
//       data.building === this.selectedBuildingId && data.unitNo.toLowerCase() === this.selectedUnitNo.toLowerCase()
//     );

//     this.rentForm.get('year').valueChanges.subscribe(year => {
//       this.selectedYearUpdate = year;


//       this.selectedRentArray = this.selectedRentArray?.filter(data => data?.year === this.selectedYearUpdate);

//       const compareMonths = (a, b) => {
//         const months = this.monthOptions.map(months => months.value);
//         const monthA = months.indexOf(a.month);
//         const monthB = months.indexOf(b.month);
//         return monthA - monthB;
//       };

//       this.selectedRentArray?.sort(compareMonths);

//       this.selectedRentObj = this.selectedRentArray[this.selectedRentArray.length - 1];

//       this.updateFormValues();

//     });

//     this.rentForm.get('rentDueDate').valueChanges.subscribe(rentDueDate => {
//       this.validateRentDueDate(rentDueDate, this.localArray_rent);
//     });
//   }

//   updateFormValues() {

//     if (this.selectedTenantObj || this.selectedRentObj) {
//       this.rentForm.patchValue({
//         tenantName: this.selectedTenantObj?.firstName + ' ' + this.selectedTenantObj?.lastName,
//         leaseId: this.selectedTenantObj?.id,
//         propertyType: this.selectedTenantObj?.propertyType,
//         unitType: this.selectedTenantObj?.unitType,
//         maintenanceFee: this.selectedTenantObj?.maintenanceFee || 0,
//         garageFee: this.selectedTenantObj?.garageFee || 0,
//         rent: this.selectedTenantObj?.legalRent || 0,
//         storageSpaceFee: this.selectedTenantObj?.storageSpaceFee || 0,
//         fuelCharges: this.selectedTenantObj?.fuelCharges || 0,
//         internetFee: this.selectedTenantObj?.internetFee || 0,
//         previousBalance: this.selectedRentObj?.remainingBalance || 0,
//       });

//       this.calculateTotalPayable();
//       this.rentForm.get('lateFee').valueChanges.subscribe(() => {
//         this.calculateTotalPayable();
//       });
//     }
//     this.dataSharingService.setPreviousBalanceValue(this.selectedRentObj?.remainingBalance || 0);
//   }

//   calculateTotalPayable() {
//     const lateFee = this.rentForm.get('lateFee').value || 0;
//     const discount = this.rentForm.get('discount').value || 0;
//     const totalPayable = (
//       Number(this.selectedTenantObj?.maintenanceFee || 0) +
//       Number(this.selectedTenantObj?.garageFee || 0) +
//       Number(this.selectedTenantObj?.storageSpaceFee || 0) +
//       Number(this.selectedTenantObj?.fuelCharges || 0) +
//       Number(this.selectedTenantObj?.internetFee || 0) +
//       Number(this.selectedTenantObj?.legalRent || 0) +
//       Number(this.selectedRentObj?.remainingBalance || 0) +
//       Number(lateFee)) - discount;

//     this.rentForm.get('totalPayable').setValue(totalPayable);
//   }

//   calculateRentDueDate(event: any) {
//     if (event === 'monthlyRent') {
//       this.month = this.getMonthValue(this.monthlyRentForm.get('month').value);
//       this.year = this.monthlyRentForm.get('year').value;
//     } else if (event === 'rent') {
//       this.month = this.getMonthValue(this.rentForm.get('month').value);
//       this.year = this.rentForm.get('year').value;
//     }

//     // Check if both month and year are selected
//     if (this.month !== null && this.year !== null) {
//       const rentDueDate = new Date(this.year, this.month - 1, 1);
//       const formattedRentDueDate = `${(rentDueDate.getMonth() + 1).toString().padStart(2, '0')}/${rentDueDate.getDate().toString().padStart(2, '0')}/${rentDueDate.getFullYear()}`;

//       if (event === 'monthlyRent') {
//         this.monthlyRentForm.patchValue({ rentDueDate: formattedRentDueDate });
//       } else if (event === 'rent') {
//         this.rentForm.patchValue({ rentDueDate: formattedRentDueDate });
//       }
//     } else {
//       if (event === 'monthlyRent') {
//         this.monthlyRentForm.patchValue({ rentDueDate: null });
//       } else if (event === 'rent') {
//         this.rentForm.patchValue({ rentDueDate: null });
//       }
//     }
//     console.log('Month:', this.month);
//   }

//   getMonthValue(month: string): number | null {
//     const monthMap: { [key: string]: number } = {
//       January: 1,
//       Febuary: 2,
//       March: 3,
//       April: 4,
//       May: 5,
//       June: 6,
//       July: 7,
//       August: 8,
//       September: 9,
//       October: 10,
//       November: 11,
//       December: 12,
//     };
//     console.log('Month from form control:', month);
//     return monthMap[month] || null;
//   }

//   calculateLateFee() {
//     const rentDueDate = this.rentForm.get('rentDueDate').value;
//     const datePaid = this.rentForm.get('datePaid').value;

//     if (rentDueDate && datePaid) {
//       const rentDueDateParts = rentDueDate.split('/');
//       const dueYear = parseInt(rentDueDateParts[2], 10);
//       const dueMonth = parseInt(rentDueDateParts[0], 10);

//       this.formatedDatePaid = this.datePipe.transform(datePaid, 'MM/dd/yyyy');
//       const datePaidParts = this.formatedDatePaid.split('/');
//       const paidYear = parseInt(datePaidParts[2], 10);
//       const paidMonth = parseInt(datePaidParts[0], 10);
//       const paidDay = parseInt(datePaidParts[1], 10);

//       if (paidYear > dueYear || (paidYear === dueYear && paidMonth > dueMonth) || (paidYear === dueYear && paidMonth === dueMonth && paidDay > 9)) {
//         this.rentForm.patchValue({ lateFee: 50 });
//       } else {
//         this.rentForm.patchValue({ lateFee: 0 });
//       }
//     }

//   }

//   ///////////////////////////---Monthly Rent Invoice Methods---//////////////////////
//   unitDropDown(event: Event) {
//     this.selectedUnitNo = (event.target as HTMLSelectElement).value;
//     this.mySelectedIndexFilter = this.localArray_home.filter(data => data.id === this.extractedBuildingId);
//     this.mySelectedIndexFilter.map(items => this.unitOptionsArray = items.unitDetails);

//     this.selectedTenantObj = this.localArray_lease.find(data =>
//       data.buildingId === this.extractedBuildingId && data.unitNo.toLowerCase() === this.selectedUnitNo.toLowerCase()
//     );

//     this.selectedRentArray = this.localArray_rent.filter(data =>
//       data.building === this.selectedBuildingId && data.unitNo.toLowerCase() === this.selectedUnitNo.toLowerCase()
//     );

//     const selectedYear = this.monthlyRentForm.get('year').value;
//     this.selectedRentArray = this.selectedRentArray?.filter(data => data?.year === selectedYear);

//     const compareMonths = (a, b) => {
//       const months = this.monthOptions.map(months => months.value);
//       const monthA = months.indexOf(a.month);
//       const monthB = months.indexOf(b.month);
//       return monthA - monthB;
//     };

//     this.selectedRentArray?.sort(compareMonths);

//     this.selectedRentObj = this.selectedRentArray[this.selectedRentArray.length - 1];

//     this.monthlyRentForm.get('rentDueDate').valueChanges.subscribe(rentDueDate => {
//       this.validateRentDueDate(rentDueDate, this.localArray_monthlyRents);
//     });

//     if (this.selectedTenantObj || this.selectedRentObj) {
//       this.monthlyRentForm.patchValue({
//         tenantName: this.selectedTenantObj?.firstName + ' ' + this.selectedTenantObj?.lastName,
//         leaseId: this.selectedTenantObj?.id,
//         propertyType: this.selectedTenantObj?.propertyType,
//         unitType: this.selectedTenantObj?.unitType,
//         maintenanceFee: this.selectedTenantObj?.maintenanceFee || 0,
//         garageFee: this.selectedTenantObj?.garageFee || 0,
//         rent: this.selectedTenantObj?.legalRent || 0,
//         storageSpaceFee: this.selectedTenantObj?.storageSpaceFee || 0,
//         fuelCharges: this.selectedTenantObj?.fuelCharges || 0,
//         internetFee: this.selectedTenantObj?.internetFee || 0,
//         previousBalance: this.selectedRentObj?.remainingBalance || 0,
//       });

//       this.totalPayableForMonthlyRent();
//     }
//   }

//   validateRentDueDate(rentDueDate, dataArray) {

//     const checkOldInvoice = dataArray.some(data => data.leaseId === this.selectedTenantObj.id && data.rentDueDate === rentDueDate);
//     const leaseStartDate = new Date(this.selectedTenantObj.leaseStartDate);
//     const leaseEndDate = new Date(this.selectedTenantObj.leaseEndDate);
//     const formattedRentDueDate = new Date(rentDueDate);

//     if (!checkOldInvoice) {
//       this.isInvoiceExist = false;

//       if (formattedRentDueDate >= leaseStartDate && formattedRentDueDate <= leaseEndDate) {
//         this.isMonthYearValid = true;
//       } else {
//         this.isMonthYearValid = false;
//       }
//     } else {
//       this.isInvoiceExist = true;
//       this.isMonthYearValid = false;
//     }
//   }


//   totalPayableForMonthlyRent() {
//     const totalPayable = (
//       Number(this.selectedTenantObj?.maintenanceFee || 0) +
//       Number(this.selectedTenantObj?.garageFee || 0) +
//       Number(this.selectedTenantObj?.storageSpaceFee || 0) +
//       Number(this.selectedTenantObj?.fuelCharges || 0) +
//       Number(this.selectedTenantObj?.internetFee || 0) +
//       Number(this.selectedTenantObj?.legalRent || 0) +
//       Number(this.selectedRentObj?.remainingBalance || 0)
//     )

//     this.monthlyRentForm.get('totalPayable').setValue(totalPayable);
//   }

//   createMonthlyRent() { //For Single Rent Modal
//     let rentObject = this.monthlyRentForm.value;
//     const totalPayable = this.monthlyRentForm.get('totalPayable').value;
//     rentObject['totalPayable'] = totalPayable;
//     rentObject['previousBalance'] = this.monthlyRentForm.get('previousBalance').value;
//     rentObject['leaseId'] = this.selectedTenantObj.id;
//     rentObject['id'] = this.firestore.createId();
//     rentObject['propertyType'] = this.selectedTenantObj?.propertyType;
//     rentObject['unitType'] = this.selectedTenantObj?.unitType;
//     rentObject['tenantName'] = this.monthlyRentForm.get('tenantName').value;
//     rentObject['rentDueDate'] = this.monthlyRentForm.get('rentDueDate').value;
//     rentObject['rent'] = this.monthlyRentForm.get('rent').value;
//     rentObject['maintenanceFee'] = this.monthlyRentForm.get('maintenanceFee').value;
//     rentObject['garageFee'] = this.monthlyRentForm.get('garageFee').value;
//     rentObject['storageSpaceFee'] = this.monthlyRentForm.get('storageSpaceFee').value;
//     rentObject['fuelCharges'] = this.monthlyRentForm.get('fuelCharges').value;
//     rentObject['internetFee'] = this.monthlyRentForm.get('internetFee').value;
//     this.ApiService.createMonthlyRent(rentObject);
//     this.resetRentForm();
//   }


//   onChequeImageChange(event: any) {
//     const file = event.target.files[0];

//     // Convert the selected image file to Base64 string
//     this.getBase64(file).then((base64String: string) => {
//       this.rentForm.get('chequeImage').setValue(base64String);

//     });
//   }

//   getBase64(file: File): Promise<string> { // Function to convert a File to Base64 string
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);

//       reader.onload = () => {
//         const base64String = reader.result as string;
//         resolve(base64String);
//       };

//       reader.onerror = (error) => reject(error);
//     });
//   }

//   // Function to clear the cheque image input field
//   clearChequeImageInput() {
//     const inputElement: HTMLInputElement = document.getElementById('chequeImageInput') as HTMLInputElement;
//     if (inputElement) {
//       inputElement.value = '';
//     }
//   }

//   // createRent() {
//   //   const rentArray = [];
//   //   const rentDueDateStr = this.rentForm.get('rentDueDate').value;
//   //   const rentDueDate = new Date(rentDueDateStr);
//   //   const month = rentDueDate.getMonth() + 1;
//   //   const year = rentDueDate.getFullYear();
//   //   const formattedRentDueDate = `${(rentDueDate.getMonth() + 1).toString().padStart(2, '0')}/${rentDueDate.getDate().toString().padStart(2, '0')}/${rentDueDate.getFullYear()}`;

//   //   // -------------------------------------------------------------------------------------
//   //   this.localArray_lease.forEach((selectedLeaseObj) => {

//   //     //Rent array
//   //     this.selectedRentArray = this.localArray_rent.filter(data =>
//   //       data.leaseId === selectedLeaseObj.id);
//   //     this.selectedRentArray = this.selectedRentArray?.filter(data => data?.year === year);
//   //     const compareMonths = (a, b) => {
//   //       const months = this.monthOptions.map(months => months.value);
//   //       const monthA = months.indexOf(a.month);
//   //       const monthB = months.indexOf(b.month);
//   //       return monthA - monthB;
//   //     };
//   //     this.selectedRentArray?.sort(compareMonths);
//   //     this.selectedRentObj = this.selectedRentArray[this.selectedRentArray.length - 1];
//   //     this.selectedRentObj = this.localArray_rent[0];
//   //     //

//   //     // -------------------------------------------------------------------------------------

//   //     let rentObject = this.rentForm.value;

//   //     const previousBalance = this.selectedRentObj?.remainingBalance || 0;

//   //     const tenantName = selectedLeaseObj.firstName + selectedLeaseObj.lastName

//   //     const lateFee = this.rentForm.get('lateFee').value || 0;

//   //     const totalPayable = (
//   //       Number(selectedLeaseObj?.maintenanceFee || 0) +
//   //       Number(selectedLeaseObj?.garageFee || 0) +
//   //       Number(selectedLeaseObj?.storageSpaceFee || 0) +
//   //       Number(selectedLeaseObj?.fuelCharges || 0) +
//   //       Number(selectedLeaseObj?.internetFee || 0) +
//   //       Number(selectedLeaseObj?.legalRent || 0) +
//   //       Number(previousBalance || 0) +
//   //       Number(lateFee));

//   //     rentObject['rentDueDate'] = formattedRentDueDate;
//   //     rentObject['building'] = selectedLeaseObj.building;
//   //     rentObject['unitNo'] = selectedLeaseObj.unitNo;
//   //     rentObject['propertyType'] = selectedLeaseObj.propertyType;
//   //     rentObject['unitType'] = selectedLeaseObj.unitType;
//   //     rentObject['tenantName'] = tenantName;
//   //     rentObject['leaseId'] = selectedLeaseObj.id;
//   //     rentObject['month'] = month;
//   //     rentObject['year'] = year;
//   //     rentObject['discount'] = selectedLeaseObj?.discount || 0;
//   //     rentObject['charges'] = selectedLeaseObj?.charges || 0;
//   //     rentObject['rent'] = selectedLeaseObj.legalRent;
//   //     rentObject['paidRent'] = selectedLeaseObj?.paidRent || 0;
//   //     rentObject['totalPayable'] = totalPayable;
//   //     rentObject['chequeNo'] = '';
//   //     rentObject['bankName'] = '';
//   //     rentObject['comments'] = '';
//   //     rentObject['maintenanceFee'] = selectedLeaseObj?.maintenanceFee || 0;
//   //     rentObject['lateFee'] = lateFee;
//   //     rentObject['garageFee'] = selectedLeaseObj.garageFee;
//   //     rentObject['storageSpaceFee'] = selectedLeaseObj.storageSpaceFee;
//   //     rentObject['fuelCharges'] = selectedLeaseObj.fuelCharges;
//   //     rentObject['internetFee'] = selectedLeaseObj.internetFee;
//   //     rentObject['totalPayablePlusDiscount'] = '';
//   //     rentObject['id'] = this.firestore.createId();
//   //     rentObject['datePaid'] = '';

//   //     rentObject['previousBalance'] = previousBalance;
//   //     rentObject['remainingBalance'] = totalPayable;

//   //     rentArray.push(rentObject);
//   //   });
//   //   debugger

//   //   this.ApiService.addBatchRent(rentArray);
//   //   this.resetRentForm();
//   // }

//   createRent() {

//     const rentArray = [];
//     const rentDueDateStr = this.rentForm.get('rentDueDate').value;

//     if (!rentDueDateStr) {
//       this.toastr.error('Please select a valid Rent Due Date.', 'Error', {
//         timeOut: 2000,
//         progressBar: true,
//         closeButton: true
//       });
//       return; // Exit the method if rentDueDateStr is empty
//     }

//     const rentDueDate = moment.tz(rentDueDateStr, 'America/New_York');
//     const month = rentDueDate.month() + 1;
//     let monthName = '';
//     if (month >= 1 && month <= 12) {
//       monthName = this.monthOptions[month - 1].value;
//       console.log(monthName);
//     }
//     const year = rentDueDate.year().toString();
//     const formattedRentDueDate = `${(rentDueDate.month() + 1).toString().padStart(2, '0')}/${rentDueDate.date().toString().padStart(2, '0')}/${rentDueDate.year()}`;

//     this.localArray_lease.forEach((selectedLeaseObj) => {
//       // Check if the leaseId and rentDueDate already exist in localArray_rent
//       this.isAlreadyAdded = this.localArray_rent.some((data) => {
//         return data.leaseId === selectedLeaseObj.id && data.rentDueDate === formattedRentDueDate;
//       });

//       if (!this.isAlreadyAdded) {
//         // Get the corresponding rent object for the selected lease
//         const selectedRentObj = this.localArray_rent
//           .filter(data => data.leaseId === selectedLeaseObj.id && data.year === year)
//           .sort((a, b) => this.monthOptions.findIndex(mo => mo.value === a.month) - this.monthOptions.findIndex(mo => mo.value === b.month))
//           .pop(); // Get the last item after sorting

//         const previousBalance = selectedRentObj?.remainingBalance || 0;
//         const tenantName = selectedLeaseObj.firstName + ' ' + selectedLeaseObj.lastName;
//         const lateFee = this.rentForm.get('lateFee').value || 0;

//         const totalPayable = (
//           Number(selectedLeaseObj?.maintenanceFee || 0) +
//           Number(selectedLeaseObj?.garageFee || 0) +
//           Number(selectedLeaseObj?.storageSpaceFee || 0) +
//           Number(selectedLeaseObj?.fuelCharges || 0) +
//           Number(selectedLeaseObj?.internetFee || 0) +
//           Number(selectedLeaseObj?.legalRent || 0) +
//           Number(previousBalance || 0) +
//           Number(lateFee)
//         );

//         const rentObject: any = {}; // Replace 'any' with the type of 'Model' if available
//         rentObject['rentDueDate'] = formattedRentDueDate;
//         rentObject['building'] = selectedLeaseObj.building;
//         rentObject['unitNo'] = selectedLeaseObj.unitNo;
//         rentObject['propertyType'] = selectedLeaseObj.propertyType;
//         rentObject['unitType'] = selectedLeaseObj.unitType;
//         rentObject['mobile'] = selectedLeaseObj.mobile;
//         rentObject['tenantName'] = tenantName;
//         rentObject['leaseId'] = selectedLeaseObj.id;
//         rentObject['leaseStartDate'] = selectedLeaseObj.leaseStartDate;
//         rentObject['leaseEndDate'] = selectedLeaseObj.leaseEndDate;
//         rentObject['email'] = selectedLeaseObj.email;
//         rentObject['month'] = monthName;
//         rentObject['year'] = year;
//         rentObject['discount'] = selectedLeaseObj?.discount || 0;
//         rentObject['charges'] = selectedLeaseObj?.charges || 0;
//         rentObject['rent'] = selectedLeaseObj.legalRent;
//         rentObject['paidRent'] = selectedLeaseObj?.paidRent || 0;
//         rentObject['totalPayable'] = totalPayable;
//         rentObject['chequeNo'] = '';
//         rentObject['bankName'] = '';
//         rentObject['comments'] = '';
//         rentObject['maintenanceFee'] = selectedLeaseObj?.maintenanceFee || 0;
//         rentObject['lateFee'] = lateFee;
//         rentObject['garageFee'] = selectedLeaseObj?.garageFee || 0;
//         rentObject['storageSpaceFee'] = selectedLeaseObj?.storageSpaceFee || 0;
//         rentObject['fuelCharges'] = selectedLeaseObj?.fuelCharges || 0;
//         rentObject['internetFee'] = selectedLeaseObj?.internetFee || 0;
//         rentObject['totalPayablePlusDiscount'] = '';
//         rentObject['id'] = this.firestore.createId();
//         rentObject['datePaid'] = '';
//         rentObject['previousBalance'] = previousBalance;
//         rentObject['remainingBalance'] = totalPayable;

//         rentArray.push(rentObject);
//       }
//     });
//     if (rentArray.length > 0 && year !== '1970') {

//       this.ApiService.addBatchRent(rentArray);
//       this.year = year;
//       this.monthName = monthName;
//       this.toastr.success(`${rentArray.length} Rents created for ${monthName} - ${year}`, 'Success', {
//         timeOut: 2000, // Time to show the toaster message (in milliseconds)
//         progressBar: true,
//         closeButton: true
//       });

//     } else if (rentArray.length === 0 || this.isAlreadyAdded) {

//       this.toastr.error('Rent Already Created.', 'Error', {
//         timeOut: 2000,
//         progressBar: true,
//         closeButton: true
//       });
//     }
//     else {
//       this.toastr.error('Something went wrong, please try again.', 'Error', {

//         timeOut: 2000,
//         progressBar: true,
//         closeButton: true
//       });
//     }
//     this.resetRentForm();

//   }

//   addRenttoFirestore() {
//     let rentObject = this.rentForm.value;

//     const discount = this.rentForm.get('discount').value || 0;
//     const totalPayable = this.rentForm.get('totalPayable').value;
//     rentObject['totalPayablePlusDiscount'] = totalPayable + discount;
//     rentObject['totalPayable'] = totalPayable;
//     rentObject['discount'] = discount;
//     rentObject['leaseId'] = this.selectedTenantObj.id;
//     rentObject['email'] = this.selectedTenantObj.email;
//     rentObject['rentId'] = this.firestore.createId();
//     rentObject['propertyType'] = this.selectedTenantObj?.propertyType;
//     rentObject['unitType'] = this.selectedTenantObj?.unitType;
//     rentObject['tenantName'] = this.rentForm.get('tenantName').value;
//     rentObject['rentDueDate'] = this.rentForm.get('rentDueDate').value;
//     rentObject['datePaid'] = this.formatedDatePaid;
//     rentObject['rent'] = this.rentForm.get('rent').value;
//     rentObject['remainingBalance'] = this.rentForm.get('totalPayable').value - this.rentForm.get('paidRent').value;
//     rentObject['maintenanceFee'] = this.rentForm.get('maintenanceFee').value;
//     rentObject['garageFee'] = this.rentForm.get('garageFee').value;
//     rentObject['storageSpaceFee'] = this.rentForm.get('storageSpaceFee').value;
//     rentObject['fuelCharges'] = this.rentForm.get('fuelCharges').value;
//     rentObject['internetFee'] = this.rentForm.get('internetFee').value;
//     rentObject['previousBalance'] = this.selectedRentObj?.remainingBalance || 0;

//     this.ApiService.addRent(rentObject);
//     this.resetRentForm();
//   }


//   /////////////////////////////////////////////////////////////////////////////////

//   addCompanytoFirestore() {
//     const companyObject = this.companyForm.value;
//     const addressToCheck = companyObject.address.toLowerCase(); // Convert address to lowercase for case-insensitive check

//     if (this.localArray_company.some(company => company.address.toLowerCase() === addressToCheck)) {
//       alert('Company with the same address already exists. Please change the company address.');
//     } else {
//       const id = this.firestore.createId();
//       companyObject.id = id;
//       this.ApiService.addCompany(companyObject);
//     }
//     this.resetCompanyForm();
//   }



//   ////////////////////////////////////////-------FORM CONTROL METHOD----/////////////////////////////////////////////////

//   get fRent() {
//     return this.rentForm.controls;
//   }

//   get fMonthlyRent() {
//     return this.monthlyRentForm.controls;
//   }

//   ////////////////////////////////////////-------RESET BUTTON METHOD----/////////////////////////////////////////////////
//   resetBuildingForm() {
//     this.buildingDataForm.reset();
//   }

//   resetUnitForm() {
//     this.unitDataForm.reset();
//   }

//   resetCompanyForm() {
//     this.companyForm.reset();
//   }

//   resetLeaseForm() {
//     this.leaseForm.reset();
//   }


//   resetRentForm() {
//     this.rentForm.reset();
//     this.clearChequeImageInput();
//   }

//   resetMonthlyRentForm() {
//     this.monthlyRentForm.reset();
//   }


// }
