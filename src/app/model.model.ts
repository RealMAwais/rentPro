export class Model {

    owner?: string = '';
    adminCompany?: string = '';
    propertyType?: any;
    address?: string = '';
    city?: any;
    state?: string = '';
    zip?: number = 0;
    wsh_dry?: any;
    elevator?: any;
    totalUnit?: number = 0;
    amount_fine?: number = 0;
    remarks?: string = '';
    id?: string;
    companyName: any;
    paidRent: any;
    legalRent: any;
    remainingBalance: any;
    previousBalance: any;
    discount: any;
    lateFee: any;
    maintenanceFee: any;
    //////////////////////
    unitNo?: string = '';
    unitType?: string = '';
    beds?: number = 0;
    baths?: number = 0;
    floors?: number = 0;
    rent?: number = 0;
    security?: number = 0;
    /////////////////////

    buildingId?: string;

}
