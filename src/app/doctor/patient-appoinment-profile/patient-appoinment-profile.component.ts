import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of, switchMap } from 'rxjs';
import { AppointmentDto, AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { PatientDto, PatientService } from '../../services/patient.service';
import { environment } from '../../../environments/environment';

type AppointmentDetailsViewModel = AppointmentDto & { patient?: PatientDto };

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-appoinment-profile.component.html',
  styleUrls: ['./patient-appoinment-profile.component.css']
})
export class PatientProfileComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  appointmentId: string | null = null;
  data: AppointmentDetailsViewModel | null = null;

  statusOptions: string[] = ['Accepted', 'Cancelled', 'Completed'];
  selectedStatus: string = '';
  doctorNotes: string = '';

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('id');
    if (!this.appointmentId) {
      this.error = 'Invalid appointment ID.';
      return;
    }
    this.fetchDetails(this.appointmentId);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  fetchDetails(id: string): void {
    this.loading = true;
    this.error = null;

    this.sub = this.appointmentService
      .getAppointmentById(id)
      .pipe(
        switchMap((appointment) => {
          // Initialize selected status
          this.selectedStatus = appointment.status;
          this.doctorNotes = appointment.notes || '';
          if (appointment.patientId) {
            return this.patientService.getByPatientId(appointment.patientId).pipe(
              switchMap((patient) => {
                const merged: AppointmentDetailsViewModel = { ...appointment, patient };
                return of(merged);
              })
            );
          }
          return of({ ...appointment } as AppointmentDetailsViewModel);
        })
      )
      .subscribe({
        next: (merged) => {
          this.data = merged;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load appointment details', err);
          this.error = 'Failed to load appointment details. Please try again.';
          this.loading = false;
        }
      });
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  calculateAge(dateString: string | undefined | null): string {
    if (!dateString) return '';
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age}`;
  }

  updateStatus(): void {
    if (!this.data?.appointmentId || !this.selectedStatus) {
      return;
    }
    this.loading = true;
    this.appointmentService
      .updateAppointmentStatus(this.data.appointmentId, this.selectedStatus)
      .subscribe({
        next: (updated) => {
          this.notification.success('Appointment status updated');
          this.fetchDetails(this.data!.appointmentId); // <-- Refresh details after update
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to update status', err);
          this.notification.error('Failed to update status');
          this.loading = false;
        }
      });
  }

  updateNotes(): void {
    if (!this.data?.appointmentId) {
      return;
    }
    this.loading = true;
    this.appointmentService
      .updateAppointmentNotes(this.data.appointmentId, this.doctorNotes)
      .subscribe({
        next: (updated) => {
          this.notification.success('Notes updated');
          if (this.data) {
            this.data.notes = updated.notes ?? this.doctorNotes;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to update notes', err);
          this.notification.error('Failed to update notes');
          this.loading = false;
        }
      });
  }

  backToDashboard(): void {
    this.router.navigate(['/appointments-dashboard']);
  }

  getPatientProfilePicture(): string {
    const path = this.data?.patient?.profilePicturePath?.replace(/^\/+/, '');
    if (path) {
      return `${environment.apiBaseUrl}/${path}`;
    }
    return 'assets/images/default-avatar.webp';
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.webp';
    }
  }
}


