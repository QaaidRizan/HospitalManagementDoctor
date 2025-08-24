import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PatientService, PatientDto } from './patient.service';

export interface AppointmentDto {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  consultationType: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithPatientDto extends AppointmentDto {
  patient: PatientDto;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private baseUrl = environment.apiBaseUrl || '';

  constructor(
    private http: HttpClient,
    private patientService: PatientService
  ) {}

  getAppointmentById(appointmentId: string): Observable<AppointmentDto> {
    return this.http.get<AppointmentDto>(`${this.baseUrl}/api/Appointments/${appointmentId}`);
  }

  updateAppointmentStatus(appointmentId: string, status: string): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(
      `${this.baseUrl}/api/Appointments/${appointmentId}`,
      { status }
    );
  }

  updateAppointmentNotes(appointmentId: string, notes: string): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(
      `${this.baseUrl}/api/Appointments/${appointmentId}`,
      { notes }
    );
  }

  getAppointmentsByDoctorId(doctorId: string): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.baseUrl}/api/Appointments/doctor/${doctorId}`);
  }

  getAppointmentsWithPatientDetails(doctorId: string): Observable<AppointmentWithPatientDto[]> {
    return this.getAppointmentsByDoctorId(doctorId).pipe(
      switchMap((appointments) => {
        if (!appointments || appointments.length === 0) {
          return of([] as AppointmentWithPatientDto[]);
        }

        const patientObservables = appointments.map((appointment) =>
          this.patientService.getByPatientId(appointment.patientId).pipe(
            map((patient) => ({
              ...appointment,
              patient
            }))
          )
        );

        return forkJoin(patientObservables);
      })
    );
  }
}
