import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SignupStep1Request {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface SignupVerifyOtpRequest {
  email: string;
  otp: string;
}

export interface SignupCompleteRequest {
  email: string;
  dateOfBirth: string; // ISO string per requirement
  phoneNumber: number;
  emergencyContact: number;
  gender: string;
  nationalID: string;
  address: string;
  bloodGroup: string;
}

export interface DoctorCompleteRequest {
  email: string;
  phoneNumber: string; // <-- Change from number to string
  dateOfBirth: string;
  specialization: string;
  licenseNumber: number;
  department: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordInitiateRequest {
  email: string;
}

export interface ForgotPasswordVerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordCompleteRequest {
  email: string;
  newPassword: string;
  resetToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiBaseUrl || '';

  constructor(private http: HttpClient) {}

  signupStep1(payload: SignupStep1Request): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/Patient/registers`, payload);
  }

  signupVerifyOtp(payload: SignupVerifyOtpRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/register/verify-otp`, payload);
  }

  signupComplete(payload: SignupCompleteRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/register/complete`, payload);
  }

  login(payload: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/login`, payload);
  }

  forgotPasswordInitiate(payload: ForgotPasswordInitiateRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/forgot-password/initiate`, payload);
  }

  forgotPasswordVerifyOtp(payload: ForgotPasswordVerifyOtpRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/forgot-password/verify-otp`, payload);
  }

  forgotPasswordComplete(payload: ForgotPasswordCompleteRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/forgot-password/complete`, payload);
  }

  registerDoctor(payload: DoctorCompleteRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/Doctor/register`, payload);
  }
}


