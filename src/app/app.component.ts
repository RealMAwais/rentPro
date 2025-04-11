import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'webapp-rentpro';

  lastActivityTime: number;
  logoutTimer: any;


  constructor(
    public angularFireAuth: AngularFireAuth,
    private router: Router,
  ) { }

  ngOnInit() {
    this.lastActivityTime = Date.now();
    this.startIdleTimer();
  }

  startIdleTimer() {
    this.logoutTimer = setTimeout(() => this.logout(), 300000); // 5 minutes (300,000 milliseconds)
  }

  resetIdleTimer() {
    clearTimeout(this.logoutTimer);
    this.startIdleTimer();
    this.lastActivityTime = Date.now();
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])
  @HostListener('document:click', ['$event'])
  onUserActivity(event: MouseEvent) {
    this.resetIdleTimer();
  }

  logout() {
    this.angularFireAuth.signOut().then(() => {
      // Logout successful
      // Redirect to login page or perform any additional tasks
    }).catch((error) => {
      // Error occurred during logout
      console.error('Logout Error:', error);
    });
  }




  isHomePage(): boolean {
    return this.router.url === '/home';
  }

  isDashboard(): boolean {
    return this.router.url === '/dashboard'
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  logOut(): void {
    this.angularFireAuth.signOut();
  }
}
