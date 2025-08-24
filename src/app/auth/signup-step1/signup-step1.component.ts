import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthDataService } from '../../services/auth-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-signup-step1',
  templateUrl: './signup-step1.component.html',
  styleUrls: ['./signup-step1.component.css']
})
export class SignupStep1Component {
  isSubmitting = false;
  hidePassword = true;

  form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}:;"\'<>,.?/]).{8,}$'
        )
      ]
    ]
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
    this.auth.signupStep1(this.form.value as any).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.authData.setEmail(this.form.get('email')?.value as string);
        this.notifications.success('Registration successful. Please verify OTP.');
        this.router.navigateByUrl('/signup/verify-otp');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notifications.error('Registration failed');
      }
    });
  }
}


