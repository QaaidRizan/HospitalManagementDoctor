import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupStep1Component } from './auth/signup-step1/signup-step1.component';
import { SignupStep2OtpComponent } from './auth/signup-step2-otp/signup-step2-otp.component';
import { SignupStep3CompleteComponent } from './auth/signup-step3-complete/signup-step3-complete.component';
import { ForgotPasswordStep1Component } from './auth/forgot-password-step1/forgot-password-step1.component';
import { ForgotPasswordStep2OtpComponent } from './auth/forgot-password-step2-otp/forgot-password-step2-otp.component';
import { ForgotPasswordStep3CompleteComponent } from './auth/forgot-password-step3-complete/forgot-password-step3-complete.component';
import { MyAppointmentsComponent } from './doctor/my-appointments/my-appointments.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { DashboardComponent } from './doctor/dashboard/dashboard.component';
import { PublicHeaderComponent } from './public/header/header.component';
import { PublicFooterComponent } from './public/footer/footer.component';
import { ProfileComponent } from './doctor/profile/profile.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AppointmentsDashboardComponent } from './doctor/appointments-dashboard/appointments-dashboard.component';
import { DoctorAvailabilityScheduleComponent, AvailabilityDialogComponent } from './doctor/doctor-availability-schedule/doctor-availability-schedule.component';
import { TestAppointmentsComponent } from './test-appointments/test-appointments.component';
import { PatientProfileComponent } from './doctor/patient-appoinment-profile/patient-appoinment-profile.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupStep1Component,
    SignupStep2OtpComponent,
    SignupStep3CompleteComponent,
    ForgotPasswordStep1Component,
    ForgotPasswordStep2OtpComponent,
    ForgotPasswordStep3CompleteComponent,
    MyAppointmentsComponent,
    DashboardComponent,
    PublicHeaderComponent,
    PublicFooterComponent,
    ProfileComponent,
    AppointmentsDashboardComponent,
    DoctorAvailabilityScheduleComponent,
    AvailabilityDialogComponent,
    TestAppointmentsComponent,
    PatientProfileComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatGridListModule,
    MatDialogModule,
    MatDividerModule,
    MatChipsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
