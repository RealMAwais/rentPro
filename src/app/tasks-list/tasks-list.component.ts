import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent implements OnInit {

  localArray_task: any;
  totalLength: any;
  p: any;
  deleteIndexId: any;
  fileName = 'Tasks.xlsx';
  selectedBuildingId: string;
  localArray_building: any;
  selectedBuilding: any;
  extractedBuildingId: any;
  taskForm: FormGroup;
  unitOptionsArray: any;
  taskStatusOptions = [{ value: 'Completed' }, { value: 'In Progress' }, { value: 'On Hold' }];
  taskTypeOptions = [{ value: 'Plumbing' }, { value: 'Heating' }, { value: 'Repair' }, { value: 'Air Conditioning' }];
  selectedUnitNo: string;
  mySelectedIndexFilter: any;


  constructor(
    public ApiService: ApiService,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {


    this.taskForm = this.fb.group({
      building: '586 Union Street',
      taskType: ['', Validators.required],
      unitNo: '',
      taskStatus: '',
      taskStartDate: '',
      taskEndDate: '',
      taskDescription: ''
    });

  }

  ngOnInit(): void {
    this.getTaskData();
  }

  getTaskData() {
    this.ApiService.getTaskAPI().subscribe((fireBaseData: any) => {
      this.localArray_task = fireBaseData;
    });
  }

  get fTask() {
    return this.taskForm.controls;
  }

  onEdit(id: any) {

  }

  deleteTask(id: any) {
    this.ApiService.deleteTask(id);
  }

  ////////////////////////////////////////-------EXPORT CSV FILE METHOD----//////////////////////////////////////////////
  exportData(): void {
    let element = document.getElementById('excel_table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.fileName); //save to file
  }

  onBuildingDropDown(event: Event) {

    this.selectedBuildingId = (event.target as HTMLSelectElement).value;
    // console.log('building dropdown id: ', this.selectedBuildingId);

    this.selectedBuilding = this.localArray_building.filter(data => data.address.toLowerCase() === this.selectedBuildingId.toLowerCase());
    this.extractedBuildingId = this.selectedBuilding[0].id;
    // console.log('extractedBuildingId', this.extractedBuildingId);

  }

  resetTaskForm() {
    this.taskForm.reset();
  }

  unitOptionsForSelectedBuilding() { //patching values in add lease form modal

    // // const selectedBuilding = this.leaseForm.get('building').value;
    // const selectedBuildingData = this.localArray_home.find(item => item.address === selectedBuilding);

    // if (selectedBuildingData) {
    //   this.unitOptionsArray = selectedBuildingData.unitDetails;

    //   // Autofill rent in legalRent field in leasform modal
    //   const selectedUnitNo = this.leaseForm.get('unitNo').value; // get value of unit No from html
    //   const selectedUnitObj = this.unitOptionsArray.find(item => item.unitNo === selectedUnitNo);
    //   // console.log('selectedUnit', selectedUnitObj);


    //   const filteredLeaseArray = this.localArray_lease.filter(element => {
    //     return element.building.toLowerCase() === selectedBuilding.toLowerCase();
    //   });


    //   this.unitExistInLeaseArray = filteredLeaseArray.some(element => {
    //     return element.unitNo.toLowerCase() === selectedUnitNo.toLowerCase();
    //   }); // check duplicate unit from lease array

    // }
  }

  ///////////////////////////---Monthly Rent Invoice Methods---//////////////////////
  unitDropDown(event: Event) {
    this.selectedUnitNo = (event.target as HTMLSelectElement).value;
    this.mySelectedIndexFilter = this.localArray_building.filter(data => data.id === this.extractedBuildingId);
    this.mySelectedIndexFilter.map(items => this.unitOptionsArray = items.unitDetails);

  }


  addTasktoFirestore() {
    let taskObject = this.taskForm.value;
    const id = this.firestore.createId();
    taskObject['id'] = id;
    this.ApiService.addTask(taskObject);
    this.taskForm.reset();
  }

}
