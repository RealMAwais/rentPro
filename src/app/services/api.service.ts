import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Model } from 'src/app/model.model';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NgxUiLoaderService } from "ngx-ui-loader"; // Import NgxUiLoaderService
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  index: any;
  public subject = new Subject<any>();
  isLoggedIn = false;
  userLoggedIn: boolean;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    public NgxUiLoaderService: NgxUiLoaderService,
    private toastr: ToastrService
  ) {
    this.userLoggedIn = false;
    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.userLoggedIn = true;
      } else {
        this.userLoggedIn = false;
      }
    });
  }

  loginUser(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(() => {
        // console.log('Auth Service: loginUser: success');
        this.toastr.info(
          `${email} has been logged in.`,
          'Logged In',
          {
            timeOut: 2000
          }
        );
      })
      .catch(error => {
        // console.log('Auth Service: login error...', error);
        this.toastr.error(
          `Error while logging in : ${error}`,
          'Error',
          {
            timeOut: 2000
          }
        );
      });
  }

  ///////////////////////////////////////---GET CALLS---////////////////////////////////////
  getBuildingsAPI(): Observable<any> {
    return this.firestore.collection('Buildings').valueChanges();
  }

  getLeaseAPI(): Observable<any> {
    return this.firestore.collection('Lease').valueChanges();
  }

  getIncomeAPI(): Observable<any> {
    return this.firestore.collection('Income').valueChanges();
  }

  getExpenseAPI(): Observable<any> {
    return this.firestore.collection('Expense').valueChanges();
  }

  getRentAPI(): Observable<any> {
    return this.firestore.collection('Rent').valueChanges();
  }

  getMonthlyRentsAPI(): Observable<any> {
    return this.firestore.collection('monthly-rent-invoice').valueChanges();
  }

  getTaskAPI(): Observable<any> {
    return this.firestore.collection('Task').valueChanges();
  }

  getEmployeeAPI(): Observable<any> {
    return this.firestore.collection('Employee').valueChanges();
  }

  getCompanyAPI(): Observable<any> {
    return this.firestore.collection('Company').valueChanges();
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  deleteBuilding(buildingIndexId: any) {
    return this.firestore.collection('Buildings').doc(buildingIndexId).delete();
  }

  deleteLease(leaseID: any) {
    return this.firestore.collection('Lease').doc(leaseID).delete();
  }

  deleteIncome(id: any) {
    return this.firestore.collection('Income').doc(id).delete();
  }

  deleteExpense(id: any) {
    return this.firestore.collection('Expense').doc(id).delete();
  }

  deleteRent(id: any) {
    return this.firestore.collection('Rent').doc(id).delete();
  }

  deleteMonthlyRent(id: any) {
    return this.firestore.collection('monthly-rent-invoice').doc(id).delete();
  }

  deleteTask(id: any) {
    return this.firestore.collection('Task').doc(id).delete();
  }

  deleteEmployee(id: any) {
    return this.firestore.collection('Employee').doc(id).delete();
  }

  deleteCompany(id: any) {
    return this.firestore.collection('Company').doc(id).delete();
  }

  deleteUnit(unitDetails, selectedBuildingId) {
    return this.firestore.collection('Buildings').doc(selectedBuildingId).update({ 'unitDetails': unitDetails })
      .then(() => {
        console.log('Unit deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting unit:', error);
      });

  }

  //////////////////////////////////////////////////////////////////////////////

  addBuilding(dataObject: Model) {
    return this.firestore.collection('Buildings').doc(dataObject.id as any).set(dataObject);
  }

  updateBuilding(userObject: any, id: any) {
    this.firestore.collection('Buildings').doc(id).update(userObject);
  }

  updateLease(userObject: any, id: any) {
    this.firestore.collection('Lease').doc(id).update(userObject);
  }

  updateOnlyRent(leaseId: any, legalRent: number): Promise<void> {
    return this.firestore.collection('Lease').doc(leaseId).update({ legalRent: legalRent });
  }

  disableLease(id: string, disabledDate: string): Promise<void> {
    return this.firestore.collection('Lease').doc(id).update({ disabled: true, disabledDate: disabledDate, isRenewed: false });
  }

  enableLease(id: string, enabledDate: string): Promise<void> {
    return this.firestore.collection('Lease').doc(id).update({ disabled: false, enabledDate: enabledDate, disabledDate: '' });
  }

  updateUnit(unitDetails, selectedBuildingId) {
    return this.firestore.collection('Buildings').doc(selectedBuildingId).update({ 'unitDetails': unitDetails});
    // return this.firestore.collection('Buildings').doc(selectedBuildingId).update({ [`unitDetails.${unitNo}`]: updatedData });
  }

  // updateUnitRent(selectedBuildingId, rent) {
  //   return this.firestore.collection('Buildings').doc(selectedBuildingId).update({ rent: rent });
  // }

  // updateUnitRent(selectedBuildingId, unitNo: string, updatedRent) {
  //   return this.firestore.firestore.runTransaction(async (transaction) => {
  //     const buildingRef = this.firestore.collection('Buildings').doc(selectedBuildingId).ref;
  //     const doc = await transaction.get(buildingRef);

  //     if (!doc.exists) {
  //       throw new Error("Document does not exist!");
  //     }

  //     const updatedUnitDetails = doc.data().unitDetails.map(unit =>
  //       unit.unitNo === unitNo ? { ...unit, rent: updatedRent } : unit
  //     );

  //     transaction.update(buildingRef, { unitDetails: updatedUnitDetails });
  //   });
  // }

  updateUnitToBuilding(unitObject: any, selectedBuildingId: any) {
    return this.firestore.collection('Buildings').doc(selectedBuildingId).update({ 'unitDetails': arrayUnion(unitObject) });
  };

  updateCompany(id, companyObject: Model) {
    return this.firestore.collection('Company').doc(id).update(companyObject);
  }

  addLease(leaseObject: Model) {
    return this.firestore.collection('Lease').doc(leaseObject.id).set(leaseObject);
  }

  addCompany(companyObject: Model) {
    return this.firestore.collection('Company').doc(companyObject.id).set(companyObject);
  }

  addIncome(incomeObject: Model) {
    return this.firestore.collection('Income').doc(incomeObject.id).set(incomeObject);
  }

  addExpense(expenseObject: Model) {
    return this.firestore.collection('Expense').doc(expenseObject.id).set(expenseObject);
  }

  updateExpense(expenseObject, objectId) {
    return this.firestore.collection('Expense').doc(objectId).update(expenseObject);
  }

  addRent(rentObject: Model) {
    return this.firestore.collection('Rent').doc(rentObject.id).set(rentObject);
  }

  addBatchRent(rentArray: any[]) {
    const batch = this.firestore.firestore.batch();
  
    rentArray.forEach((rentObject) => {
      const docRef: DocumentReference<any> = this.firestore.collection('Rent').doc(rentObject.id).ref;
      batch.set(docRef, rentObject);
    });
  
    return batch.commit();
  }

  updateRent(rentId: string, newData: any): Promise<void> {
    return this.firestore.collection('Rent').doc(rentId).update(newData);
  }

  createMonthlyRent(rentObject: Model){
    return this.firestore.collection('Invoice').doc(rentObject.id).set(rentObject);
  }

  addTask(taskObject: Model) {
    return this.firestore.collection('Task').doc(taskObject.id).set(taskObject);
  }

  addEmployee(employeeObject: Model) {
    return this.firestore.collection('Employee').doc(employeeObject.id).set(employeeObject);
  }

}