import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthDataService } from '../../services/auth-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-forgot-password-step3-complete',
  templateUrl: './forgot-password-step3-complete.component.html',
  styleUrls: ['./forgot-password-step3-complete.component.css']
})
export class ForgotPasswordStep3CompleteComponent implements OnInit {
  isSubmitting = false;
  email: string | null = null;
  resetToken: string | null = null;

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
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
    this.resetToken = this.authData.getResetToken();
    if (!this.email) {
      this.router.navigateByUrl('/forgot-password');
    }
  }

  submit(): void {
    if (!this.email || !this.resetToken) { return; }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const payload = {
      email: this.email,
      newPassword: this.form.get('newPassword')?.value as string,
      resetToken: this.resetToken
    };
    this.auth.forgotPasswordComplete(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notifications.success('Password reset successful. Please log in.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notifications.error('Failed to reset password');
      }
    });
  }
}


