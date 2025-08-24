import { Component } from '@angular/core';

@Component({
  selector: 'app-test-appointments',
  template: `
    <div style="padding: 20px;">
      <h1>Test Components</h1>
      <p>This is a test page to verify the functionality of various components.</p>
      
      <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px;">
        <button mat-raised-button color="primary" routerLink="/appointments-dashboard">
          <mat-icon>dashboard</mat-icon>
          Appointments Dashboard
        </button>
        
        <button mat-raised-button color="accent" routerLink="/doctor-availability-schedule">
          <mat-icon>schedule</mat-icon>
          Schedule Availability
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class TestAppointmentsComponent {}
