import { Component, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../services/api.service';
import 'jspdf-autotable';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import 'bootstrap';


@ViewChild('chequeImageModal')


@Component({
  selector: 'app-monthly-rent-invoice',
  templateUrl: './monthly-rent-invoice.component.html',
  styleUrls: ['./monthly-rent-invoice.component.css']
})


export class MonthlyRentInvoiceComponent implements OnInit {
  totalLength: any;
  p: any;
  deleteIndexId: any
  localArray_lease: any;
  fileName = 'Rent-Reports.xlsx';
  totalPayable = 0;
  selectedChequeImage: string = '';
  chequeImageModal: any;
  sortColumn: string = '';
  sortDirection: string = '';
  searchQuery: string;
  localArray_monthlyRents: any[] = [];
  filteredMonthlyRents: any[] = [];
  otherFee: any;
  isCoOpApartments: boolean;


  constructor(
    public ApiService: ApiService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getMonthlyInvoiceSummary();
  }


  openEnlargedChequeImageModal(chequeImage: string) {
    this.selectedChequeImage = chequeImage;
    console.log('image', this.selectedChequeImage);
    setTimeout(() => {
      this.modalService.open(this.chequeImageModal, { centered: true });
    }, 0);
  }

  searchButton() {
    // Filter the data based on the searchQuery
    const filteredDataArr = this.localArray_monthlyRents.filter(data =>
      data.building.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.isCoOpApartments = filteredDataArr.some((arr) => arr.propertyType === 'Co-op Apartments');
    // Update the data source for rendering in the table
    this.filteredMonthlyRents = filteredDataArr;
  }

  getMonthlyInvoiceSummary() {
    this.ApiService.getMonthlyRentsAPI().subscribe((fireBaseData: any) => {
      this.localArray_monthlyRents = fireBaseData;
      this.filteredMonthlyRents = this.localArray_monthlyRents;
      this.isCoOpApartments = this.filteredMonthlyRents.some((arr) => arr.propertyType === 'Co-op Apartments');
      this.findSum(this.localArray_monthlyRents);
    });
  }

  findSum(data: any) {
    for (let j = 0; j < data.length; j++) {
      this.totalPayable += data[j].totalPayable
    }
  }



  onEdit(id: any) {

  }

  downloadAsPDF(data: any) {

    // Convert the image to a data URL
    const logoPath = 'assets/images/ammanagement.png'; // Replace with the correct path to your image

    fetch(logoPath)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const logoDataURI = reader.result as string;

          // Create the table data
          const tableData = [
            [{ text: 'DESCRIPTION', bold: true }, { text: 'AMOUNT', bold: true }],
            [{ text: 'Rent:' }, { text: '$' + data.rent }],
            [{ text: 'Maintenance Fee:' }, { text: '$' + data.maintenanceFee }],

            ...(data.garageFee > 0 ? [[{ text: 'Garage Fee: ' }, { text: '$' + (data.garageFee) }]] : []),
            ...(data.storageSpaceFee > 0 ? [[{ text: 'Storage Space Fee: ' }, { text: '$' + (data.storageSpaceFee) }]] : []),
            ...(data.fuelCharges > 0 ? [[{ text: 'Antenna Fee: ' }, { text: '$' + (data.fuelCharges) }]] : []),
            ...(data.internetFee > 0 ? [[{ text: 'Internet Fee: ' }, { text: '$' + (data.internetFee) }]] : []),


            [{ text: 'Previous Balance:' }, { text: '$' + data.previousBalance }],
            [{ text: 'Total Payable Amount:', bold: true }, { text: '$' + (data.totalPayable) + ' ' + '*', bold: true }]
          ];

          // Create a new document definition
          const docDefinition = {
            content: [
              {
                columns: [
                  {
                    text: 'Building Name: ' + data.building,
                    bold: true,
                    alignment: 'left',
                    width: 'auto'
                  },
                  {
                    text: 'Property Type: ' + data.propertyType,
                    alignment: 'right',
                    width: '*'
                  }
                ],
                margin: [0, 0, 0, 5]
              },
              {
                columns: [
                  {
                    text: 'Unit No: ' + data.unitNo,
                    bold: true,
                    alignment: 'left',
                    width: 'auto'
                  },
                  {
                    text: 'Unit Type: ' + data.unitType,
                    alignment: 'right',
                    width: '*'
                  }
                ],
                margin: [0, 0, 0, 10]
              },
              {
                image: logoDataURI,
                width: 50,
                height: 50,
                alignment: 'center',
                margin: [0, 10, 0, 10]
              },
              { text: 'Monthly Rent Invoice', fontSize: 18, alignment: 'center', margin: [0, 0, 5, 10] },
              { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5 }, { type: 'line', x1: 0, y1: 8, x2: 515, y2: 8 }], margin: [0, 0, 5, 10] },
              { text: 'Tenant Name: ' + data.tenantName },
              { text: 'Lease ID: ' + data.leaseId },
              { text: 'Month: ' + data.month },
              { text: 'Year: ' + data.year },
              { text: 'Due Date: ' + data.rentDueDate },

              { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5 }], margin: [0, 0, 10, 50] }, // Line below the tenant data
              { text: 'Rent Calculations', fontSize: 14, bold: true, margin: [0, 10, 10, 0] },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', '*'],
                  body: tableData
                }
              },



              { text: '_____________________', alignment: 'center', margin: [0, 100, 0, 5] },
              { text: 'Awais', alignment: 'center' },
              { text: 'Licensed Broker', alignment: 'center' },
              { text: '(646) 239-0000', alignment: 'center' }
            ],
            // Footer definition
            footer: (currentPage: number, pageCount: number) => {
              return {
                text: [
                  { text: 'This is a computer-generated document. No signature is required.', alignment: 'center', fontSize: 8 },
                  { text: `\nPage ${currentPage} of ${pageCount}`, alignment: 'right', fontSize: 10 }
                ],
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

  // exportAsPDF() {
  //   const logoPath = 'assets/images/ammanagement.png';

  //   fetch(logoPath)
  //     .then(response => response.blob())
  //     .then(blob => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const logoDataURI = reader.result as string;

  //         const tableData: { text: string; bold?: boolean }[][] = [];

  //         this.filteredMonthlyRents.forEach((rowData, index) => {
  //           this.otherFee = rowData.garageFee + rowData.storageSpaceFee + rowData.fuelCharges + rowData.internetFee;
  //           debugger
  //           const headerRow = [
  //             { text: 'SR.', bold: true },
  //             { text: 'TENANT NAME', bold: true },
  //             { text: 'LEASE ID', bold: true },
  //             { text: 'MONTH', bold: true },
  //             { text: 'YEAR', bold: true },
  //             { text: 'DUE DATE', bold: true },
  //             { text: 'RENT', bold: true },
  //             { text: 'Maintenance Fee', bold: true },
  //             ...(this.otherFee > 0 ? [{ text: 'OTHER FEE', bold: true }] : []),
  //             { text: 'PREVIOUS BALANCE', bold: true },
  //             { text: 'TOTAL PAYABLE', bold: true },
  //           ];
  //           tableData.push(headerRow);


  //           const row = [
  //             { text: (index + 1).toString() },
  //             { text: rowData.tenantName.toString() },
  //             { text: rowData.leaseId.toString() },
  //             { text: rowData.month.toString() },
  //             { text: rowData.year.toString() },
  //             { text: rowData.rentDueDate.toString() },
  //             { text: rowData.rent.toString() },
  //             { text: rowData.maintenanceFee.toString() },
  //             ...(this.otherFee > 0 ? [{ text: '$' + this.otherFee.toString() }] : []),
  //             { text: rowData.previousBalance.toString() },
  //             { text: rowData.totalPayable.toString() },
  //           ];
  //           tableData.push(row);
  //         });

  //         const docDefinition = {
  //           pageSize: {
  //             width: 792,  // Specify the width of the landscape page in points (11 inches)
  //             height: 612  // Specify the height of the landscape page in points (8.5 inches)
  //           },
  //           pageOrientation: 'landscape',
  //           content: [
  //             { text: 'Building Name: ' + this.filteredMonthlyRents[0].building.toString(), margin: [0, 0, 0, 5] },
  //             { text: 'Unit No: ' + this.filteredMonthlyRents[0].unitNo.toString(), margin: [0, 0, 0, 5] },
  //             {
  //               image: logoDataURI,
  //               width: 50,
  //               height: 50,
  //               alignment: 'center',
  //               margin: [0, 10, 0, 10]
  //             },
  //             { text: 'Monthly Rent Report', fontSize: 18, alignment: 'center', margin: [0, 0, 5, 10] },
  //             {
  //               canvas: [
  //                 { type: 'line', x1: 0, y1: 5, x2: 792 - 40, y2: 5 },
  //                 { type: 'line', x1: 0, y1: 8, x2: 792 - 40, y2: 8 }
  //               ],
  //               margin: [0, 0, 5, 10],
  //               alignment: 'center'
  //             },
  //             {
  //               table: {
  //                 headerRows: 1,
  //                 fontSize: 6,
  //                 widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
  //                 body: [...tableData],
  //                 rowHeight: 8,
  //                 styles: {
  //                   cell: { noWrap: false }
  //                 }
  //               }
  //             }
  //           ],
  //           footer: (currentPage: number, pageCount: number) => {
  //             return {
  //               text: [
  //                 { text: 'This is a computer-generated document. No signature is required.', alignment: 'center', fontSize: 8 },
  //                 { text: `\nPage ${currentPage} of ${pageCount}`, alignment: 'right', fontSize: 10 }
  //               ],
  //               alignment: 'right',
  //               fontSize: 10,
  //               margin: [0, 10, 30, 0]
  //             };
  //           }
  //         };

  //         const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  //         pdfDocGenerator.download('Rent-Reports.pdf');
  //       };
  //       reader.readAsDataURL(blob);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching the image:', error);
  //     });
  // }

  deleteRent(id: any) {
    this.ApiService.deleteMonthlyRent(id);
  }


  ////////////////////////////////////////-------EXPORT CSV FILE METHOD----//////////////////////////////////////////////
  // exportData(): void {
  //   let element = document.getElementById('excel_table');
  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  //   XLSX.writeFile(wb, this.fileName); //save to file
  // }

  sortTable(column: string) {
    // If the same column is clicked, reverse the sorting direction
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If a different column is clicked, set the sort column and direction
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Call the sorting function based on the column and direction
    this.sortData();
  }

  sortData() {
    // Sort the data array based on the sortColumn and sortDirection
    this.localArray_monthlyRents.sort((a, b) => {
      // Compare the values based on the sortColumn
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      // If the column contains numeric values, convert them to numbers
      if (!isNaN(valA) && !isNaN(valB)) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      // Compare the values and return the sorting result based on the sortDirection
      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

}
