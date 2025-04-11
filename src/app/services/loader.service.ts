import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private showModalSource = new Subject<void>();
  showModal$ = this.showModalSource.asObservable();

  constructor(private ngxLoader: NgxUiLoaderService) { }

  showLoader(loaderId: string): void {
    this.ngxLoader.startLoader(loaderId);
  }

  hideLoader(loaderId: string): void {
    this.ngxLoader.stopLoader(loaderId);
  }

  triggerShowModal() {
    this.showModalSource.next();
  }
  
}
