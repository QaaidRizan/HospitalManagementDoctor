import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-public-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class PublicHeaderComponent implements OnInit {
  @Input() username: string = 'User';
  @Input() profileImageUrl: string = 'assets/images/default-avatar.webp';
  @Output() actionSelected = new EventEmitter<string>();

  showProfileDropdown = false;
  userId: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.userId = sessionStorage.getItem('user_id');
    if (this.userId) {
      this.loadDoctorProfile(this.userId);
    }
  }

  loadDoctorProfile(userId: string): void {
    this.http.get<any>(`${environment.apiBaseUrl}/api/Doctor/user/${userId}`).subscribe({
      next: (doctor) => {
        this.username = `${doctor.title ? doctor.title + ' ' : ''}${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
        this.profileImageUrl = doctor.profilePicturePath
          ? `${environment.apiBaseUrl}/${doctor.profilePicturePath.replace(/^\/+/, '')}`
          : 'assets/images/default-avatar.png';
      },
      error: () => {
        this.username = 'User';
        this.profileImageUrl = 'assets/images/default-avatar.webp';
      }
    });
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  onProfileAction(action: string): void {
    this.showProfileDropdown = false;
    this.actionSelected.emit(action);
    switch (action) {
      case 'edit-profile':
        this.router.navigate(['/profile']);
        break;
      case 'appointments':
        this.router.navigate(['/doctor-availability-schedule']);
        break;
      case 'my-appointments':
        this.router.navigate(['/my-appointments']);
        break;
      case 'appointments-dashboard':
        this.router.navigate(['/appointments-dashboard']);
        break;
      case 'medical-records':
        this.router.navigate(['/medical-records']);
        break;
      case 'prescriptions':
        this.router.navigate(['/prescriptions']);
        break;
      case 'logout':
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_id');
        this.router.navigate(['/login']);
        break;
    }
  }

  handleImageError(): void {
    this.profileImageUrl = 'assets/images/default-avatar.webp';
  }
}


