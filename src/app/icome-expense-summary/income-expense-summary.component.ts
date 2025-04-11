import { Component, HostListener, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../services/api.service';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;
import { LoaderService } from '../services/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-income-expense-summary',
  templateUrl: './income-expense-summary.component.html',
  styleUrls: ['./income-expense-summary.component.css']
})
export class IncomeExpenseSummaryComponent implements OnInit {
  totalLength: any;
  p: any;
  fileName = 'Income-Expense-Summary.xlsx';
  logoPath = 'assets/images/ammanagement.png';
  selectedCompany: any;
  localArray_company: any;
  ownerArray: any[] = [];
  filteredBuildingArr: any[] = [];
  filteredUnitArr: any[] = [];
  localArray_rent: any;
  filteredRents: any;
  isCoopApartment: boolean;
  noRecordsFound: boolean;
  totalPayable: any;
  totalDiscount: any;
  totalRentPaid: any;
  totalRemainingBalance: any;
  selectedCheque: any;
  chequeImageSrc: string = '';
  localArray_building: any;
  selectedBuilding: any;
  selectedUnit: any;
  dropdownOpen: boolean = false;
  monthOptions = [{ value: 'January' }, { value: 'Febuary' }, { value: 'March' }, { value: 'April' }, { value: 'May' }, { value: 'June' }, { value: 'July' }, { value: 'August' }, { value: 'September' }, { value: 'October' }, { value: 'November' }, { value: 'December' }];
  YearOptions = [{ value: '2022' }, { value: '2023' }, { value: '2024' }, { value: '2025' }];
  selectedMonths: { [key: string]: boolean } = {};
  selectedYears: { [key: string]: boolean } = {};
  openYearDD: boolean = false;
  localArray_expense: any;
  filteredExpense: any;
  totalExpense: any;
  searchQuery: any;
  ownerEmail: any;
  isSearched: boolean = false;
  showRent: boolean = false;
  showExpense: boolean = false;
  pdfAttachment: any;
  isSending: boolean;
  fileType: any;
  hasSelectedCompany: boolean = false;


  constructor(
    public apiService: ApiService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.getCompanyData();
    this.getRentData();
    this.getBuildingData();
    this.getExpenseData();
  }

  getCompanyData() {
    this.apiService.getCompanyAPI().subscribe((fireBaseData: any) => {
      this.localArray_company = fireBaseData;
      this.localArray_company.forEach(data => {
        this.ownerArray.push(data);
      });
    });
  }

  getRentData() {
    this.apiService.getRentAPI().subscribe((fireBaseData: any) => {
      this.localArray_rent = fireBaseData;
    });
  }

  getBuildingData() {
    this.apiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_building = fireBaseData;
    });
  }

  getExpenseData() {
    this.apiService.getExpenseAPI().subscribe((fireBaseData: any) => {
      this.localArray_expense = fireBaseData;
    });
  }

  onCompanyDropDown(event: Event) {
    const selectedCompany = (event.target as HTMLSelectElement).value;
    this.selectedCompany = this.localArray_company.find(data => data.companyName === selectedCompany);
    this.selectedCompany ? this.ownerEmail = this.selectedCompany.email : '';
    this.filterBuilding(this.selectedCompany);
  }

  filterBuilding(selectedCompany) {
    this.filteredBuildingArr = this.localArray_building.filter(data => data.companyName === selectedCompany.companyName);
    this.hasSelectedCompany = true;
  }

  onBuildingDropDown(event: Event) {
    const selectedBuilding = (event.target as HTMLSelectElement).value;
    this.selectedBuilding = this.localArray_building.find(data => data.address === selectedBuilding);
    this.filteredUnitArr = this.selectedBuilding.unitDetails;
  }

  onUnitDropDown(event: Event) {
    const selectedUnit = (event.target as HTMLSelectElement).value;
    this.selectedUnit = this.filteredUnitArr.find(data => data.unitNo === selectedUnit);
  }

  sortExpenseTable(array) {
    array.sort((a, b) => {
      const dateA = new Date(a.monthYear).getTime();
      const dateB = new Date(b.monthYear).getTime();
      return dateB - dateA;
    });

    array.sort((a, b) => {
      const expenseTypeA = a.expenseType.toLowerCase();
      const expenseTypeB = b.expenseType.toLowerCase();
      if (expenseTypeA < expenseTypeB) {
        return -1;
      }
      if (expenseTypeA > expenseTypeB) {
        return 1;
      }
      return 0;
    });
    this.filteredExpense = array;
  }

  sortRentTable(array) {
    array.sort((a, b) => {
      const rentDueDateA = new Date(
        parseInt(a.rentDueDate.split('/')[2]),
        parseInt(a.rentDueDate.split('/')[0]) - 1,
        parseInt(a.rentDueDate.split('/')[1])
      ).getTime();

      const rentDueDateB = new Date(
        parseInt(b.rentDueDate.split('/')[2]),
        parseInt(b.rentDueDate.split('/')[0]) - 1,
        parseInt(b.rentDueDate.split('/')[1])
      ).getTime();
      return rentDueDateB - rentDueDateA;
    });

    this.filteredRents = array;
  }

  totalExpensePaid(expenseDataArr) {
    this.totalExpense = expenseDataArr.reduce((total, expense) => {
      return total + (parseFloat(expense?.amountPaid) || 0);
    }, 0);
    this.totalExpense = Number(this.totalExpense.toFixed(2) || 0);
  }

  searchButton() {
    this.loaderService.showLoader('master');
    this.getRentData();
    this.getExpenseData();
    this.openYearDD = false;
    this.dropdownOpen = false;
    this.isSearched = true;   

    const searchData = {
      company: this.selectedCompany?.companyName?.toLowerCase() || '',
      building: this.selectedBuilding?.address?.toLowerCase() || '',
      unit: this.selectedUnit?.unitNo?.toLowerCase() || '',
      months: Object.keys(this.selectedMonths).filter(month => this.selectedMonths[month]),
      years: Object.keys(this.selectedYears).filter(year => this.selectedYears[year])
    };

    let buildingsOfSelectedCompany = [];
    if (!searchData.building && !searchData.unit) {
      buildingsOfSelectedCompany = this.localArray_building.filter(building => building.companyName.toLowerCase() === searchData.company)
        .map(building => building.address.toLowerCase());
    }

    this.filteredRents = this.localArray_rent.filter(rent =>
      ((searchData.building ? searchData.building.includes(rent.building.toLowerCase()) : buildingsOfSelectedCompany.includes(rent.building.toLowerCase()))) &&
      (searchData.unit ? rent.unitNo.toLowerCase() === searchData.unit : true) &&
      (searchData?.months.length === 0 || searchData.months.includes(rent.month)) &&
      (searchData?.years.length === 0 || searchData.years.includes(rent.year))
    );

    this.filteredExpense = this.filterData(this.localArray_expense, searchData);    
    this.totalExpensePaid(this.filteredExpense);
    this.noRecordsFound = this.filteredExpense.length === 0 && this.filteredRents.length === 0;
    if (this.filteredRents.length > 0) {
      this.isCoopApartment = this.filteredRents[0]?.propertyType === 'Co-op Apartments';
    }

    this.sortRentTable(this.filteredRents);
    this.sortExpenseTable(this.filteredExpense);
    this.updateTotalRentAmounts(this.filteredRents);
    this.loaderService.hideLoader('master');
  }

  filterData(dataArray, searchParams) {
    return dataArray.filter(item => {
      const companyMatches = searchParams.company ? item.companyName?.toLowerCase().includes(searchParams.company) : true;
      const buildingMatches = searchParams.building ? item.building?.toLowerCase().includes(searchParams.building) : true;
      const unitMatches = searchParams.unit ? item.unitNo?.toLowerCase().includes(searchParams.unit) : true;
      const monthMatches = searchParams.months.length > 0 ? searchParams.months.includes(item.month) : true;
      const yearMatches = searchParams.years.length > 0 ? searchParams.years.includes(item.year) : true;
  
      return companyMatches && buildingMatches && unitMatches && monthMatches && yearMatches;
    });
  }
  

  updateTotalRentAmounts(filteredRentArr) {
    this.totalRentPaid = this.calculateTotalPaid(filteredRentArr).toFixed(2);
    this.totalDiscount = this.calculateTotalDiscount(filteredRentArr).toFixed(2);
    this.totalRemainingBalance = ((this.calculateTotalRemaining(filteredRentArr)) - Number(this.totalDiscount)).toFixed(2) || 0;
  }

  closeDropdown() {
    this.dropdownOpen = false;
    this.openYearDD = false;
  }

  calculateTotalPaid(array): number {
    return array.reduce((total, data) => total + (parseFloat(data.paidRent) || 0), 0);
  }

  calculateTotalRemaining(array): number {
    this.totalPayable = array.reduce((total, data) => {
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

      return (total + entryTotalPayable || 0);
    }, 0).toFixed(2);

    return (this.totalPayable - this.totalRentPaid);
  }

  calculateTotalDiscount(array): number {
    return array.reduce((total, data) => total + (parseFloat(data.discount) || 0), 0);
  }

  formatPhoneNumber(phoneNumber: string): string {
    const numericOnly = phoneNumber.replace(/\D/g, '');
    if (numericOnly.length === 10) {
      return numericOnly.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else {
      return phoneNumber;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleYearDropdown() {
    this.openYearDD = !this.openYearDD;
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])

  closeDropdownOnOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideMonthDropdown = target.closest('.month-dropdown');
    const clickedInsideYearDropdown = target.closest('.year-dropdown');
    const clickedInsideButton = target.closest('.dropdown-toggle');

    if (!clickedInsideMonthDropdown && !clickedInsideButton) {
      this.dropdownOpen = false;
    }

    if (!clickedInsideYearDropdown && !clickedInsideButton) {
      this.openYearDD = false;
    }
  }

  showRentTable() {
    this.showRent = true;
    this.showExpense = false;
  }

  showExpenseTable() {
    this.showRent = false;
    this.showExpense = true;
  }

  reset() {
    this.hasSelectedCompany = false;
    this.filteredRents = [];
    this.filteredExpense = [];
    this.filteredBuildingArr = [];
    this.ownerArray = [];
    this.filteredUnitArr = [];
    this.selectedBuilding = null;
    this.selectedCompany = null;
    this.selectedUnit = null;
    this.selectedMonths = {};
    this.monthOptions.forEach(month => {
      this.selectedMonths[month.value] = false;
    });
    this.selectedYears = {};
    this.YearOptions.forEach(year => {
      this.selectedYears[year.value] = false;
    });
    this.isSearched = false;
    this.openYearDD = false;
    this.dropdownOpen = false;
    this.getCompanyData();
  }

  openChequeModal(cheque: any): void {
    this.selectedCheque = cheque;
    this.chequeImageSrc = `data:image/png;base64,${cheque.image}`;
    const chequeModal = new bootstrap.Modal(document.getElementById('chequeImageModal'));
    chequeModal.show();
  }

  downloadChequeImage(data) {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${data.chequeImage}`;
    link.download = `Cheque of ${data.tenantName}.png`;
    link.click();
  }

  exportExcel(): void {
    let element = document.getElementById('income-expense_table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.fileName); //save to file
  }

  exportPdf(fileType: string, download: boolean = false): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const logoPath = 'assets/images/login-logo.jpeg';
      fetch(logoPath)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const logoDataURI = reader.result as string;
  
            // Group rents by building
            const rentsByBuilding = this.filteredRents.reduce((acc, rent) => {
              if (!acc[rent.building]) {
                acc[rent.building] = [];
              }
              acc[rent.building].push(rent);
              return acc;
            }, {});
  
            const content = [];
            Object.keys(rentsByBuilding).forEach((building, index) => {
              const rents = rentsByBuilding[building];
              const firstRent = rents[0];
              const lastRent = rents[rents.length - 1];
  
              const allSameMonthYear = rents.every(r => r.month === firstRent.month && r.year === firstRent.year);
              const title = allSameMonthYear
                ? `Statement: ${this.getMonthYear(lastRent)}`
                : `Statement: ${this.getMonthYear(lastRent)} to ${this.getMonthYear(firstRent)}`;
  
              const rentTable = {
                table: {
                  headerRows: 1,
                  widths: this.isCoopApartment
                    ? ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
                    : ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                  body: [
                    [
                      { text: 'SR.', style: { bold: true, fillColor: 'lightgrey' } },
                      ...(!this.isCoopApartment ? [{ text: 'MOBILE', style: { bold: true, fillColor: 'lightgrey' } }] : []),
                      { text: 'BUILDING', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'UNIT', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'TENANT', style: { bold: true, fillColor: 'lightgrey' } },
                      ...(!this.isCoopApartment ? [{ text: 'LEASE DURATION', style: { bold: true, fillColor: 'lightgrey' } }] : []),
                      { text: 'DUE-DATE', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'PAID-DATE', style: { bold: true, fillColor: 'lightgrey' } },
                      ...(!this.isCoopApartment ? [{ text: 'RENT', style: { bold: true, fillColor: 'lightgrey' } }] : []),
                      { text: 'BALANCE', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'OTHER CHARGES', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'DISCOUNTS', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'PAYABLE', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'PAID', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'REMAINING', style: { bold: true, fillColor: 'lightgrey' } },
                      { text: 'CHEQUE NO', style: { bold: true, fillColor: 'lightgrey' } },
                    ],
                    ...rents.map((data, index) => [
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
                    ])
                  ]
                },
                style: { fontSize: 7.5 },
                margin: [0, 10, 0, 0]
              };
  
              this.updateTotalRentAmounts(rents);
  
              const incomeSummaryTable = {
                table: {
                  headerRows: 1,
                  widths: ['auto', 'auto'],
                  body: [
                    ['PROJECTED', `$${this.totalPayable}`],
                    ['DISCOUNT', `$${this.totalDiscount}`],
                    ['PAID', `$${this.totalRentPaid}`],
                    ['DUE', `$${this.totalRemainingBalance}`]
                  ],
                },
                alignment: 'left',
                margin: [0, 10, 0, 40]
              };
  
              content.push(
                ...(!this.isCoopApartment ? [{ image: logoDataURI, width: 70, height: 70, alignment: 'right' }] : []),
                { text: `COMPANY : ${this.selectedCompany.companyName}`, fontSize: 14, bold: true, alignment: 'left', marginTop: -50 },
                { text: `BUILDING : ${building}\n` + title, fontSize: 12, bold: true, alignment: 'left', marginBottom: 10 },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 760, y2: 5, lineWidth: 2 }, { type: 'line', x1: 0, y1: 10, x2: 760, y2: 10, lineWidth: 2 }] },
                { text: `INCOME SUMMARY`, fontSize: 14, bold: true, alignment: 'left', marginTop: 40 },
                incomeSummaryTable,
                fileType === 'detail' ? { text: 'INCOME DETAILS:', alignment: 'left', fontSize: 16, bold: true } : '',
                fileType === 'detail' ? rentTable : ''
              );
  
              if (index < Object.keys(rentsByBuilding).length - 1) {
                content.push({ text: '', pageBreak: 'before' });
              }
            });
  
            const expenseTypeSummary = this.filteredExpense.reduce((summary, data) => {
              if (!summary[data.expenseType]) {
                summary[data.expenseType] = 0;
              }
              summary[data.expenseType] += parseFloat(data.amountPaid) || 0;
              return summary;
            }, {});
  
            const summaryExpenseTable = {
              table: {
                headerRows: 1,
                widths: ['auto', 'auto'],
                body: [
                  [{ text: 'EXPENSE TYPE', alignment: 'center', bold: true }, { text: 'AMOUNT', alignment: 'center', bold: true }],
                  ...Object.keys(expenseTypeSummary).map(expenseType => [expenseType, `$${expenseTypeSummary[expenseType].toFixed(2)}`]),
                  [
                    { text: 'TOTAL AMOUNT', bold: true },
                    { text: `$${this.totalExpense.toFixed(2)}`, bold: true }
                  ]
                ]
              },
              alignment: 'left',
              margin: [0, 10, 0, 10]
            };
  
            const expenseDetailsTable = {
              table: {
                headerRows: 1,
                widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                  [
                    { text: 'MONTH', style: { bold: true, fillColor: 'lightgrey' } },
                    { text: 'EXPENSE TYPE', style: { bold: true, fillColor: 'lightgrey' } },
                    { text: 'BUILDING', style: { bold: true, fillColor: 'lightgrey' } },
                    { text: 'AMOUNT PAID', style: { bold: true, fillColor: 'lightgrey' } },
                    { text: 'COMMENTS', style: { bold: true, fillColor: 'lightgrey' } }
                  ],
                  ...this.filteredExpense.map(data => [
                    data?.monthYear || '',
                    data?.expenseType || '',
                    data?.building || '',
                    data?.amountPaid.toFixed(2) || '',
                    data?.comments || ''
                  ])
                ]
              },
              style: { fontSize: 7.5 },
              margin: [0, 10, 0, 0]
            };
  
            content.push(
              { text: 'EXPENSE SUMMARY', fontSize: 14, bold: true, alignment: 'left', marginTop: 5, pageBreak: 'before' },
              summaryExpenseTable,
              fileType === 'detail' ? { text: 'EXPENSE DETAILS:', alignment: 'left', fontSize: 16, bold: true } : '',
              fileType === 'detail' ? expenseDetailsTable : ''
            );
  
            const footer = (currentPage: number, pageCount: number) => {
              return {
                columns: [
                  { text: `Generated by: Awais, Licensed Real Estate Broker \nTel: +1 (646) 239-0000, Email: realmawais@gmail.com`, fontSize: 8, width: 'auto', margin: [30, 15, 5, 0] },
                  ...(!this.isCoopApartment ? [{ text: `Awais Co.`, fontSize: 8, marginTop: 15, marginLeft: 70 }] : []),
                  { text: `\nPage ${currentPage} of ${pageCount}`, fontSize: 8, alignment: 'right', marginTop: 8, marginRight: 35 }
                ]
              };
            };
  
            const documentDefinition = {
              pageSize: 'A4',
              defaultStyle: {
                font: 'Roboto'
              },
              pageOrientation: fileType === 'detail' ? 'landscape' : 'portrait',
              content: content,
              footer
            };
  
            this.pdfAttachment = pdfMake.createPdf(documentDefinition).getBlob((pdfBlob) => {
              resolve(pdfBlob);
              if (download) {
                const url = window.URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileType === 'detail' ? 'Detailed' : 'Summary'}_Statement_${this.selectedCompany.companyName}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              }
            });
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('Error fetching the image:', error);
          reject(error);
        });
    });
  }

  getMonthYear(rent: any): string {
    return rent ? `${rent.month}-${rent.year}` : '';
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

  openConfirmationDialog(fileType: string): void {
    const message = `Hi ${this.selectedCompany.owner},\n Please find the attached Income/Expense statement for your building.\n\nThanks & Regards\nAwais\nTel: +1 (646) 239-0000 \n Licensed Real Estate Broker in NY`;
      
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: {
        title: 'Confirmation',
        message: message
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSending = true;
        this.sendOwnerPdf(fileType, result).then(() => {
          this.isSending = false;
          this.showToaster();
        }).catch(() => {
          this.isSending = false;
          this.showToasterError();
        });
      }
    });
  }

  showToaster() {
    this.toastr.success(`Email sent to: ${this.ownerEmail}`, 'Success', {
      timeOut: 3000, // Time to show the toaster message (in milliseconds)
      progressBar: true,
      closeButton: true
    });
  }

  showToasterError(): void {
    this.toastr.error('Error sending email.', 'Error', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  sendOwnerPdf(fileType: any, message: string): Promise<void> {
    this.loaderService.showLoader('master');
    return new Promise<void>((resolve, reject) => {
      const subject = encodeURIComponent(`Statement for ${this.selectedCompany.companyName}`);   
      const body = encodeURIComponent(message);
      const recipient = encodeURIComponent(this.ownerEmail);

      // Generate PDF attachment
      this.exportPdf(fileType).then(async (pdfBlob: Blob) => {

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
          filename: `${this.selectedCompany.companyName}_statement.pdf`,
        };
        const functionsURL = 'https://us-central1-webapp-rentpro.cloudfunctions.net/app';
        // POST request to node server
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
              console.log('Email sent successfully.');
              resolve();
            } else {
              this.loaderService.hideLoader('master');
              console.error('Error sending email.');
              reject();
            }
          })
          .catch(error => {
            this.loaderService.hideLoader('master');
            console.error('Error sending email:', error);
            reject();
          });
      });
    });
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return btoa(binary);
  }

}
