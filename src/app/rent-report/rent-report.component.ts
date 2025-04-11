import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../services/api.service';
import 'jspdf-autotable';
import 'bootstrap';
import { DataSharingService } from '../services/data-sharing.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake?.vfs;
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../services/loader.service';

ViewChild('chequeImageModal')


@Component({
  selector: 'app-rent-report',
  templateUrl: './rent-report.component.html',
  styleUrls: ['./rent-report.component.css']
})

export class RentReportComponent implements OnInit {

  fileName = 'Rent-Reports.xlsx';
  totalRentPaid : any;
  totalRemainingBalance : any;
  selectedChequeImage: string = '';
  chequeImageModal: any;
  localArray_rent: any[] = [];
  filteredRents: any[] = [];
  hoveredRowIndex: number = -1;
  hasSearchQuery: boolean = false;
  pdfAttachment: any;
  noRecordsFound: boolean = false;
  showMoreOptions: boolean = false;
  dropdownOpen: boolean;
  monthOptions = [{ value: 'January' }, { value: 'Febuary' }, { value: 'March' }, { value: 'April' }, { value: 'May' }, { value: 'June' }, { value: 'July' }, { value: 'August' }, { value: 'September' }, { value: 'October' }, { value: 'November' }, { value: 'December' }];
  YearOptions = [{ value: '2022' }, { value: '2023' }, { value: '2024' }];
  selectedMonths: { [key: string]: boolean } = {};
  selectedYears: { [key: string]: boolean } = {};
  isSending: boolean = false;



  @ViewChild('stickySidebar', { static: false }) stickySidebar!: ElementRef;
  @ViewChild('rentTable', { static: false }) rentTable!: ElementRef; searchQuery = '';
  isCoopApartment: boolean;
  localArray_building: any;
  filteredBuildingObj: any;
  selectedBuilding: any;
  ownerEmail: any;
  totalPayable: any;
  totalDiscount: any;
  openYearDD: boolean;
  localArray_lease: any;

  onTableScroll(event: Event) {
    if (this.rentTable?.nativeElement && this.stickySidebar?.nativeElement) {
      const target = event.target as HTMLElement;
      this.stickySidebar.nativeElement.style.top = target.scrollTop + 'px';
    }
  }

  constructor(
    public ApiService: ApiService,
    private dataSharingService: DataSharingService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) {

  }

  ngOnInit(): void {
    this.hasSearchQuery = false;
    this.getRentData();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  toggleYearDropdown(){
    this.openYearDD = !this.openYearDD;
  }
  toggleMoreOptions() {
    this.showMoreOptions = !this.showMoreOptions;
  }

  searchButton() {
    if(this.localArray_rent.length){

  
    const filteredDataArr = this.localArray_rent.filter((data) =>
      data.tenantName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.building.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      data.unitNo.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.loaderService.showLoader('master');

    const selectedMonthNames = Object.keys(this.selectedMonths).filter(month => this.selectedMonths[month]);
    const selectedYearNames = Object.keys(this.selectedYears).filter(year => this.selectedYears[year]);

      if (selectedYearNames.length !== 0 || selectedMonthNames.length !== 0) {
        this.filteredRents = filteredDataArr.filter(rent => {
          const yearMatch = selectedYearNames.length === 0 || selectedYearNames.includes(rent.year);
          const monthMatch = selectedMonthNames.length === 0 || selectedMonthNames.includes(rent.month);
          return yearMatch && monthMatch;
        });
      } else {
        this.filteredRents = filteredDataArr;
      }

    // Check if there are no records found
    this.noRecordsFound = selectedMonthNames.length !== 0 && this.filteredRents.length === 0;
    this.isCoopApartment = this.filteredRents[0]?.propertyType === 'Co-op Apartments';

    this.hasSearchQuery = filteredDataArr.length > 0;
    this.closeDropdown();
    this.totalRentPaid = this.calculateTotalPaid().toFixed(2);
    this.totalDiscount = this.calculateTotalDiscount().toFixed(2);
    // Format mobile numbers in US format
    this.filteredRents.forEach(data => {
      if (data.mobile !== null) {
        data.mobile = data.mobile.toString(); // Convert to string
        data.mobile = this.formatPhoneNumber(data.mobile);
      }
    });
    this.sortTable(this.filteredRents);
    this.totalRemainingBalance = ((this.calculateTotalRemaining()) - Number(this.totalDiscount)).toFixed(2) || 0;
    this.getBuildingData(this.filteredRents);
  } else {
    alert('No Record Found!');
    setTimeout
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
  
  }

  resetFilters() {
    this.searchQuery = '';
    this.filteredRents = this.localArray_rent;
    this.hasSearchQuery = false; // Reset to false when filters are reset
    this.selectedMonths = {};
    this.selectedYears = {};
    this.closeDropdown();
    this.sortTable(this.filteredRents);
  }

  closeDropdown() {
    this.dropdownOpen = false;
    this.openYearDD = false;
  }

  getRentData() {
    this.ApiService.getRentAPI().subscribe((fireBaseData: any) => {
      this.localArray_rent = fireBaseData;
      this.filteredRents = this.localArray_rent;
      });
  }
  
  getBuildingData(filteredRents: any) { // method to get owner email from selected building data
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_building = fireBaseData;
      this.selectedBuilding = filteredRents[0].building;
      this.filteredBuildingObj = this.localArray_building.filter(data => data.address === this.selectedBuilding);
      this.filteredBuildingObj ? this.ownerEmail = this.filteredBuildingObj[0].ownerEmail : '';
      // console.log('filteredBuildingObj:', this.filteredBuildingObj);
      // if(this.filteredBuildingObj.length >0){
      //   this.ownerEmail = this.filteredBuildingObj[0].ownerEmail;
      // }
      // else{
      //   this.ownerEmail = this.filteredBuildingObj.email;
      // }
      // console.log('email:', this.ownerEmail);
    });
  }

  getLeaseData() {
    this.ApiService.getLeaseAPI().subscribe((fireBaseData: any) => {
      this.localArray_lease = fireBaseData;
    });
  }

  calculateTotalPaid(): number {
    return this.filteredRents.reduce((total, data) => total + (parseFloat(data.paidRent) || 0), 0);
  }  
  calculateTotalRemaining(): number {
    this.totalPayable = this.filteredRents.reduce((total, data) => {
      const entryTotalPayable =
        // Number(data.discount || 0) +
        Number(data.maintenanceFee || 0) +
        Number(data.rent || 0) +
        Number(data.returnPayment || 0) +
        Number(data.garageFee || 0) +
        Number(data.laundryFee || 0) +
        Number(data.storageSpaceFee || 0) +
        Number(data.fuelCharges || 0) +
        Number(data.subletAmount || 0) +
        Number(data.internetFee || 0) +
        Number(data.legalRent || 0) +
        Number(data.amountAdjusted || 0) +
        Number(data.lateFee || 0) +
        Number(data.applicationFee || 0) +
        Number(data.transFee || 0) +
        Number(data.assessFee || 0) +
        // Number(data.starVetDiscount || 0) +
        // Number(data.abaitment || 0) +
        Number(data.moveInFee || 0) +
        Number(data.moveOutFee || 0);
        // Number(data.seniorDiscount || 0) +
        // Number(data.miscCredit || 0) +
        // Number(data.drieCredit || 0);

      return (total + entryTotalPayable|| 0);
    }, 0).toFixed(2);

    return (this.totalPayable - this.totalRentPaid);
  }
  calculateTotalDiscount(): number {
    return this.filteredRents.reduce((total, data) => total + (parseFloat(data.discount)|| 0), 0);
  }
  

  openEnlargedChequeImageModal(chequeImage: string) {
    this.selectedChequeImage = chequeImage;
    // console.log('image', this.selectedChequeImage);
    setTimeout(() => {
    }, 0);
  }

  // Sorting the table data below and update in filteredRent array
  sortTable(array) {
    array.sort((a, b) => {
        // Convert the rentDueDate strings to Date objects
        const rentDueDateA = new Date(
            parseInt(a.rentDueDate.split('/')[2]),  // Year
            parseInt(a.rentDueDate.split('/')[0]) - 1,  // Month (0-based)
            parseInt(a.rentDueDate.split('/')[1])  // Day
        ).getTime();  // Get the timestamp

        const rentDueDateB = new Date(
            parseInt(b.rentDueDate.split('/')[2]),  // Year
            parseInt(b.rentDueDate.split('/')[0]) - 1,  // Month (0-based)
            parseInt(b.rentDueDate.split('/')[1])  // Day
        ).getTime();  // Get the timestamp

        // Compare the timestamps
        return rentDueDateB - rentDueDateA;
    });

    this.filteredRents = array;
    console.log('filteredRent Arr', this.filteredRents);
    this.loaderService.hideLoader('master');
}

  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters from the phone number
    const numericOnly = phoneNumber.replace(/\D/g, '');

    // Check if it's a valid 10-digit US phone number
    if (numericOnly.length === 10) {
      // Use regex to format the phone number
      return numericOnly.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else {
      // Return the original string if it's not a valid US phone number
      return phoneNumber;
    }
  }

  ////////////////////////////////////////-------EXPORT FILE METHOD----//////////////////////////////////////////////
  saveXls(): void {
    let element = document.getElementById('rentTable');

    const clonedTable = element.cloneNode(true) as HTMLElement;
    this.removeColumn(clonedTable, 1);
    this.removeColumn(clonedTable, 1);
    this.removeColumn(clonedTable, 24);
    this.removeColumn(clonedTable, 24);
    this.removeColumn(clonedTable, 24);

    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(clonedTable);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.fileName); //save to file
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
  
  savePdfOwner() {
    const logoPath = 'assets/images/login-logo.jpeg'; // Replace with the correct path to your image
    fetch(logoPath)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const logoDataURI = reader.result as string;
          const firstRent = this.filteredRents[0];
          const lastRent = this.filteredRents[this.filteredRents.length - 1];

          const allSameMonthYear = this.filteredRents.every(r => r.month === firstRent.month && r.year === firstRent.year);
          console.log('all same:', allSameMonthYear);

          const title = allSameMonthYear? `Statement: ${this.getMonthYear(lastRent)}` : `Statement: ${this.getMonthYear(lastRent)} to ${this.getMonthYear(firstRent)}`;

  
          const documentDefinition = {
            pageSize: 'A4',
            defaultStyle: {
              font: 'Roboto'
            },
            pageOrientation: 'landscape',
            content: [
              ...(!this.isCoopApartment ? [{ image: logoDataURI, width: 60, height: 60, alignment: 'center', margin: [0, -15, 0, 5] }] : []),
              { text: `BUILDING : ${this.filteredRents[0]?.building}\n` + title, fontSize: 14, bold: true, alignment: 'center', marginTop: 10 },
              {
                table: {
                  headerRows: 1,
                  widths: (!this.isCoopApartment) ? ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
                    : ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                  body: [
                    [
                      { text: 'SR.', style: {bold: true, fillColor: 'lightgrey'}},
                      ...(!this.isCoopApartment ? [{ text: 'MOBILE', style: { bold: true, fillColor: 'lightgrey' } }] : []),
                      { text: 'BUILDING', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'UNIT', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'TENANT', style: {bold: true, fillColor: 'lightgrey'}},
                      ...(!this.isCoopApartment ? [{ text: 'DURATION', style: {bold: true, fillColor: 'lightgrey'}}] : []),
                      { text: 'DUE-DATE', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'PAID-DATE', style: {bold: true, fillColor: 'lightgrey'}},
                      ...(!this.isCoopApartment ? [{ text: 'RENT', style: {bold: true, fillColor: 'lightgrey'}}] : []),
                      { text: 'BALANCE', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'OTHER CHARGES', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'DISCOUNTS', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'PAYABLE', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'PAID', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'REMAINING', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'CHEQUE NO', style: {bold: true, fillColor: 'lightgrey'}},
                    ],
                    ...(this.filteredRents.map((data, index) => [
                      index + 1,
                      ...(!this.isCoopApartment ? [data.isVacant ? 'VACANT' : (data?.mobile || '')] : []),
                      data?.building || '',
                      data?.unitNo || '',
                      data.isVacant ? 'VACANT' : (data?.tenantName || ''),
                      ...(!this.isCoopApartment ? [(data?.leaseStartDate) + '-' + (data.leaseEndDate) || ''] : []),
                      data?.rentDueDate || '',
                      data?.datePaid || '',
                      ...(!this.isCoopApartment ? [data?.rent || 0] : []),
                      data?.previousBalance || 0,
                      this.generateOtherChargesText(data),
                      this.generateDiscountText(data),
                      data?.totalPayable || 0,
                      data?.paidRent || 0,
                      data?.remainingBalance || 0,
                      data?.chequeNo || ''
                    ]))
                  ]
                },
                style: { fontSize: 7.5 },
                margin: [-25, 10, 0, 0]
              },
              {
                text: [
                  { text: 'TOTAL' + '    ', fontSize: 14 },
                  { text: 'PROJECTED: ' + '$' + this.totalPayable },
                  { text: ',  DISCOUNT: ' + '$' + this.totalDiscount },
                  { text: ',  PAID: ' + '$' + this.totalRentPaid },
                  { text: ',  DUE: ' + '$' + this.totalRemainingBalance }
                ],
                alignment: 'center',
                margin: [0, 15, 0, 0]
              }
            ],
            // Footer definition
            footer: (currentPage: number, pageCount: number) => {
              return {
                columns: [
                  { text: `Generated by: Awais, Licensed Real Estate Broker \nTel: +1 (646) 239-0000, Email: realmawais@gmail.com`, 
                  fontSize: 8, width: 'auto', margin: [30, 15, 5, 0] },
                  ...(!this.isCoopApartment ? [{ text: `Awais Co.`, 
                  fontSize: 8, marginTop: 15, marginLeft: 70 }] : []
                  ),
                  { text: `\nPage ${currentPage} of ${pageCount}`, fontSize: 8, alignment: 'right', marginTop: 8, marginRight: 35 }
                ]
              };
            }
          };
  
          this.pdfAttachment = pdfMake.createPdf(documentDefinition).download(`${this.filteredRents[0]?.building}_statement.pdf`);
        };
  
        reader.readAsDataURL(blob); // Convert the blob to data URI
      })
      .catch(error => {
        console.error('Error fetching the image:', error);
      });
  }

  getMonthYear(rent: any): string {
    return rent ? `${rent.month}-${rent.year}` : '';
  }

  generateDiscountText(data) {
    const charges = [];
    if (data?.starVet > 0) {
      charges.push(`StarVet: ${data.starVet}`);
    }
    if (data?.abaitment > 0) {
      charges.push(`Abaitment: ${data.abaitment}`);
    }
    if (data?.senior > 0) {
      charges.push(`Seniorship: ${data.senior}`);
    }
    if (data?.miscCredit > 0) {
      charges.push(`MISC. Credit: ${data.miscCredit}`);
    }
    if (data?.drieCredit > 0) {
      charges.push(`DRIE. Credit: ${data.drieCredit}`);
    }
    if (data?.discount > 0) {
      charges.push(`DISC.: ${data.discount}`);
    }

    // Combine all fields in an array
    if (charges.length > 0) {
      return charges.join('\n');
    } else {
      return '';
    }
  }

  generateOtherChargesText(data) {
    const charges = [];

    // Check each charge and add it to the charges array if it's greater than 0
    if (data?.maintenanceFee > 0) {
      charges.push(`Maintenance: ${data.maintenanceFee}`);
    }
    if (data?.lateFee > 0) {
      charges.push(`Late: ${data.lateFee}`);
    }
    if (data?.fuelCharges > 0) {
      charges.push(`Fuel: ${data.fuelCharges}`);
    }
    if (data?.storageSpaceFee > 0) {
      charges.push(`Storage: ${data.storageSpaceFee}`);
    }
    if (data?.garageFee > 0) {
      charges.push(`Garage: ${data.garageFee}`);
    }
    if (data?.internetFee > 0) {
      charges.push(`Internet: ${data.internetFee}`);
    }
    if (data?.applicationFee > 0) {
      charges.push(`Application: ${data.applicationFee}`);
    }
    if (data?.transFee > 0) {
      charges.push(`Transfer: ${data.transFee}`);
    }
    if (data?.assessFee > 0) {
      charges.push(`Assessment: ${data.assessFee}`);
    }
    if (data?.moveInFee > 0) {
      charges.push(`Move-In: ${data.moveInFee}`);
    }
    if (data?.moveOutFee > 0) {
      charges.push(`Move-Out: ${data.moveOutFee}`);
    }
    if (data?.return > 0) {
      charges.push(`Return: ${data.return}`);
    }
    if (data?.subletAmount > 0) {
      charges.push(`Sublet: ${data.subletAmount}`);
    }
    if (data?.amountAdjusted > 0) {
      charges.push(`Sublet: ${data.amountAdjusted}`);
    }


    // If there are charges, join them with line breaks; otherwise, return an empty string
    if (charges.length > 0) {
      return charges.join('\n');
    } else {
      return '';
    }
  }

  downloadPdf(data: any) { //Save Single tenant statement

    // Convert the image to a data URL
    const logoPath = 'assets/images/ammanagement.png'; // Replace with the correct path to your image

    fetch(logoPath)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const logoDataURI = reader.result as string;
          let otherFee = data?.garageFee + data?.storageSpaceFee + data?.fuelCharges + data?.internetFee;


          // Create the table data
          const tableData = [
            [{ text: 'DESCRIPTION', bold: true }, { text: 'AMOUNT', bold: true }],
            // [{ text: 'Rent:' }, { text: '$' + data.rent }],
            ...(this.filteredRents[0]?.propertyType !== 'Co-op Apartments' ? [[{ text: 'Rent:' }, { text: '$' + data.rent }]] : []),
            ...(data?.maintenanceFee > 0 ? [[{ text: 'Maintenance:' }, { text: '$' + data.maintenanceFee }]] : []),

            ...(data?.lateFee > 0 ? [[{ text: 'Late Fee:' }, { text: '$' + data.lateFee }]] : []),

            ...(otherFee > 0 ? [[{ text: 'Other Fee: (garage, storage, fuel, internet)' }, { text: '$' + (otherFee) }]] : []),

            ...(data?.discount > 0 ? [[{ text: 'Discount:' }, { text: '$' + data.discount }]] : []),

            [{ text: 'Previous Balance:' }, { text: '$' + data.previousBalance }],
            [{ text: 'Total Payable Amount:' }, { text: '$' + (data.totalPayable) + ' ' + '*' }],
            [{ text: 'Paid Amount:' }, { text: '$' + data.paidRent }],
            [{ text: 'Remaining Balance:', bold: true }, { text: '$' + data.remainingBalance, bold: true }]
          ];
          // console.log('tableData:', JSON.stringify(tableData));

          // Create a new document definition
          const docDefinition = {
            defaultStyle: {
              font: 'Lato'
            },
            content: [
              {
                columns: [
                  {
                    text: 'BUILDING: ' + data.building,
                    alignment: 'left',
                    width: 'auto'
                  },
                  {
                    text: 'PROPERTY: ' + data.propertyType,
                    alignment: 'right',
                    width: '*'
                  }
                ],
                margin: [0, 0, 0, 5]
              },
              {
                columns: [
                  {
                    text: 'UNIT NO: ' + data.unitNo,
                    alignment: 'left',
                    width: 'auto'
                  },
                  {
                    text: 'UNIT TYPE: ' + data.unitType,
                    alignment: 'right',
                    width: '*'
                  }
                ],
                margin: [0, 0, 0, 10]
              },
              ...(this.filteredRents[0]?.propertyType !== 'Co-op Apartments' ? [{ image: logoDataURI, width: 50, height: 50, alignment: 'center', margin: [0, 10, 0, 10] }] : []),
              ...(this.filteredRents[0]?.propertyType !== 'Co-op Apartments' ? [{ text: 'MONTHLY STATEMENT', fontSize: 18, alignment: 'center', margin: [0, 0, 5, 10] }] : [{ text: 'MONTHLY STATEMENT', fontSize: 18, alignment: 'center', margin: [0, 50, 5, 10] }]),
              // { text: 'Monthly Rent Statement', fontSize: 18, alignment: 'center', margin: [0, 0, 5, 10] },
              { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5 }, { type: 'line', x1: 0, y1: 8, x2: 515, y2: 8 }], margin: [0, 0, 5, 10] },
              { text: 'Tenant Name: ' + data.tenantName, bold: true },
              { text: 'Lease ID: ' + data.leaseId },
              { text: 'Month: ' + data.month },
              { text: 'Year: ' + data.year },
              { text: 'Due Date: ' + data.rentDueDate },
              { text: 'Paid Date: ' + data.datePaid },
              // { text: 'Lease Duration: ' + data.leaseStartDate + ' - ' + data.leaseEndDate },
              ...(this.filteredRents[0]?.propertyType !== 'Co-op Apartments' ? [[{ text: 'Lease Duration: ' + data.leaseStartDate + ' - ' + data.leaseEndDate }]] : []),
              { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5 }], margin: [0, 0, 10, 10] }, // Line below the tenant data
              { text: 'Rent Calculations', fontSize: 14, bold: true, margin: [0, 10, 10, 0] },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', '*'],
                  body: tableData
                }
              },
              { text: 'Cheque No: ' + data.chequeNo, margin: [0, 10, 0, 0], fontSize: 10 },
              // { text: 'Bank Name: ' + data.bankName, fontSize: 10 },
              ...(data?.chequeImage
                ? [
                  {
                    image: data.chequeImage,
                    width: 400,
                    height: 130,
                    alignment: 'center',
                    margin: [0, 10, 0, 0],
                  },
                ]
                : []
              ),


              { text: 'Generated By', alignment: 'center', margin: [0, 50, 0, 0] },
              { text: '_______________________________', alignment: 'center', fontSize: 10 },
              { text: 'Awais', alignment: 'center', fontSize: 10 },
              ...(this.filteredRents[0]?.propertyType !== 'Co-op Apartments' ? [[{ text: 'Tel: +1 (646) 239-0000', alignment: 'center', fontSize: 10 }]] : []),
              ...(this.filteredRents[0]?.propertyType !== 'Co-op Apartments' ? [[{ text: 'Licensed Real Estate Broker in NY', alignment: 'center', fontSize: 9 }]] : []),
              ...(this.filteredRents[0]?.propertyType !== 'Co-op Apartments' ? [[{ text: 'Awais Co., 8708 18th Ave, Brooklyn, NY 11214', alignment: 'center', fontSize: 9 }]] : []),
            ],

            // Footer definition
            footer: (currentPage: number, pageCount: number) => {
              const footerContent = [
                { text: 'This is a computer-generated document. No signature is required.', alignment: 'center', fontSize: 8 },
                { text: `\nPage ${currentPage} of ${pageCount}`, alignment: 'right', fontSize: 10 }
              ];
              return {
                text: footerContent,
                alignment: 'right',
                fontSize: 10,
                margin: [0, 10, 30, 0]
              };
            }

          };

          // Generate the PDF using pdfmake
          const pdfDocGenerator = pdfMake.createPdf(docDefinition);

          // Download the PDF file
          pdfDocGenerator.download(`${data.tenantName}_${data.month}_${data.year}.pdf`);
        };
        reader.readAsDataURL(blob);

      })
      .catch(error => {
        console.error('Error fetching the image:', error);
      });
  }

  savePdf(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const logoPath = 'assets/images/login-logo.jpeg';
      fetch(logoPath)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const logoDataURI = reader.result as string;
            const firstRent = this.filteredRents[0];
            const lastRent = this.filteredRents[this.filteredRents.length - 1];
  
            const allSameMonthYear = this.filteredRents.every(r => r.month === firstRent.month && r.year === firstRent.year);
            const title = allSameMonthYear ? `Statement: ${this.getMonthYear(lastRent)}` : `Statement: ${this.getMonthYear(lastRent)} to ${this.getMonthYear(firstRent)}`;
  
            const documentDefinition = {
              pageSize: 'A4',
              defaultStyle: {
                font: 'Lato'
              },
              pageOrientation: 'landscape',
              content: [
              ...(!this.isCoopApartment ? [{ image: logoDataURI, width: 60, height: 60, alignment: 'center', margin: [0, -15, 0, 5] }] : []),
              { text: `BUILDING : ${this.filteredRents[0]?.building}\n` + title, fontSize: 14, bold: true, alignment: 'center', marginTop: 10 },
              {
                table: {
                  headerRows: 1,
                  widths: (!this.isCoopApartment) ? ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
                    : ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                  body: [
                    [
                      { text: 'SR.', style: {bold: true, fillColor: 'lightgrey'}},
                      ...(!this.isCoopApartment ? [{ text: 'MOBILE', style: { bold: true, fillColor: 'lightgrey' } }] : []),
                      { text: 'BUILDING', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'UNIT', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'TENANT', style: {bold: true, fillColor: 'lightgrey'}},
                      ...(!this.isCoopApartment ? [{ text: 'DURATION', style: {bold: true, fillColor: 'lightgrey'}}] : []),
                      { text: 'DUE-DATE', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'PAID-DATE', style: {bold: true, fillColor: 'lightgrey'}},
                      ...(!this.isCoopApartment ? [{ text: 'RENT', style: {bold: true, fillColor: 'lightgrey'}}] : []),
                      { text: 'BALANCE', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'OTHER CHARGES', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'DISCOUNTS', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'PAYABLE', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'PAID', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'REMAINING', style: {bold: true, fillColor: 'lightgrey'}},
                      { text: 'CHEQUE NO', style: {bold: true, fillColor: 'lightgrey'}},
                    ],
                    ...(this.filteredRents.map((data, index) => [
                      index + 1,
                      ...(!this.isCoopApartment ? [data.isVacant ? 'N/A' : (data?.mobile || '')] : []),
                      data?.building || '',
                      data?.unitNo || '',
                      data.isVacant ? 'VACANT' : (data?.tenantName || ''),
                      ...(!this.isCoopApartment ? [(data?.isVacant ? (data?.comments || '') : ((data?.leaseStartDate || '') + '-' + (data?.leaseEndDate || ''))) || ''] : []),
                      data?.rentDueDate || '',
                      data?.datePaid || '',
                      ...(!this.isCoopApartment ? [data?.rent || 0] : []),
                      data?.previousBalance || 0,
                      this.generateOtherChargesText(data),
                      this.generateDiscountText(data),
                      data?.totalPayable || 0,
                      data?.paidRent || 0,
                      data?.remainingBalance || 0,
                      data?.chequeNo || ''
                    ]))
                  ]
                },
                style: { fontSize: 7.5 },
                margin: [-25, 10, 0, 0]
              },
              {
                // Combine both "TOTAL PAID:" and "$" + this.totalRent in the same array element
                text: [
                  { text: 'TOTAL' + '                ', fontSize: 14 },
                  { text: 'PAYABLE: ' + ' ' + '$' + this.totalRentPaid },
                  { text: 'PAID: ' + ' ' + '$' + this.totalRentPaid },
                  { text: '    ' + 'DUE: ' + ' ' + '$' + this.totalRemainingBalance }
                ],
                alignment: 'center',
                margin: [0, 15, 0, 0]
              }
            ],
            // Footer definition
            footer: (currentPage: number, pageCount: number) => {
              return {
                columns: [
                  { text: `Generated by: Awais, Licensed Real Estate Broker \nTel: +1 (646) 239-0000, Email: realmawais@gmail.com`, 
                  fontSize: 8, width: 'auto', margin: [30, 15, 5, 0] },
                  ...(!this.isCoopApartment ? [{ text: `Awais Co.`, 
                  fontSize: 8, marginTop: 15, marginLeft: 70 }] : []
                  ),
                  { text: `\nPage ${currentPage} of ${pageCount}`, fontSize: 8, alignment: 'right', marginTop: 8, marginRight: 35 }
                ]
              };
            }
          };
          // this.pdfAttachment = pdfMake.createPdf(documentDefinition).download(`${this.filteredRents[0]?.building}_statement.pdf`);
          // Create PDF as a blob
          pdfMake.createPdf(documentDefinition).getBlob(blob => {
            resolve(blob);
          });
        };
  
        reader.readAsDataURL(blob); // Convert the blob to data URI
      })
      .catch(error => {
        console.error('Error fetching the image:', error);
        reject(error); // Reject the promise if there is an error
      });
    });
  }

  sendOwnerPdf(): Promise<void> {
    // Show loader
    this.loaderService.showLoader('master');
    return new Promise<void>((resolve, reject) => {
      const subject = encodeURIComponent(`Statement for ${this.filteredRents[0].building}`);
      const body = encodeURIComponent(
        `Hi ${this.filteredRents[0].tenantName},\n\nPlease find the attached rent statement for your building.\n\nThanks & Regards\nAwais\nTel: +1 (646) 239-0000\nLicensed Real Estate Broker in NY`
      );
      const recipient = encodeURIComponent(this.ownerEmail);
  
      // Generate PDF attachment
      this.savePdf().then(async (pdfBlob: Blob) => {
        // console.log('PDF Blob:', pdfBlob);
  
        // Convert the Blob to a Buffer
        const pdfBuffer = await pdfBlob.arrayBuffer();
        const pdfArray = new Uint8Array(pdfBuffer);
        // Convert pdfArray to a base64-encoded string
        const pdfBase64 = this.arrayBufferToBase64(pdfArray);
  
        // Create payload
        const payload = {
          to: recipient,
          subject: subject,
          body: body,
          attachment: pdfBase64,
          filename: `${this.filteredRents[0]?.building}_rent_statement.pdf`,
        };
        const functionsURL = 'cloud url to enter here';
        // Make a POST request to your server
        fetch(`${functionsURL}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        .then(response => {
          if (response.ok) {
            this.loaderService.hideLoader('master');
            // console.log('Email sent successfully.');
            resolve(); // Resolve the promise if the email is sent successfully
          } else {
            this.loaderService.hideLoader('master');
            // console.error('Error sending email.');
            reject(); // Reject the promise if there is an error
          }
        })
        .catch(error => {
          this.loaderService.hideLoader('master');
          // console.error('Error sending email:', error);
          reject(); // Reject the promise in case of an error
        });
      });
    });
  }
  

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return btoa(binary);
  }

  showToaster(){
    this.toastr.success(`Email sent to: ${this.filteredBuildingObj[0].owner}`, 'Success', {
      timeOut: 3000, // Time to show the toaster message (in milliseconds)
      progressBar: true,
      closeButton: true
    });
  }

  openConfirmationDialog(): void {
    const message = `Are you sure you want to send this report to the ${this.ownerEmail}?\n\n Hi ${this.filteredBuildingObj[0].owner},\n\nPlease find the attached rent statement for your building.\n\nThanks & Regards\nAwais\nTel: +1 (646) 239-0000\nLicensed Real Estate Broker in NY`;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: {
        title: 'Confirmation',
        message: message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User clicked "Yes", call the method
        this.isSending = true;
        this.sendOwnerPdf().then(() => {
          // Reset the sending state to false after the email is sent
          this.isSending = false;
          // Show a success toaster
          this.showToaster();
        }).catch(() => {
          // Reset the sending state to false in case of an error
          this.isSending = false;
          // Show an error toaster
          this.showToasterError();
        });
      }
    });
  }

  showToasterError(): void {
    this.toastr.error('Error sending email.', 'Error', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  

}
