import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BuildingTableComponent } from './building-table/building-table.component';
// import { HomeComponent } from './home/home.component';
import { LeaseComponent } from './lease/lease.component';
import { IncomeExpenseSummaryComponent } from './icome-expense-summary/income-expense-summary.component';
import { ExpenseSummaryComponent } from './expense-summary/expense-summary.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { RentReportComponent } from './rent-report/rent-report.component';
import { AuthGuard } from './services/auth.guard';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { UnitListComponent } from './unit-list/unit-list.component';
import { MonthlyRentInvoiceComponent } from './monthly-rent-invoice/monthly-rent-invoice.component';
import { RentPaymentsComponent } from './rent-payments/rent-payments.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'dashboard/building', component: BuildingTableComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/lease-summary', component: LeaseComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/income-expense-summary', component: IncomeExpenseSummaryComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/expense-summary', component: ExpenseSummaryComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/rent-summary', component: RentReportComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/rent-payments', component: RentPaymentsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/monthly-rent-invoice', component: MonthlyRentInvoiceComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/task', component: TasksListComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/employee', component: EmployeeListComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/company', component: CompanyListComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/unit', component: UnitListComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },




];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
