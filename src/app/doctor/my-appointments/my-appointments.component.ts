import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css']
})
export class MyAppointmentsComponent implements OnInit {
  environment = environment; // <-- Add this line
  isLoading = false;
  error: string | null = null;
  patient: { patientId: string } | null = null;
  appointments: AppointmentWithDoctor[] = [];
  isCancelling: Record<string, boolean> = {};
  rowErrors: Record<string, string | null> = {};
  patientName: string = 'Patient';
  patientImageUrl: string = 'assets/images/default-avatar.webp';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadData();
  }
  

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  

  // Load whole flow: patient -> appointments -> doctors
  private loadData(): void {
    this.isLoading = true;
    this.error = null;
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      this.error = 'Missing session. Please login again.';
      this.isLoading = false;
      return;
    }
    // Get doctorId from userId
    this.http.get<any>(`${environment.apiBaseUrl}/api/Doctor/user/${userId}`)
      .pipe(
        switchMap(doctor => {
          const doctorId = doctor.doctorId;
          return this.http.get<AppointmentDto[]>(`${environment.apiBaseUrl}/api/Appointments/doctor/${doctorId}`);
        }),
        switchMap((appts) => {
          if (!appts || appts.length === 0) {
            return of([] as AppointmentWithDoctor[]);
          }
          const requests = appts.map(appt =>
            forkJoin({
              doctor: this.fetchDoctorDetails(appt.doctorId).pipe(
                catchError(() => of(null))
              ),
              patient: this.fetchPatientDetails(appt.patientId).pipe(
                catchError(() => of(null))
              )
            }).pipe(
              map(({ doctor, patient }) => ({
                appointment: appt,
                doctorName: formatDoctorName(doctor),
                specialization: doctor?.specialization || 'N/A',
                patient: patient
              }) as AppointmentWithDoctor)
            )
          );
          return forkJoin(requests);
        })
      )
      .subscribe({
        next: (rows) => {
          this.appointments = rows;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load appointments:', err);
          this.error = 'Failed to load your appointments. Please try again.';
          this.isLoading = false;
        }
      });
  }

  private fetchDoctorDetails(doctorId: string) {
    return this.http.get<DoctorDto>(`${environment.apiBaseUrl}/api/Doctor/${doctorId}`);
  }

  private fetchPatientDetails(patientId: string) {
    return this.http.get<PatientDto>(`${environment.apiBaseUrl}/api/Patient/${patientId}`);
  }

  onCancel(row: AppointmentWithDoctor): void {
    const id = row.appointment.appointmentId;
    if (!id) return;
    // Prevent cancel if already Cancelled or Completed
    if (row.appointment.status === 'Cancelled' || row.appointment.status === 'Completed') return;
    this.rowErrors[id] = null;
    this.isCancelling[id] = true;
    this.http.patch(`${environment.apiBaseUrl}/api/Appointments/${id}/cancel`, {})
      .subscribe({
        next: () => {
          row.appointment.status = 'Cancelled';
          this.isCancelling[id] = false;
        },
        error: (err) => {
          console.error('Cancel failed', err);
          this.rowErrors[id] = 'Failed to cancel. Please try again.';
          this.isCancelling[id] = false;
        }
      });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.webp';
    }
  }

  loadPatientProfile(patientId: string): void {
    this.http.get<any>(`${environment.apiBaseUrl}/api/Patient/${patientId}`).subscribe({
      next: (patient) => {
        this.patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
        this.patientImageUrl = patient.profilePicturePath
          ? `${environment.apiBaseUrl}/${patient.profilePicturePath.replace(/^\/+/, '')}`
          : 'assets/images/default-avatar.webp';
        // Print the profile path in the console
        console.log('Patient profile path:', patient.profilePicturePath);
      },
      error: () => {
        this.patientName = 'Patient';
        this.patientImageUrl = 'assets/images/default-avatar.webp';
        console.log('Patient profile path: not available');
      }
    });
  }
}


// DTOs
interface PatientDto {
  patientId: string;
  firstName: string;
  lastName: string;
  profilePicturePath?: string;
  // Add other patient fields as needed
}

interface AppointmentDto {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  consultationType: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface DoctorDto {
  title?: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface AppointmentWithDoctor {
  appointment: AppointmentDto;
  doctorName: string;
  specialization: string;
  patient?: PatientDto;
}

function formatDoctorName(doc?: DoctorDto | null): string {
  if (!doc) return 'Unknown Doctor';
  const prefix = doc.title && doc.title.trim().length > 0 ? doc.title : 'Dr.';
  return `${prefix} ${doc.firstName} ${doc.lastName}`.trim();
}

