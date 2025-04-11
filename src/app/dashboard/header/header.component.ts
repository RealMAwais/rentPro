import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor( public angularFireAuth: AngularFireAuth) { }

  ngOnInit(): void {
  }

  logOut(): void {
    this.angularFireAuth.signOut();
  }

}
