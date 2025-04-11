import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import 'jspdf-autotable';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../services/loader.service';


@ViewChild('chequeImageModal')
@Component({
  selector: 'app-rent-payments',
  templateUrl: './rent-payments.component.html',
  styleUrls: ['./rent-payments.component.css'],
})
export class RentPaymentsComponent implements OnInit {
  @ViewChild('rentTable', { static: false }) rentTable!: ElementRef;
  searchQuery = '';
  rowDataEdited: boolean = false;
  uploadedFiles: any[] = [];
  hoveredRowIndex: number = -1;
  deleteIndexId: any;
  localArray_lease: any;
  selectedChequeImage: string = '';
  chequeImageModal: any;
  localArray_rent: any[] = [];
  filteredRents: any[] = [];
  isDataDirty: boolean = false;
  hasSearchQuery: boolean = false;
  remainingBalance: number;
  selectedMonths: { [key: string]: boolean } = {};
  editedRowIndices = [];
  monthOptions = [{ value: 'January' }, { value: 'Febuary' }, { value: 'March' }, { value: 'April' }, { value: 'May' }, { value: 'June' }, { value: 'July' }, { value: 'August' }, { value: 'September' }, { value: 'October' }, { value: 'November' }, { value: 'December' }];
  dropdownOpen: boolean;
  noRecordsFound: boolean = false;
  showMoreOptions: boolean = false;
  isCoopApartment: boolean;

  constructor(
    public ApiService: ApiService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.getRentData();
  }
  
  getRentData() {
    this.ApiService.getRentAPI().subscribe((fireBaseData: any) => {
      this.localArray_rent = fireBaseData;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.filteredRents = this.localArray_rent;
    this.hasSearchQuery = false; // Reset to false when filters are reset
    this.resetTable();
    this.selectedMonths = {};
    this.closeDropdown();
    }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMoreOptions() {
    this.showMoreOptions = !this.showMoreOptions;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  resetTable() {
    if (this.isDataDirty && confirm('Are you sure you want to discard unsaved changes?')) {
      this.isDataDirty = false;
      this.filteredRents = this.localArray_rent.map(data => ({ ...data, edited: false }));
    }
  }

  searchButton() {
    this.loaderService.showLoader('master');
    const filteredDataArr = this.localArray_rent.filter((data) =>
      data.tenantName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.building.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.unitNo.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    const selectedMonthNames = Object.keys(this.selectedMonths).filter(month => this.selectedMonths[month]);

    if (selectedMonthNames.length !== 0) {
      this.filteredRents = filteredDataArr.filter(rent => selectedMonthNames.includes(rent.month));
    } else {
      this.filteredRents = filteredDataArr;
    }

    // Check if there are no records found
    this.noRecordsFound = selectedMonthNames.length !== 0 && this.filteredRents.length === 0;
    // this.isCoopApartment = this.filteredRents[0].propertyType === 'Co-op Apartments';

    this.hasSearchQuery = filteredDataArr.length > 0;
    this.closeDropdown();
    this.sortTable(this.filteredRents);
  }

  calculateTotalPaid(): number {
    return this.filteredRents.reduce((total, data) => total + data.paidRent, 0);
  }

  calculateTotalRemaining(): number {
    return this.filteredRents.reduce(
      (total, data) => total + data.remainingBalance,
      0
    );
  }

  deleteRent(id: any) {
    this.ApiService.deleteRent(id);
    this.searchButton();
  }

  removeColumn(table: HTMLElement, columnIndex: number) {
    const rows = table.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      const th = rows[i].getElementsByTagName('th');
      if (cells.length > columnIndex) {
        cells[columnIndex].remove();
      }
      if (th.length > columnIndex) {
        th[columnIndex].remove();
      }
    }
  }

  // Sorting the table data below and update in filteredRent array
  sortTable(array) {
    this.filteredRents = array.sort((a, b) => {
      const dateA = new Date(a.rentDueDate).getTime();
      const dateB = new Date(b.rentDueDate).getTime();
      return dateB - dateA;
    });
    this.loaderService.hideLoader('master');
  }




  uploadImage(rowIndex: number) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.addEventListener('change', (event: any) => {
      this.onFileInputChange(event, rowIndex);
    });
  }

  onFileInputChange(event: any, rowIndex: number) {
    const file = event.target.files[0];
    if (file) {
      this.isDataDirty = true;
      // Convert the selected image file to Base64 string
      this.getBase64(file).then((base64String: string) => {
        // Update the chequeImage field of the corresponding row data
        this.filteredRents[rowIndex].chequeImage = base64String;
      });
    }
  }

  getBase64(file: File): Promise<string> {
    // Function to convert a File to Base64 string
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };

      reader.onerror = (error) => reject(error);
    });
  }

  getBase64ImageUrl(base64String: string): string {
    return `data:image/png;base64,${base64String}`;
  }

  /////////////////------------Save Methods------------//////////////////

  onDatePaidChange(rowIndex: number) {
    const editedRowData = this.filteredRents[rowIndex];
    if (editedRowData) {
      this.updateLateFee(editedRowData);

      // Update the corresponding entry in filteredRents
      this.filteredRents[rowIndex].datePaid = editedRowData.datePaid;
    }
    this.filteredRents[rowIndex].edited = true;
    this.isDataDirty = true;
  }

  updateLateFee(rowData: any) {
    if (rowData.datePaid) {
      const rentDueDate = new Date(rowData.rentDueDate);
      const datePaid = new Date(rowData.datePaid);
      const timeDifference = datePaid.getTime() - rentDueDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      if (daysDifference >= 10) {
        rowData.lateFee = 50;
      } else {
        rowData.lateFee = 0;
      }
    }
  }

  getTotalPayable(data: any): number {
    const rent = data?.isVacant ? 0 : parseFloat(data?.rent);
    // const rent = parseFloat(data.rent) || 0;
    const maintenanceFee = parseFloat(data.maintenanceFee) || 0;
    const lateFee = parseFloat(data.lateFee) || 0;
    const garageFee = parseFloat(data.garageFee) || 0;
    const laundryFee = parseFloat(data.laundryFee) || 0;
    const storageSpaceFee = parseFloat(data.storageSpaceFee) || 0;
    const fuelCharges = parseFloat(data.fuelCharges) || 0;
    const subletAmount = parseFloat(data.subletAmount) || 0;
    const amountAdjusted = parseFloat(data.amountAdjusted) || 0;
    const internetFee = parseFloat(data.internetFee) || 0;
    const previousBalance = parseFloat(data.previousBalance) || 0;
    const applicationFee = parseFloat(data.applicationFee) || 0;
    const transFee = parseFloat(data.transFee) || 0;
    const assessFee = parseFloat(data.assessFee) || 0;
    const moveInFee = parseFloat(data.moveInFee) || 0;
    const moveOutFee = parseFloat(data.moveOutFee) || 0;
    const returnPayment = parseFloat(data.returnPayment) || 0;
    const starVetDiscount = parseFloat(data.starVetDiscount) || 0;
    const abaitment = parseFloat(data.abaitment) || 0;
    const seniorDiscount = parseFloat(data.seniorDiscount) || 0;
    const miscCredit = parseFloat(data.miscCredit) || 0;
    const drieCredit = parseFloat(data.drieCredit) || 0;
    const discount = parseFloat(data.discount) || 0;    
    let totalPayable =
      (rent +
      maintenanceFee +
      lateFee +
      garageFee +
      laundryFee +
      storageSpaceFee +
      fuelCharges +
      internetFee +
      previousBalance +
      subletAmount +
      amountAdjusted +
      applicationFee +
      transFee +
      assessFee +
      moveInFee +
      moveOutFee +
      returnPayment ) - (discount + seniorDiscount + starVetDiscount + abaitment + miscCredit + drieCredit);
      data.isLeaseDisabled ? totalPayable = 0 : totalPayable;
    return totalPayable;
  }

  getRemainingBalance(data: any): number {
    const totalPayable = this.getTotalPayable(data);
    const paidRent = parseFloat(data.paidRent) || 0;

    this.remainingBalance = totalPayable - paidRent;
    return this.remainingBalance;
  }

  async savefilteredRents() {
    if (this.editedRowIndices.length === 0) {
      console.log('No rows were edited.');
      return;
    }
    for (const rowIndex of this.editedRowIndices) {
      const editedRowData = this.filteredRents[rowIndex];

      // Update data and Firestore
      editedRowData.remainingBalance = parseFloat(
        this.getRemainingBalance(editedRowData).toFixed(2)
      );
      editedRowData.totalPayable = parseFloat(
        this.getTotalPayable(editedRowData).toFixed(2)
      );
      editedRowData.datePaid = this.datePipe.transform(
        editedRowData.datePaid,
        'MM/dd/yyyy'
      );

      if (this.uploadedFiles[rowIndex]) {
        await this.getBase64(this.uploadedFiles[rowIndex]).then(
          (base64String: string) => {
            editedRowData.chequeImage = base64String;
          }
        );
      }

      // Update corresponding entry in filteredRents
      // this.filteredRents[rowIndex] = editedRowData;

      // Update corresponding balance amount of the next months' rents
      await this.updateNextMonthsBalance(editedRowData);
      // Update Firestore data
      await this.ApiService.updateRent(editedRowData.id, editedRowData);
      this.toastr.success(
        `Rent of Lease ID: ${editedRowData.leaseId} updated for ${editedRowData.month} - ${editedRowData.year}`,
        'Updated',
        {
          timeOut: 4000,
          progressBar: true,
          closeButton: true,
        }
      );
    }
    this.editedRowIndices = [];
    this.searchButton();
  }

  async updateNextMonthsBalance(editedRowData: any) {
    const currentMonthIndex = this.monthOptions.findIndex(
      (month) => month.value === editedRowData.month
    );
    const currentYear = editedRowData.year;

    for (let i = 1; i < this.monthOptions.length; i++) {
      const nextMonthIndex = (currentMonthIndex + i) % 12;
      const nextMonth = this.monthOptions[nextMonthIndex].value;

      // Calculate the year for the next month
      const nextYear = this.calculateNextYear(currentMonthIndex, nextMonthIndex, currentYear);

      // Filter localArray_rent to check if rents are available for the next month
      const nextMonthRent = this.filteredRents.find(
        (rent) =>
          rent.building === editedRowData.building &&
          rent.unitNo === editedRowData.unitNo &&
          rent.month === nextMonth.toString() &&
          rent.year === nextYear.toString()
      );

      // Find the data for the previous month
      const previousMonthIndex = nextMonthIndex === 0 ? 11 : nextMonthIndex - 1;
      const previousMonth = this.monthOptions[previousMonthIndex].value;
      const previousYear = nextMonthIndex === 0 ? currentYear - 1 : currentYear;
      const previousMonthRent = this.filteredRents.find(
        (rent) =>
          rent.building === editedRowData.building &&
          rent.unitNo === editedRowData.unitNo &&
          rent.month === previousMonth.toString() &&
          rent.year === previousYear.toString()
      );

      if (nextMonthRent && previousMonthRent) {
        nextMonthRent.previousBalance = previousMonthRent.remainingBalance;
        nextMonthRent.remainingBalance = this.getRemainingBalance(nextMonthRent).toFixed(2);
        nextMonthRent.totalPayable = this.getTotalPayable(nextMonthRent).toFixed(2);

        await this.ApiService.updateRent(nextMonthRent.id, nextMonthRent);
      } else {
        // Handle the case where rents for the next month are not available
        console.log(
          `Rents for the next month (${nextMonth} - ${editedRowData.year}) are not available.`
        );
      }
    }
  }
  calculateNextYear(currentMonthIndex: number, nextMonthIndex: number, currentYear: number): number {
    return nextMonthIndex < currentMonthIndex ? Number(currentYear) + 1 : currentYear;
  }

  onDataChanged(data: any, rowIndex: number) {
    data.edited = true;
    this.rowDataEdited = true;

    // Save the row index for later use
    if (data.edited) {
      if (!this.editedRowIndices.includes(rowIndex)) {
        this.editedRowIndices.push(rowIndex);
      }
    }

    this.isDataDirty = true;
  }
}
