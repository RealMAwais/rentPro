import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-top-widgets',
  templateUrl: './top-widgets.component.html',
  styleUrls: ['./top-widgets.component.css']
})
export class TopWidgetsComponent implements OnInit {
  localArray_lease: any;
  leaseLength: any;
  buildingLength: any;
  unitLength: any;
  localArray_buildings: any;
  localArray_company: any;
  companyLength: any;
  localArray_unit: any;

  constructor(public ApiService: ApiService) { }

  ngOnInit(): void {
    this.getLeaseData();
    this.getBuildingData();
    this.getCompanyData();
    this.getUnitData();
  }

  getLeaseData() {
    this.ApiService.getLeaseAPI().subscribe((fireBaseData: any) => {
      this.localArray_lease = fireBaseData;
      this.leaseLength = this.localArray_lease.length
    })
  }

  getBuildingData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_buildings = fireBaseData;
      this.buildingLength = this.localArray_buildings.length
    })
  }

  getCompanyData() {
    this.ApiService.getCompanyAPI().subscribe((fireBaseData: any) => {
      this.localArray_company = fireBaseData;
      this.companyLength = this.localArray_company.length;
    })
  }

  getUnitData() {
    this.ApiService.getBuildingsAPI().subscribe((fireBaseData: any) => {
      this.localArray_unit = fireBaseData;
      // console.log('local array of units:', this.localArray_unit);
      this.calculateUnitLength(this.localArray_unit);
    })
  }

  calculateUnitLength(localArray_unit) {
    // below is sum up the lengths of unitDetails arrays
    this.unitLength = localArray_unit.reduce((totalLength, building) => {
      return totalLength + (building.unitDetails?.length || 0);
    }, 0);
  }

}
