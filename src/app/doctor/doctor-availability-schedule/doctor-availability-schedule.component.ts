import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

export interface AvailabilityData {
  doctorId: string;
}

@Component({
  selector: 'app-doctor-availability-schedule',
  templateUrl: './doctor-availability-schedule.component.html',
  styleUrls: ['./doctor-availability-schedule.component.css']
})
export class DoctorAvailabilityScheduleComponent implements OnInit {
  availabilityForm: FormGroup;
  currentMonth: Date = new Date();
  calendarDays: Date[] = [];
  slotDurationOptions = [10, 15, 20, 30, 60];
  loading = false;
  doctorId: string = ''; // Store doctorId here

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.availabilityForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      slotDuration: [30, Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateCalendarDays();
    this.fetchDoctorId(); // Fetch and store doctorId
  }

  private fetchDoctorId(): void {
    const userId = sessionStorage.getItem('user_id') || '';
    if (!userId) return;
    this.http.get<any>(`${environment.apiBaseUrl}/api/Doctor/user/${userId}`)
      .subscribe({
        next: doctor => {
          this.doctorId = doctor.doctorId || '';
          console.log('Doctor ID:', this.doctorId);
        },
        error: () => {
          this.doctorId = '';
        }
      });
  }

  openAvailabilityDialog(): void {
    // Use the stored doctorId directly
    const dialogRef = this.dialog.open(AvailabilityDialogComponent, {
      width: '500px',
      data: { doctorId: this.doctorId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Availability scheduled:', result);
      }
    });
  }

  private generateCalendarDays(): void {
    // This method is for the main component calendar view
    // The dialog will have its own calendar implementation
  }
}

@Component({
  selector: 'app-availability-dialog',
  templateUrl: './availability-dialog.component.html',
  styleUrls: ['./availability-dialog.component.css']
})
export class AvailabilityDialogComponent implements OnInit {
  availabilityForm: FormGroup;
  selectedDates: Date[] = []; // Store multiple selected dates
  currentMonth: Date = new Date();
  calendarDays: Date[] = [];
  slotDurationOptions = [10, 15, 20, 30, 60];
  loading = false;
  doctorId: string = '';
  scheduledDates: Date[] = [];
  scheduledAvailabilities: any[] = [];
  scheduledSlotInfo: any = null;
  availableTimeSlots: TimeSlot[] = [];
  selectedDate: Date | null = null;

  @ViewChild('slotsSection') slotsSection!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AvailabilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AvailabilityData
  ) {
    this.availabilityForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      slotDuration: [30, Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateCalendarDays();
    this.fetchScheduledDates();
  }

  fetchScheduledDates(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/api/DoctorAvailabilities/Doctor/${this.data.doctorId}`)
      .subscribe({
        next: (availabilities) => {
          this.scheduledAvailabilities = availabilities;
          this.scheduledDates = availabilities.map(a => new Date(a.availableDate));
        },
        error: () => {
          this.scheduledAvailabilities = [];
          this.scheduledDates = [];
        }
      });
  }

  isScheduledDate(date: Date): boolean {
    return this.scheduledDates.some(d => d.toDateString() === date.toDateString());
  }

  private fetchDoctorId(): void {
    const userId = sessionStorage.getItem('user_id') || '';
    if (!userId) return;
    this.http.get<any>(`${environment.apiBaseUrl}/api/Doctor/user/${userId}`)
      .subscribe({
        next: doctor => {
          this.doctorId = doctor.doctorId || '';
        },
        error: () => {
          this.doctorId = '';
        }
      });
  }

  generateCalendarDays(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      this.calendarDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  previousMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendarDays();
  }

  // Toggle date selection
  toggleDateSelection(date: Date): void {
    if (this.isScheduledDate(date)) {
      const slot = this.scheduledAvailabilities.find(a => new Date(a.availableDate).toDateString() === date.toDateString());
      if (slot) {
        this.scheduledSlotInfo = slot;
        this.selectedDate = date;
        this.generateTimeSlots(date);
        this.snackBar.open('This date is already scheduled. See slot details below.', 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        // Scroll to slots section after a short delay
        setTimeout(() => {
          this.slotsSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
      return;
    }
    this.scheduledSlotInfo = null;
    this.selectedDate = null;
    const idx = this.selectedDates.findIndex(d => d.toDateString() === date.toDateString());
    if (idx > -1) {
      this.selectedDates.splice(idx, 1);
    } else if (!this.isPastDate(date)) {
      this.selectedDates.push(date);
    }
  }

  isSelectedDate(date: Date): boolean {
    return this.selectedDates.some(d => d.toDateString() === date.toDateString());
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  getMonthName(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

  onSubmit(): void {
    if (this.availabilityForm.valid && this.selectedDates.length > 0) {
      this.loading = true;

      const formValue = this.availabilityForm.value;
      const requests = this.selectedDates.map(date => {
        const payload = {
          doctorId: this.data.doctorId,
          availableDate: date.getFullYear() + '-' +
                         String(date.getMonth() + 1).padStart(2, '0') + '-' +
                         String(date.getDate()).padStart(2, '0'),
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          slotDuration: formValue.slotDuration
        };
        return this.http.post(`${environment.apiBaseUrl}/api/DoctorAvailabilities`, payload);
      });

      Promise.all(requests.map(req => req.toPromise()))
        .then(responses => {
          this.snackBar.open('Availability scheduled successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loading = false;
          this.dialogRef.close(responses);
        })
        .catch(error => {
          this.snackBar.open('Failed to schedule availability. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loading = false;
        });
    } else {
      this.snackBar.open('Please fill in all required fields and select at least one date.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  // Validation
  isFormValid(): boolean {
    return this.availabilityForm.valid && this.selectedDates.length > 0;
  }

  // Check for duplicate and submit for all dates
  checkAndSubmitAvailability(): void {
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all required fields and select at least one date.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }
    this.loading = true;
    // Fetch all availabilities for this doctor
    this.http.get<any[]>(`${environment.apiBaseUrl}/api/DoctorAvailabilities/Doctor/${this.data.doctorId}`)
      .subscribe({
        next: (availabilities) => {
          // Filter out already scheduled dates
          const alreadyScheduledDates = this.selectedDates.filter(date =>
            availabilities.some(a => new Date(a.availableDate).toDateString() === date.toDateString())
          );
          if (alreadyScheduledDates.length > 0) {
            this.snackBar.open('Some selected dates already have scheduled availability.', 'Close', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loading = false;
            return;
          }
          // Submit for each selected date
          const formValue = this.availabilityForm.value;
          const requests = this.selectedDates.map(date => {
            const payload = {
              doctorId: this.data.doctorId,
              availableDate: date.getFullYear() + '-' +
                             String(date.getMonth() + 1).padStart(2, '0') + '-' +
                             String(date.getDate()).padStart(2, '0'),
              startTime: formValue.startTime,
              endTime: formValue.endTime,
              slotDuration: formValue.slotDuration
            };
            return this.http.post(`${environment.apiBaseUrl}/api/DoctorAvailabilities`, payload);
          });
          // Send all requests
          Promise.all(requests.map(req => req.toPromise()))
            .then(responses => {
              this.snackBar.open('Availability scheduled successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.loading = false;
              this.dialogRef.close(responses);
            })
            .catch(error => {
              this.snackBar.open('Failed to schedule availability. Please try again.', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.loading = false;
            });
        },
        error: (error) => {
          this.snackBar.open('Error fetching doctor availability.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  generateTimeSlots(date: Date): void {
    const dateString = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    const availability = this.scheduledAvailabilities.find(av =>
      av.availableDate.split('T')[0] === dateString
    );

    if (!availability) {
      this.availableTimeSlots = [];
      return;
    }

    const slots: TimeSlot[] = [];
    const startTime = new Date(`2000-01-01T${availability.startTime}`);
    const endTime = new Date(`2000-01-01T${availability.endTime}`);
    const slotDuration = availability.slotDuration;

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().substring(0, 5);
      slots.push({
        time: timeString,
        available: true,
        slotId: `${availability.availabilityId}-${timeString}`
      });
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }
    this.availableTimeSlots = slots;
  }

  removeAvailability(availId: string): void {
    this.http.delete(`${environment.apiBaseUrl}/api/DoctorAvailabilities/${availId}`)
      .subscribe({
        next: () => {
          this.snackBar.open('Availability removed successfully.', 'Close', { duration: 2000 });
          this.scheduledSlotInfo = null;
          this.selectedDate = null;
          this.fetchScheduledDates(); // Refresh calendar after deletion
        },
        error: () => {
          this.snackBar.open('Failed to remove availability.', 'Close', { duration: 2000 });
        }
      });
  }
}

interface TimeSlot {
  time: string;
  available: boolean;
  slotId: string;
}
