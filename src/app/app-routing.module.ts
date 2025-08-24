import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './doctor/profile/profile.component';
import { SignupStep1Component } from './auth/signup-step1/signup-step1.component';
import { SignupStep2OtpComponent } from './auth/signup-step2-otp/signup-step2-otp.component';
import { SignupStep3CompleteComponent } from './auth/signup-step3-complete/signup-step3-complete.component';
import { ForgotPasswordStep1Component } from './auth/forgot-password-step1/forgot-password-step1.component';
import { ForgotPasswordStep2OtpComponent } from './auth/forgot-password-step2-otp/forgot-password-step2-otp.component';
import { ForgotPasswordStep3CompleteComponent } from './auth/forgot-password-step3-complete/forgot-password-step3-complete.component';
import {DashboardComponent} from './doctor/dashboard/dashboard.component';
import { MyAppointmentsComponent } from './doctor/my-appointments/my-appointments.component';
import { AppointmentsDashboardComponent } from './doctor/appointments-dashboard/appointments-dashboard.component';
import { DoctorAvailabilityScheduleComponent } from './doctor/doctor-availability-schedule/doctor-availability-schedule.component';
import { TestAppointmentsComponent } from './test-appointments/test-appointments.component';
import { PatientProfileComponent } from './doctor/patient-appoinment-profile/patient-appoinment-profile.component';


import { RequireEmailGuard } from './guards/require-email.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'test-appointments', component: TestAppointmentsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupStep1Component },
  { path: 'signup/verify-otp', component: SignupStep2OtpComponent, canActivate: [RequireEmailGuard], data: { requiresEmailRedirectTo: '/signup' } },
  { path: 'signup/complete', component: SignupStep3CompleteComponent, canActivate: [RequireEmailGuard], data: { requiresEmailRedirectTo: '/signup' } },

  { path: 'forgot-password', component: ForgotPasswordStep1Component },
  { path: 'forgot-password/verify-otp', component: ForgotPasswordStep2OtpComponent, canActivate: [RequireEmailGuard], data: { requiresEmailRedirectTo: '/forgot-password' } },
  { path: 'forgot-password/complete', component: ForgotPasswordStep3CompleteComponent, canActivate: [RequireEmailGuard], data: { requiresEmailRedirectTo: '/forgot-password' } },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  { path: 'my-appointments', component: MyAppointmentsComponent, canActivate: [AuthGuard] },
  { path: 'appointments-dashboard', component: AppointmentsDashboardComponent, canActivate: [AuthGuard] },
  { path: 'appointments/:id', component: PatientProfileComponent, canActivate: [AuthGuard] },
  { path: 'doctor-availability-schedule', component: DoctorAvailabilityScheduleComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }


  
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }