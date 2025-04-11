import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-widget-right',
  templateUrl: './widget-right.component.html',
  styleUrls: ['./widget-right.component.css'],
})
export class WidgetRightComponent implements OnInit {
  localArray_rent: any[] = [];
  countPaidRents: number;
  countUnpaidRents: number;
  monthNames = [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  localArray_lease: any;
  activeLeaseArray: any;
  expiredLeaseArray: any;

  totalResidentialRentReceived: number;
  localArray_expense: any;
  filteredExpense: any;
  totalExpense: any;
  currentMonth: string;
  currentYear: number;
  localArray_income: any;
  incomeTabAmount: number;
  selectedBuildingName: string;
  localArray_Building: any;
  selectedBuildingObject: any;
  extractedBuildingId: any;
  totalPayable: any;
  totalIncome: any;

  constructor(public ApiService: ApiService) {}

  ngOnInit() {
    this.ApiService.getIncomeAPI().subscribe((fireBaseData: any) => {
      this.localArray_income = fireBaseData;
      this.getIncomeData(this.localArray_income, () => {
        this.getRentData();
        this.getExpenseData();
        this.getBuildingData();
      });
    });
  }

  getBuildingData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_Building = fireBaseData;
    });
  }

  getExpenseData() {
    this.ApiService.getExpenseAPI().subscribe((fireBaseData: any) => {
      this.localArray_expense = fireBaseData;
      this.totalExpensePaid(this.localArray_expense);
    });
  }

  getRentData() {
    this.ApiService.getRentAPI().subscribe((fireBaseData: any) => {
      this.localArray_rent = fireBaseData;

      this.totalPayableAmount(this.localArray_rent);
      this.totoalAmountRcvd(this.localArray_rent);
      
      const currentMonth = new Date().getMonth();
      const currentMonthName = this.monthNames[currentMonth];
      this.currentYear = new Date().getFullYear();   
      this.currentMonth = currentMonthName;

      this.countPaidRents = this.localArray_rent.filter((rent) => {
        return (rent.paidRent !== 0 && parseFloat(rent.paidRent) > 0) && rent.month === currentMonthName;
      }).length;

      this.countUnpaidRents = this.localArray_rent.filter((rent) => {
        return parseFloat(rent.paidRent) === 0 && rent.month === currentMonthName;
      }).length;
      this.rentChart();
    });
  }

  rentChart() {
    const labels = ['Paid Rent', 'Unpaid Rent']; // Replace with your labels
    const data = [this.countPaidRents, this.countUnpaidRents]; // Replace with your data values
    const backgroundColor = ['green', 'rgb(126, 5, 5)']; // Replace with your colors

    new Chart('rentChart', {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColor,
          },
        ],
      },
    });
  }

  
  getIncomeData(incomeArr, callback: () => void) {
    // console.log('local array:', incomeArr);
    const income = incomeArr.reduce((total, data) => {
      return total + parseFloat(data?.amount) || 0;
    }, 0).toFixed(2);

    this.incomeTabAmount = parseFloat(income);
    callback();
  }

  totoalAmountRcvd(rentDataArr) {
    const filteredArr = rentDataArr.filter((data) => data.building === this.selectedBuildingName);
    this.totalIncome = filteredArr.reduce((total, rent) => {
      return (total + (parseFloat(rent?.paidRent) || 0));
    }, 0).toFixed(2);
  }

  totalPayableAmount(rentDataArr) {
    const filteredArr = rentDataArr.filter((data) => data.building === this.selectedBuildingName);
    this.totalPayable = filteredArr.reduce((total, rent) => {
      return total + (parseFloat(rent?.totalPayable) || 0);
    }, 0);
  }
  
  totalExpensePaid(expenseDataArr) {
    const filteredArr = expenseDataArr.filter((data) => data.building === this.selectedBuildingName);
    this.totalExpense = filteredArr.reduce((total, expense) => {
      return total + (parseFloat(expense?.amountPaid) || 0);
    }, 0);
  }

  onBuildingDropDown(event: Event) {
    this.selectedBuildingName = (event.target as HTMLSelectElement).value;
    this.selectedBuildingObject = this.localArray_Building.filter(data => data.address.toLowerCase() === this.selectedBuildingName.toLowerCase());
    this.extractedBuildingId = this.selectedBuildingObject[0].id;
    this.totalPayableAmount(this.localArray_rent);
    this.totoalAmountRcvd(this.localArray_rent);
  }
}
