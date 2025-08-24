import { Component, OnInit } from '@angular/core';
import { AppointmentService, AppointmentWithPatientDto } from '../../services/appointment.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-appointments-dashboard',
  templateUrl: './appointments-dashboard.component.html',
  styleUrls: ['./appointments-dashboard.component.css']
})
export class AppointmentsDashboardComponent implements OnInit {
  appointments: AppointmentWithPatientDto[] = [];
  loading = false;
  error: string | null = null;
  doctorId: string | null = null;
  noAppointments = false;

  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDoctorId();
  }

  loadDoctorId(): void {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      this.error = 'Session expired. Please log in again.';
      return;
    }

    // Get doctor details using userId
    this.http.get<any>(`${environment.apiBaseUrl}/api/Doctor/user/${userId}`)
      .subscribe({
        next: doctor => {
          this.doctorId = doctor.doctorId;
          if (!this.doctorId) {
            this.error = 'Doctor ID not found.';
            return;
          }
          // Now fetch appointments for this doctor
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error fetching doctor details:', error);
          this.error = 'Failed to fetch doctor details. Please try again.';
        }
      });
  }

  loadAppointments(): void {
    if (!this.doctorId) {
      this.loading = false;
      this.error = 'Doctor ID not found.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.noAppointments = false;
    this.appointmentService.getAppointmentsWithPatientDetails(this.doctorId).subscribe({
      next: (appointments) => {
        // Sort: scheduled/accepted first, then by nearest appointmentDate
        this.appointments = (appointments || []).sort((a, b) => {
          const statusPriority = (status: string) =>
            status.toLowerCase() === 'scheduled' || status.toLowerCase() === 'accepted' ? 1 : 0;
          const priorityDiff = statusPriority(b.status) - statusPriority(a.status);
          if (priorityDiff !== 0) return priorityDiff;

          // If same priority, sort by nearest appointmentDate (ascending)
          const dateA = new Date(a.appointmentDate).getTime();
          const dateB = new Date(b.appointmentDate).getTime();
          return dateA - dateB;
        });
        this.loading = false;
        this.noAppointments = this.appointments.length === 0;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load appointments. Please try again.';
        this.appointments = [];
        this.noAppointments = false;
      }
    });
  }

  getPatientFullName(appointment: AppointmentWithPatientDto): string {
    return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  }

  getAppointmentTime(appointment: AppointmentWithPatientDto): string {
    return `${appointment.startTime} - ${appointment.endTime}`;
  }

  getPatientProfilePicture(appointment: AppointmentWithPatientDto): string {
    if (appointment.patient.profilePicturePath) {
      // Remove any leading slashes for consistency
      const path = appointment.patient.profilePicturePath.replace(/^\/+/, '');
      return `${environment.apiBaseUrl}/${path}`;
    }
    return 'assets/images/default-avatar.webp';
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'accepted':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.webp';
    }
  }

  logPatientInfo(row: AppointmentWithPatientDto): void {
    console.log('Patient:', row.patient);
  }
}
