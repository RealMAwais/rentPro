import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-rents-by-month',
  templateUrl: './rents-by-month.component.html',
  styleUrls: ['./rents-by-month.component.css']
})
export class RentsByMonthComponent implements OnInit {
  localArray_rent: any;
  localArray_expense: any;
  monthNames = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  rentSumByMonthCoop: { [month: string]: any } = {};
  rentSumByMonthResd: { [month: string]: any } = {};
  expenseSumByMonthCoop: any;
  expenseSumByMonthResd: any;
  dataFetched: any = 0;
  selectedYear = new Date().getFullYear();

  constructor(
    public ApiService: ApiService
  ) { }

  ngOnInit(): void {
    this.ApiService.getExpenseAPI().subscribe((fireBaseData: any) => {
      this.localArray_expense = fireBaseData;
      this.dataFetched++; // Increment counter for expense data
      this.checkDataAvailability();
    });

    this.ApiService.getRentAPI().subscribe((fireBaseData: any) => {
      this.localArray_rent = fireBaseData;
      this.dataFetched++; // Increment counter for rent data
      this.checkDataAvailability();
    });
  }

  onYearChange() {
    this.calculateChartDataByMonth(); // When the year changes, recalculate the chart data
  }
  
  checkDataAvailability() { // Check if both data sets have been fetched
    if (this.dataFetched === 2) {
      this.calculateChartDataByMonth();
    }
  }

  calculateChartDataByMonth() {
    this.rentSumByMonthCoop = {};
    this.rentSumByMonthResd = {};
    this.expenseSumByMonthCoop = {};
    this.expenseSumByMonthResd = {};
    const currentYear = Number(this.selectedYear);

    // Filter rent data for Co-op Apartments
    this.ApiService.getRentAPI().subscribe((fireBaseData: any) => {
      this.localArray_rent = fireBaseData;
    });
    

    const coopData = this.localArray_rent.filter(data => data.propertyType === 'Co-op Apartments');
    const coopMonthlyRentArray = coopData.filter(data => +data.year === currentYear);
    // Calculate rent sums for Co-op Apartments
    for (const rent of coopMonthlyRentArray) {
      if (rent.month && rent.paidRent) {
        const monthName = rent.month;
        const rentValue = parseFloat(rent.paidRent); // Convert rentValue to a number

        if (!this.rentSumByMonthCoop[monthName]) {
          this.rentSumByMonthCoop[monthName] = rentValue;
        } else {
          this.rentSumByMonthCoop[monthName] += rentValue;
        }
      }
    }

    // Filter rent data for Residential
    const residentialData = this.localArray_rent.filter(data => data.propertyType === 'Residential');
    const residentialMonthlyRentArray = residentialData.filter(data => +data.year === currentYear);
    // Calculate rent sums for Residential
    for (const rent of residentialMonthlyRentArray) {
      if (rent.month && rent.paidRent) {
        const monthName = rent.month;
        const rentValue = parseFloat(rent.paidRent); // Convert rentValue to a number

        if (!this.rentSumByMonthResd[monthName]) {
          this.rentSumByMonthResd[monthName] = rentValue;
        } else {
          this.rentSumByMonthResd[monthName] += rentValue;
        }
      }
    }

    this.ApiService.getExpenseAPI().subscribe((fireBaseData: any) => {
      this.localArray_expense = fireBaseData;
    });
    
    // Filter expense data for Co-op Apartments
    const coopExpenseData = this.localArray_expense.filter(data => data?.propertyType === 'Co-op Apartments');
    let coopMonthlyExpenseArr = coopExpenseData?.filter(data => +data.year === currentYear);
    // Calculate expense sum for Co-op Apartments
    for (const exp of coopMonthlyExpenseArr) {
      if (exp.month && exp.amountPaid) {
        const monthName = exp.month;
        const expValue = parseFloat(exp.amountPaid); // Convert rentValue to a number

        if (!this.expenseSumByMonthCoop[monthName]) {
          this.expenseSumByMonthCoop[monthName] = expValue;
        } else {
          this.expenseSumByMonthCoop[monthName] += expValue;
        }
      }
    }

    // Filter expense data for Residential Apartments
    const resdExpenseData = this.localArray_expense ? this.localArray_expense.filter(data => data?.propertyType === 'Residential') : [];
    let resdMonthlyExpenseArr = resdExpenseData.filter(data => +data.year === currentYear);
    // Calculate expense sum for Residential
    for (const exp of resdMonthlyExpenseArr) {
      if (exp.month && exp.amountPaid) {
        const monthName = exp.month;
        const expValue = parseFloat(exp.amountPaid); // Convert rentValue to a number

        if (!this.expenseSumByMonthResd[monthName]) {
          this.expenseSumByMonthResd[monthName] = expValue;
        } else {
          this.expenseSumByMonthResd[monthName] += expValue;
        }
      }
    }

    this.createChart();
  }  

  createChart() {
    const rentCountsCoopData = this.monthNames.map(monthName =>
      parseFloat(this.rentSumByMonthCoop[monthName] || 0).toFixed(2)
    );
    const rentCountsResidentialData = this.monthNames.map(monthName =>
      parseFloat(this.rentSumByMonthResd[monthName] || 0).toFixed(2)
    );
    const coopExpense = this.monthNames.map(monthName =>
      parseFloat(this.expenseSumByMonthCoop[monthName] || 0).toFixed(2)
    );
    const resdExpense = this.monthNames.map(monthName =>
      parseFloat(this.expenseSumByMonthResd[monthName] || 0).toFixed(2)
    );

    new Chart('myChart', {
      type: 'bar',
      data: {
        labels: this.monthNames,
        datasets: [{
          label: 'Co-op Income', // Label for the first dataset
          data: rentCountsCoopData,
          backgroundColor: "#198754",
          borderColor: "offwhite",
          borderWidth: 2
        },
        {
          label: 'Co-op Expense', // Label for the third dataset
          data: coopExpense,
          backgroundColor: "rgb(237, 158, 32)",
          borderColor: "offwhite",
          borderWidth: 2
        },
        {
          label: 'Residential Income', // Label for the second dataset
          data: rentCountsResidentialData,
          backgroundColor: "#0d6efd",
          borderColor: "offwhite",
          borderWidth: 2
        },
        {
          label: 'Residential Expense', // Label for the fourth dataset
          data: resdExpense,
          backgroundColor: "rgb(126, 5, 5)",
          borderColor: "offwhite",
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }

    });
  }

  getMonthName(monthNumber: number): string {
    return this.monthNames[monthNumber];
  }

}
