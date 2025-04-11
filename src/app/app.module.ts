import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';
import { BuildingTableComponent } from './building-table/building-table.component'
import { NgxPaginationModule } from 'ngx-pagination';
import { LeaseComponent } from './lease/lease.component';
import { RentPaymentsComponent } from './rent-payments/rent-payments.component';
import { RentReportComponent } from './rent-report/rent-report.component';
import { IncomeExpenseSummaryComponent } from './icome-expense-summary/income-expense-summary.component';
import { ExpenseSummaryComponent } from './expense-summary/expense-summary.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { ApiService } from './services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { UnitListComponent } from './unit-list/unit-list.component';
import { NgxUiLoaderModule, NgxUiLoaderRouterModule } from "ngx-ui-loader";
import { MatDialogModule } from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { MonthlyRentInvoiceComponent } from './monthly-rent-invoice/monthly-rent-invoice.component';
import { ToastrModule } from 'ngx-toastr';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SideNavComponent } from './dashboard/side-nav/side-nav.component';
import { MainComponent } from './dashboard/main/main.component';
import { HeaderComponent } from './dashboard/header/header.component';
import { TopWidgetsComponent } from './dashboard/main/top-widgets/top-widgets.component';
import { RentsByMonthComponent } from './dashboard/main/rents-by-month/rents-by-month.component';
import { WidgetRightComponent } from './dashboard/main/widget-right/widget-right.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { LoaderService } from './services/loader.service';

@NgModule({
  declarations: [
    AppComponent,
    BuildingTableComponent,
    LeaseComponent,
    RentPaymentsComponent,
    RentReportComponent,
    IncomeExpenseSummaryComponent,
    ExpenseSummaryComponent,
    PageNotFoundComponent,
    LoginComponent,
    TasksListComponent,
    EmployeeListComponent,
    CompanyListComponent,
    UnitListComponent,
    MonthlyRentInvoiceComponent,
    DashboardComponent,
    SideNavComponent,
    MainComponent,
    HeaderComponent,
    TopWidgetsComponent,
    RentsByMonthComponent,
    WidgetRightComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    NgxPaginationModule,
    MatButtonModule,
    MatCardModule, MatDialogModule,
    MatInputModule,
    NgxUiLoaderModule.forRoot({
      bgsColor: '#00ACC1',
      bgsOpacity: 0.5,
      bgsPosition: 'bottom-right',
      bgsSize: 60,
      bgsType: 'ball-spin-clockwise',
      blur: 5,
      fgsColor: '#00ACC1',
      fgsPosition: 'center-center',
      fgsSize: 60,
      fgsType: 'ball-spin-clockwise',
      gap: 24,
      logoPosition: 'center-center',
      logoSize: 120,
      logoUrl: '',
      masterLoaderId: 'master',
      overlayBorderRadius: '0',
      overlayColor: 'rgba(40, 40, 40, 0.8)',
      pbColor: '#00ACC1',
      pbDirection: 'ltr',
      pbThickness: 3,
      hasProgressBar: true,
      text: '',
      textColor: '#FFFFFF',
      textPosition: 'center-center',
    }),
    NgxUiLoaderRouterModule.forRoot({ showForeground: true }), NgbModule,
    ToastrModule.forRoot(), MatFormFieldModule,
    MatSelectModule,
    NgbModule
  ],
  providers: [
    ApiService,
    AppComponent,
    BuildingTableComponent,
    LeaseComponent,
    RentPaymentsComponent,
    RentReportComponent,
    IncomeExpenseSummaryComponent,
    ExpenseSummaryComponent,
    PageNotFoundComponent,
    LoginComponent,
    TasksListComponent,
    EmployeeListComponent,
    CompanyListComponent,
    UnitListComponent,
    DatePipe,
    LoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
