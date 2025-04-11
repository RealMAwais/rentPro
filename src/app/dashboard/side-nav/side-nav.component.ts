import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  rentForm: FormGroup;
  singleRentForm: FormGroup;
  isMonthYearValid: boolean;
  selectedTenantObj: any;
  isInvoiceExist: boolean;
  isAlreadyAdded: boolean;
  monthOptions = [{ value: 'January' }, { value: 'Febuary' }, { value: 'March' }, { value: 'April' }, { value: 'May' }, { value: 'June' }, { value: 'July' }, { value: 'August' }, { value: 'September' }, { value: 'October' }, { value: 'November' }, { value: 'December' }];
  yearOptions = [{ value: '2022' }, { value: '2023' }];
  localArray_lease: any;
  localArray_rent: any;
  year: any;
  monthName: string;
  selectedBuildingId: string;
  selectedBuilding: any;
  localArray_home: any;
  extractedBuildingId: any;
  month: number;
  selectedUnitNo: string;
  mySelectedIndexFilter: any;
  unitOptionsArray: any;
  selectedRentArray: any;
  selectedRentObj: any;
  visibleItems: { [key: string]: boolean } = {
    dataEntry: false
  };
  filteredLeases: any[] = [];
  searchQuery: any;
  hasSearchQuery: boolean;
  isCoopApartment: boolean;
  localArray_company: any;
  selectedCompany: any;
  selectedDate: { [key: string]: string } = {};


  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private toastr: ToastrService,
    private ApiService: ApiService,
    private loaderService: LoaderService,
    private router: Router
  ) {

    this.rentForm = this.fb.group({
      building: ['', Validators.required],
      unitNo: [''],
      propertyType: [''],
      unitType: [''],
      tenantName: [''],
      leaseId: [''],
      email: [''],
      month: ['', Validators.required],
      year: [''],
      discount: [''],
      subletAmount: [''],
      rent: [''],
      paidRent: [''],
      totalPayable: [''],
      rentDueDate: null,
      datePaid: [''],
      previousBalance: [''],
      remainingBalance: [''],
      chequeNo: [''],
      chequeImage: [''],
      bankName: [''],
      comments: [''],
      maintenanceFee: [''],
      lateFee: [''],
      garageFee: [''],
      laundryFee: [''],
      storageSpaceFee: [''],
      fuelCharges: [''],
      internetFee: [''],
      amountAdjusted: [''],
      applicationFee: [''],
      transFee: [''],
      assessFee: [''],
      starVetDiscount: [''],
      abaitment: [''],
      moveInFee: [''],
      moveOutFee: [''],
      seniorDiscount: [''],
      miscCredit: [''],
      drieCredit: [''],
      returnPayment: ['']
    });

    this.singleRentForm = this.fb.group({
      building: ['', Validators.required],
      unitNo: ['', Validators.required],
      propertyType: [{ value: '', disabled: true }],
      unitType: [{ value: '', disabled: true }],
      tenantName: [{ value: '', disabled: true }, Validators.required],
      leaseId: [{ value: '', disabled: true }, Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required],
      rent: [{ value: '', disabled: true }, Validators.required],
      totalPayable: [{ value: '', disabled: true }],
      rentDueDate: [{ value: '', disabled: true }],
      previousBalance: [{ value: '', disabled: true }],
      maintenanceFee: [{ value: '', disabled: true }],
      garageFee: [{ value: '', disabled: true }],
      laundryFee: [{ value: '', disabled: true }],
      storageSpaceFee: [{ value: '', disabled: true }],
      antennaFee: [{ value: '', disabled: true }],
      internetFee: [{ value: '', disabled: true }],
      email: [''],
      discount: [''],
      subletAmount: [''],
      paidRent: [''],
      datePaid: [''],
      remainingBalance: [''],
      chequeNo: [''],
      chequeImage: [''],
      bankName: [''],
      comments: [''],
      lateFee: [''],
      fuelCharges: [''],
      amountAdjusted: [''],
      applicationFee: [''],
      transFee: [''],
      assessFee: [''],
      starVetDiscount: [''],
      abaitment: [''],
      moveInFee: [''],
      moveOutFee: [''],
      seniorDiscount: [''],
      miscCredit: [''],
      drieCredit: [''],
      returnPayment: ['']

    });

  }

  ngOnInit(): void {
    this.getAllData();
    this.getLeaseData();
    this.getRentData();
    this.getCompanyData();
  }

  getAllData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_home = fireBaseData;
    });
  }

  getLeaseData() {
    this.ApiService.getLeaseAPI().subscribe((fireBaseData: any) => {
      this.localArray_lease = fireBaseData;
    });
  }

  getRentData() {
    this.ApiService.getRentAPI().subscribe((fireBaseData: any) => {
      this.localArray_rent = fireBaseData;
    });
  }

  getCompanyData() {
    this.ApiService.getCompanyAPI().subscribe((fireBaseData: any) => {
      this.localArray_company = fireBaseData;
    });
  }

  onBuildingDropDown(event: Event) {

    this.selectedBuildingId = (event.target as HTMLSelectElement).value;
    // console.log('building dropdown id: ', this.selectedBuildingId);
    this.selectedBuilding = this.localArray_home.filter(data => data.address.toLowerCase() === this.selectedBuildingId.toLowerCase());
    this.extractedBuildingId = this.selectedBuilding[0].id;
    this.selectedCompany = this.localArray_company.find(data => data.companyName === this.selectedBuilding[0].companyName);
    // console.log('extractedBuildingId', this.extractedBuildingId);
  }

  createRent() {
    this.loaderService.showLoader('master');
    const rentDueDateStr = this.rentForm.get('rentDueDate').value;
    const building = this.rentForm.get('building').value;

    if (!rentDueDateStr || !building) {
      this.toastr.error('Please select valid option.', 'Error', {
        timeOut: 2000,
        progressBar: true,
        closeButton: true
      });
      return; // Exit the method if rentDueDateStr is empty
    }

    const rentDueDate = moment.tz(rentDueDateStr, 'America/New_York');
    const month = rentDueDate.month() + 1;
    let monthName = '';
    if (month >= 1 && month <= 12) {
      monthName = this.monthOptions[month - 1].value;
      // console.log(monthName);
    }
    const year = rentDueDate.year().toString();
    const formattedRentDueDate = `${(rentDueDate.month() + 1).toString().padStart(2, '0')}/${rentDueDate.date().toString().padStart(2, '0')}/${rentDueDate.year()}`;

    // Filter the localArray_lease based on the selected building
    const leasesForSelectedBuilding = this.localArray_lease.filter((lease) => {
      return lease.building.toLowerCase() === building.toLowerCase();
    });
    if (leasesForSelectedBuilding.length === 0) {
      this.toastr.error('No leases found for the selected building.', 'Error', {
        timeOut: 2000,
        progressBar: true,
        closeButton: true
      });
      return; // Exit if no leases found for the selected building
    }

    const rentArray = [];

    leasesForSelectedBuilding.forEach((selectedLeaseObj) => {
      // Check if the leaseId and rentDueDate already exist in rent array or lease is disabled in lease array
      if (selectedLeaseObj?.disabled && selectedLeaseObj?.isRenewed) {
        return;
      }
      this.isAlreadyAdded = this.localArray_rent.some((data) => {
        return data.leaseId === selectedLeaseObj.id && data.rentDueDate === formattedRentDueDate;
      });

      if (!this.isAlreadyAdded) {
        // Get the corresponding rent object for the selected lease
        const selectedRentObj = this.localArray_rent
          .filter(data => data.leaseId === selectedLeaseObj.id && data.year === year)
          .sort((a, b) => this.monthOptions.findIndex(mo => mo.value === a.month) - this.monthOptions.findIndex(mo => mo.value === b.month))
          .pop(); // Get the last item after sorting

        const previousBalance = Number(selectedRentObj?.remainingBalance || 0);
        const tenantName = selectedLeaseObj.firstName + ' ' + selectedLeaseObj.lastName;
        const lateFee = Number(this.rentForm.get('lateFee').value || 0);
        const amountAdjusted = Number(this.rentForm.get('amountAdjusted').value || 0);
        const applicationFee = Number(this.rentForm.get('applicationFee').value || 0);
        const transFee = Number(this.rentForm.get('transFee').value || 0);
        const assessFee = Number(this.rentForm.get('assessFee').value || 0);
        const starVetDiscount = Number(this.rentForm.get('starVetDiscount').value || 0);
        const abaitment = Number(this.rentForm.get('abaitment').value || 0);
        const moveInFee = Number(this.rentForm.get('moveInFee').value || 0);
        const moveOutFee = Number(this.rentForm.get('moveOutFee').value || 0);
        const seniorDiscount = Number(this.rentForm.get('seniorDiscount').value || 0);
        const miscCredit = Number(this.rentForm.get('miscCredit').value || 0);
        const drieCredit = Number(this.rentForm.get('drieCredit').value || 0);
        const returnPayment = Number(this.rentForm.get('returnPayment').value || 0);
        let legalRent = (selectedLeaseObj?.disabled && !selectedLeaseObj?.isRenewed) ? 0 : Number(selectedLeaseObj?.legalRent || 0);

        let totalPayable = (
          Number(selectedLeaseObj?.maintenanceFee || 0) +
          Number(selectedLeaseObj?.garageFee || 0) +
          Number(selectedLeaseObj?.laundryFee || 0) +
          Number(selectedLeaseObj?.storageSpaceFee || 0) +
          Number(selectedLeaseObj?.fuelCharges || 0) +
          Number(selectedLeaseObj?.subletAmount || 0) +
          Number(selectedLeaseObj?.internetFee || 0) +
          legalRent +
          Number(amountAdjusted) +
          Number(previousBalance) +
          Number(lateFee) +
          Number(applicationFee) +
          Number(transFee) +
          Number(assessFee) +
          // Number(starVetDiscount) +
          // Number(abaitment) +
          Number(moveInFee) +
          Number(moveOutFee) +
          // Number(seniorDiscount) +
          // Number(miscCredit) +
          // Number(drieCredit) +
          Number(returnPayment)
        ).toFixed(2);

        const rentObject: any = {
          rentDueDate: formattedRentDueDate,
          building: selectedLeaseObj.building,
          companyName: this.selectedCompany.companyName,
          unitNo: selectedLeaseObj.unitNo,
          propertyType: selectedLeaseObj.propertyType,
          unitType: selectedLeaseObj.unitType,
          mobile: selectedLeaseObj.mobile,
          tenantName: tenantName,
          leaseId: selectedLeaseObj.id,
          leaseStartDate: selectedLeaseObj.leaseStartDate,
          leaseEndDate: selectedLeaseObj.leaseEndDate,
          email: selectedLeaseObj.email,
          month: monthName,
          year: year,
          discount: (selectedLeaseObj?.discount || 0).toFixed(2),
          subletAmount: (selectedLeaseObj?.subletAmount || 0).toFixed(2),
          paidRent: (selectedLeaseObj?.paidRent || 0).toFixed(2),
          totalPayable: totalPayable,
          chequeNo: '',
          bankName: '',
          comments: '',
          maintenanceFee: (selectedLeaseObj?.maintenanceFee || 0).toFixed(2),
          lateFee: (lateFee).toFixed(2),
          garageFee: (selectedLeaseObj?.garageFee || 0).toFixed(2),
          laundryFee: (selectedLeaseObj?.laundryFee || 0).toFixed(2),
          storageSpaceFee: (selectedLeaseObj?.storageSpaceFee || 0).toFixed(2),
          fuelCharges: (selectedLeaseObj?.fuelCharges || 0).toFixed(2),
          internetFee: (selectedLeaseObj?.internetFee || 0).toFixed(2),
          totalPayablePlusDiscount: '',
          id: this.firestore.createId(),
          datePaid: '',
          previousBalance: (previousBalance).toFixed(2),
          remainingBalance: totalPayable,
          amountAdjusted: (amountAdjusted).toFixed(2),
          applicationFee: (applicationFee).toFixed(2),
          transFee: (transFee).toFixed(2),
          assessFee: (assessFee).toFixed(2),
          starVetDiscount: (starVetDiscount).toFixed(2),
          abaitment: (abaitment).toFixed(2),
          moveInFee: (moveInFee).toFixed(2),
          moveOutFee: (moveOutFee).toFixed(2),
          seniorDiscount: (seniorDiscount).toFixed(2),
          miscCredit: (miscCredit).toFixed(2),
          drieCredit: (drieCredit).toFixed(2),
          returnPayment: (returnPayment).toFixed(2),
          ...(selectedLeaseObj?.disabled && !selectedLeaseObj?.isRenewed ? { isVacant: true, rent: 0, disabledDate: selectedLeaseObj.disabledDate, comments: `VACANT on ${selectedLeaseObj.disabledDate}` } : { rent: (selectedLeaseObj?.legalRent).toFixed(2) })
        };
        rentArray.push(rentObject);
      }
    });
    this.loaderService.hideLoader('master');
    if (rentArray.length > 0 && year !== '1970') {

      this.ApiService.addBatchRent(rentArray);
      this.year = year;
      this.monthName = monthName;
      this.toastr.success(`${rentArray.length} Rents created for ${monthName} - ${year} in ${building}.`, 'Success', {
        timeOut: 5000, // Time to show the toaster message (in milliseconds)
        progressBar: true,
        closeButton: true
      });

    } else if (rentArray.length === 0 || this.isAlreadyAdded) {

      this.toastr.error(`${monthName} - ${year} Rents already created for all active leases in ${building}.`, 'Error', {
        timeOut: 5000,
        progressBar: true,
        closeButton: true
      });
    }
    else {
      this.toastr.error('Something went wrong, please try again.', 'Error', {

        timeOut: 2000,
        progressBar: true,
        closeButton: true
      });
    }
    this.resetRentForm();
  }

  resetRentForm() {
    this.rentForm.reset();
  }

  // Single Rent Modal Methods

  createSingleRent() { //For Single Rent Modal
    let rentObject = this.singleRentForm.value;
    const totalPayable = this.singleRentForm.get('totalPayable').value;
    rentObject['totalPayable'] = totalPayable;
    rentObject['previousBalance'] = this.singleRentForm.get('previousBalance').value;
    rentObject['leaseId'] = this.selectedTenantObj.id;
    rentObject['id'] = this.firestore.createId();
    rentObject['propertyType'] = this.selectedTenantObj?.propertyType;
    rentObject['unitType'] = this.selectedTenantObj?.unitType;
    rentObject['tenantName'] = this.singleRentForm.get('tenantName').value;
    rentObject['rentDueDate'] = this.singleRentForm.get('rentDueDate').value;
    rentObject['rent'] = this.singleRentForm.get('rent').value;
    rentObject['maintenanceFee'] = this.singleRentForm.get('maintenanceFee').value;
    rentObject['garageFee'] = this.singleRentForm.get('garageFee').value;
    rentObject['laundryFee'] = this.singleRentForm.get('laundryFee').value;
    rentObject['storageSpaceFee'] = this.singleRentForm.get('storageSpaceFee').value;
    rentObject['antennaFee'] = this.singleRentForm.get('antennaFee').value;
    rentObject['internetFee'] = this.singleRentForm.get('internetFee').value;
    this.ApiService.addRent(rentObject);
    this.resetSingleRentForm();
  }
  get fRent() {
    return this.singleRentForm.controls;
  }

  resetSingleRentForm() {
    this.singleRentForm.reset();
  }

  calculateRentDueDate(event: any) {
    if (event === 'monthlyRent') {
      this.month = this.getMonthValue(this.singleRentForm.get('month').value);
      this.year = this.singleRentForm.get('year').value;
    } else if (event === 'rent') {
      this.month = this.getMonthValue(this.rentForm.get('month').value);
      this.year = this.rentForm.get('year').value;
    }

    // Check if both month and year are selected
    if (this.month !== null && this.year !== null) {
      const rentDueDate = new Date(this.year, this.month - 1, 1);
      const formattedRentDueDate = `${(rentDueDate.getMonth() + 1).toString().padStart(2, '0')}/${rentDueDate.getDate().toString().padStart(2, '0')}/${rentDueDate.getFullYear()}`;

      if (event === 'monthlyRent') {
        this.singleRentForm.patchValue({ rentDueDate: formattedRentDueDate });
      } else if (event === 'rent') {
        this.rentForm.patchValue({ rentDueDate: formattedRentDueDate });
      }
    } else {
      if (event === 'monthlyRent') {
        this.singleRentForm.patchValue({ rentDueDate: null });
      } else if (event === 'rent') {
        this.rentForm.patchValue({ rentDueDate: null });
      }
    }
    console.log('Month:', this.month);
  }

  getMonthValue(month: string): number | null {
    const monthMap: { [key: string]: number } = {
      January: 1,
      Febuary: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };
    console.log('Month from form control:', month);
    return monthMap[month] || null;
  }

  unitDropDown(event: Event) {
    this.selectedUnitNo = (event.target as HTMLSelectElement).value;
    this.mySelectedIndexFilter = this.localArray_home.filter(data => data.id === this.extractedBuildingId);
    this.mySelectedIndexFilter.map(items => this.unitOptionsArray = items.unitDetails);

    this.selectedTenantObj = this.localArray_lease.find(data =>
      data.buildingId === this.extractedBuildingId && data.unitNo.toLowerCase() === this.selectedUnitNo.toLowerCase()
    );

    this.selectedRentArray = this.localArray_rent.filter(data =>
      data.building === this.selectedBuildingId && data.unitNo.toLowerCase() === this.selectedUnitNo.toLowerCase()
    );

    const selectedYear = this.singleRentForm.get('year').value;
    this.selectedRentArray = this.selectedRentArray?.filter(data => data?.year === selectedYear);

    const compareMonths = (a, b) => {
      const months = this.monthOptions.map(months => months.value);
      const monthA = months.indexOf(a.month);
      const monthB = months.indexOf(b.month);
      return monthA - monthB;
    };

    this.selectedRentArray?.sort(compareMonths);

    this.selectedRentObj = this.selectedRentArray[this.selectedRentArray.length - 1];

    this.singleRentForm.get('rentDueDate').valueChanges.subscribe(rentDueDate => {
      this.validateRentDueDate(rentDueDate, this.localArray_monthlyRents);
    });

    if (this.selectedTenantObj || this.selectedRentObj) {
      this.singleRentForm.patchValue({
        tenantName: this.selectedTenantObj?.firstName + ' ' + this.selectedTenantObj?.lastName,
        leaseId: this.selectedTenantObj?.id,
        propertyType: this.selectedTenantObj?.propertyType,
        unitType: this.selectedTenantObj?.unitType,
        maintenanceFee: this.selectedTenantObj?.maintenanceFee || 0,
        garageFee: this.selectedTenantObj?.garageFee || 0,
        laundryFee: this.selectedTenantObj?.laundryFee || 0,
        rent: this.selectedTenantObj?.legalRent || 0,
        storageSpaceFee: this.selectedTenantObj?.storageSpaceFee || 0,
        antennaFee: this.selectedTenantObj?.antennaFee || 0,
        internetFee: this.selectedTenantObj?.internetFee || 0,
        previousBalance: this.selectedRentObj?.remainingBalance || 0,
      });

      this.totalPayableForSingleRent();
    }
  }

  validateRentDueDate(rentDueDate, dataArray) {

    const checkOldInvoice = dataArray.some(data => data.leaseId === this.selectedTenantObj.id && data.rentDueDate === rentDueDate);
    const leaseStartDate = new Date(this.selectedTenantObj.leaseStartDate);
    const leaseEndDate = new Date(this.selectedTenantObj.leaseEndDate);
    const formattedRentDueDate = new Date(rentDueDate);

    if (!checkOldInvoice) {
      this.isInvoiceExist = false;

      if (formattedRentDueDate >= leaseStartDate && formattedRentDueDate <= leaseEndDate) {
        this.isMonthYearValid = true;
      } else {
        this.isMonthYearValid = false;
      }
    } else {
      this.isInvoiceExist = true;
      this.isMonthYearValid = false;
    }
  }

  localArray_monthlyRents(rentDueDate: any, localArray_monthlyRents: any) {
    throw new Error('Method not implemented.');
  }

  getMonthlyInvoiceSummary() {
    this.ApiService.getMonthlyRentsAPI().subscribe((fireBaseData: any) => {
      this.localArray_monthlyRents = fireBaseData;
    });
  }

  totalPayableForSingleRent() {
    const totalPayable = (
      Number(this.selectedTenantObj?.maintenanceFee || 0) +
      Number(this.selectedTenantObj?.garageFee || 0) +
      Number(this.selectedTenantObj?.laundryFee || 0) +
      Number(this.selectedTenantObj?.storageSpaceFee || 0) +
      Number(this.selectedTenantObj?.antennaFee || 0) +
      Number(this.selectedTenantObj?.internetFee || 0) +
      Number(this.selectedTenantObj?.legalRent || 0) +
      Number(this.selectedRentObj?.remainingBalance || 0)
    )

    this.singleRentForm.get('totalPayable').setValue(totalPayable);
  }

  toggleVisibility(item: string) {
    this.visibleItems[item] = !this.visibleItems[item];
  }

  searchLeases() {
    this.hasSearchQuery = true;
    this.filteredLeases = this.localArray_lease.filter(data =>
      data.building.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.unitNo.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.firstName.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.lastName?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.isCoopApartment = this.filteredLeases.some(data => data.propertyType === "Co-op Apartments");
    if (this.isCoopApartment) {
      this.toastr.error('Search for residential unit to update the rent.');
      return;
    }
    if (this.filteredLeases.length === 0) {
      this.toastr.error('No results found.');
    }
  }

  disableLease(leaseId: string) {
    if (leaseId) {
      const disabledDate = new Date(this.selectedDate[leaseId]).toLocaleDateString('en-US');
      this.ApiService.disableLease(leaseId, disabledDate).then(() => {
        this.searchLeases();
        this.toastr.success(`${leaseId} Lease has been disabled.`, 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }).catch((error) => {
        this.toastr.error('Error in disabling the Lease.');
      });
    }
  }

  enableLease(leaseId: string) {
    if (leaseId) {
      const enabledDate = new Date(this.selectedDate[leaseId]).toLocaleDateString('en-US');
      this.ApiService.enableLease(leaseId, enabledDate).then(() => {
        this.searchLeases();
        this.toastr.success(`${leaseId} Lease has been enabled.`, 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }).catch((error) => {
        this.toastr.error('Error in enabling the Lease.');
      });
    }
  }

  resetLeases() {
    this.hasSearchQuery = true;
    this.searchQuery = '';
    this.filteredLeases = [];
    this.selectedDate = {};
  }

  updateRent(data) {
    if (data) {
    const leaseId = data.id;
    const updatedRent = data.legalRent;
    const selectedBuildingId = data.buildingId;
    const selectedUnitNo = data.unitNo;
    const selectedBuilding = this.localArray_home.filter(data => data.id === selectedBuildingId);
    selectedBuilding.map(items => this.unitOptionsArray = items.unitDetails);
    const selectedUnit = this.unitOptionsArray.filter(data => data.unitNo === selectedUnitNo);
    selectedUnit.rent = data.rent;
      // this.updateUnitRent(selectedBuildingId, selectedUnitNo);
      this.ApiService.updateOnlyRent(leaseId, updatedRent).then(() => {
        this.searchLeases();
        this.toastr.success(`Rent of ${selectedUnitNo} has been updated in active lease.`, 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
        this.closeModal();
      }).catch((error) => {
        this.toastr.error(`Error in updating rent of ${selectedUnitNo}.`);
      });
    }
  }

  // updateUnitRent(selectedBuildingId, selectedUnitNo) {
  //   const unitDetails = [...this.mySelectedIndexFilter[0].unitDetails];
  //   const index = unitDetails.findIndex(unit => unit.unitNo === selectedUnitNo);
  //   if (index !== -1) {
  //     unitDetails[index] = userObject;
  //   }
  //   this.ApiService.updateUnit(unitDetails, selectedBuildingId).then(() => {
  //     this.toastr.success('Unit updated successfully!');
  //     this.editUnitDataForm.reset();
  //   }).catch(() => {
  //     this.toastr.error('Failed to update unit.');
  //   });
  //   this.editUnitDataForm.reset();
  // }
  
  closeModal() {
    const modalElement = document.getElementById('updateRentModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
      const modalBackdrops = document.getElementsByClassName('modal-backdrop');
      while (modalBackdrops.length > 0) {
        modalBackdrops[0].parentNode?.removeChild(modalBackdrops[0]);
        this.resetLeases();
      }
    }
  }

  openLeaseModal() {
    this.router.navigate(['/dashboard/lease-summary']).then(() => {
      setTimeout(() => {
        this.loaderService.triggerShowModal();
      }, 100); 
    });
  }

}
