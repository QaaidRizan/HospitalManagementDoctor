import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PatientDto {
  patientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  nationalID: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  isActive: boolean;
  profilePicturePath?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private baseUrl = environment.apiBaseUrl || '';

  constructor(private http: HttpClient) {}

  // If your backend exposes /api/Patients?userId=xxx
  getByUserId(userId: string): Observable<PatientDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<PatientDto>(`${this.baseUrl}/api/Patients`, { params });
  }

  // Get patient by patient ID
  getByPatientId(patientId: string): Observable<PatientDto> {
    return this.http.get<PatientDto>(`${this.baseUrl}/api/Patients/${patientId}`);
  }

  // Alternative (uncomment if endpoint is /api/Patients/user/{userId})
  // getByUserId(userId: string): Observable<PatientDto> {
  //   return this.http.get<PatientDto>(`${this.baseUrl}/api/Patients/user/${userId}`);
  // }
}