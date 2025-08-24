import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, DoctorCompleteRequest } from '../../services/auth.service';
import { AuthDataService } from '../../services/auth-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-signup-step3-complete',
  templateUrl: './signup-step3-complete.component.html',
  styleUrls: ['./signup-step3-complete.component.css']
})
export class SignupStep3CompleteComponent implements OnInit {
  isSubmitting = false;
  email: string | null = null;

  form = this.fb.group({
    phoneNumber: [null, [Validators.required]],
    dateOfBirth: ['', [Validators.required]],
    specialization: ['', [Validators.required]],
    licenseNumber: [null, [Validators.required]],
    department: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private authData: AuthDataService,
    private notifications: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.authData.getEmail();
    if (!this.email) {
      this.router.navigateByUrl('/signup');
    }
  }

  submit(): void {
    if (!this.email) { return; }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const payload: DoctorCompleteRequest = {
      email: this.email,
      phoneNumber: String(this.form.get('phoneNumber')?.value),
      dateOfBirth: new Date(this.form.get('dateOfBirth')?.value).toISOString(),
      specialization: this.form.get('specialization')?.value,
      licenseNumber: Number(this.form.get('licenseNumber')?.value),
      department: this.form.get('department')?.value
    };
    this.auth.registerDoctor(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notifications.success('Doctor registration complete. You can now log in.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.isSubmitting = false;
        const message = err?.error?.title || err?.error?.message || 'Could not complete doctor registration';
        this.notifications.error(message);
        // Optionally log the error for debugging
        console.error('Doctor registration error:', err);
      }
    });
  }
}


