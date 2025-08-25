import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of, switchMap } from 'rxjs';
import { AppointmentDto, AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { PatientDto, PatientService } from '../../services/patient.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


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

  // Add these properties
  isRecording = false;
  transcribing = false;
  mediaRecorder?: MediaRecorder;
  audioChunks: Blob[] = [];
  assemblyApiKey = '5d2d1ce8e34647f882e2a483615fe065'; // Replace with your key

  private sub?: Subscription;

    aiAnalyzing = false;

  @ViewChild('notesTextarea') notesTextarea!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private notification: NotificationService,
    private http: HttpClient
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

    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.sub = this.appointmentService
      .getAppointmentById(id)
      .pipe(
        switchMap((appointment) => {
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
          console.log('Appointment details loaded:', merged); // Add this
          this.data = merged;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load appointment details', err); // Add this
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
            this.data.notes = updated && updated.notes ? updated.notes : this.doctorNotes;
          }
          this.fetchDetails(this.data!.appointmentId); // <-- Refresh details after update
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

  // Toggle recording
  toggleRecording(): void {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.sendAudioToAssemblyAI(audioBlob);
      };
      this.mediaRecorder.start();
      this.isRecording = true;
    }).catch(err => {
      this.notification.error('Microphone access denied.');
    });
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      // After transcription is complete and doctorNotes is updated:
      setTimeout(() => {
        this.notesTextarea?.nativeElement.focus();
      }, 100); // slight delay to ensure text is updated
    }
  }

  sendAudioToAssemblyAI(audioBlob: Blob): void {
    this.transcribing = true;
    // Step 1: Upload audio
    const uploadHeaders = new HttpHeaders({
      'authorization': this.assemblyApiKey,
      'transfer-encoding': 'chunked'
    });
    this.http.post('https://api.assemblyai.com/v2/upload', audioBlob, { headers: uploadHeaders }).subscribe({
      next: (uploadRes: any) => {
        const audioUrl = uploadRes.upload_url;
        // Step 2: Request transcription
        const transcriptHeaders = new HttpHeaders({
          'authorization': this.assemblyApiKey,
          'content-type': 'application/json'
        });
        this.http.post('https://api.assemblyai.com/v2/transcript', { audio_url: audioUrl }, { headers: transcriptHeaders }).subscribe({
          next: (transcriptRes: any) => {
            this.pollTranscription(transcriptRes.id);
          },
          error: () => {
            this.transcribing = false;
            this.notification.error('Failed to start transcription.');
          }
        });
      },
      error: () => {
        this.transcribing = false;
        this.notification.error('Audio upload failed.');
      }
    });
  }

  // Step 3: Poll for transcription result
  pollTranscription(transcriptId: string): void {
    const headers = new HttpHeaders({ 'authorization': this.assemblyApiKey });
    const poll = () => {
      this.http.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, { headers }).subscribe({
        next: (res: any) => {
          if (res.status === 'completed') {
            this.doctorNotes += (this.doctorNotes ? '\n' : '') + res.text;
            this.transcribing = false;
            setTimeout(() => {
              this.notesTextarea?.nativeElement.focus();
            }, 100);
          } else if (res.status === 'failed') {
            this.transcribing = false;
            this.notification.error('Transcription failed.');
          } else {
            setTimeout(poll, 3000); // Poll every 3 seconds
          }
        },
        error: () => {
          this.transcribing = false;
          this.notification.error('Failed to poll transcription.');
        }
      });
    };
    poll();
  }

  analyzeNote(): void {
    if (!this.doctorNotes?.trim()) return;
    this.aiAnalyzing = true;
    this.http.post<{ analyzedNote: string }>(
      'https://localhost:5001/api/OpenAi/analyze-note',
      { note: this.doctorNotes }
    ).subscribe({
      next: (res) => {
        this.doctorNotes = res.analyzedNote;
        this.aiAnalyzing = false;
      },
      error: (err) => {
        this.notification.error('AI analysis failed');
        this.aiAnalyzing = false;
      }
    });
  }
}


