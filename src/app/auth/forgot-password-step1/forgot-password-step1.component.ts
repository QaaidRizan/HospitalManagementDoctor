import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthDataService } from '../../services/auth-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-forgot-password-step1',
  templateUrl: './forgot-password-step1.component.html',
  styleUrls: ['./forgot-password-step1.component.css']
})
export class ForgotPasswordStep1Component {
  isSubmitting = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private authData: AuthDataService,
    private notifications: NotificationService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const email = this.form.get('email')?.value as string;
    this.auth.forgotPasswordInitiate({ email }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.authData.setEmail(email);
        this.notifications.success('OTP sent to your email');
        this.router.navigateByUrl('/forgot-password/verify-otp');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notifications.error('Failed to initiate reset');
      }
    });
  }
}


