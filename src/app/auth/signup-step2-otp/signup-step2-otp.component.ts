import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthDataService } from '../../services/auth-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-signup-step2-otp',
  templateUrl: './signup-step2-otp.component.html',
  styleUrls: ['./signup-step2-otp.component.css']
})
export class SignupStep2OtpComponent implements OnInit {
  isSubmitting = false;
  email: string | null = null;

  form = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^\\d{6}$')]]
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

  // Add diagnostic function
  checkOtpValue() {
    const otpControl = this.form.get('otp');
    const otpValue = otpControl?.value;
    console.log('OTP value:', otpValue);
    console.log('OTP length:', otpValue?.toString().length);
    console.log('OTP valid:', otpControl?.valid);
    console.log('OTP errors:', otpControl?.errors);
  }

  submit(): void {
    this.checkOtpValue(); // Add this to diagnose issues
    
    if (!this.email) { return; }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    
    // Explicitly convert OTP to string and trim
    const otpValue = this.form.get('otp')?.value;
    const otpString = otpValue ? String(otpValue).trim() : '';
    
    this.auth.signupVerifyOtp({ 
      email: this.email, 
      otp: otpString 
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notifications.success('OTP verified. Complete your profile.');
        this.router.navigateByUrl('/signup/complete');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notifications.error('Invalid OTP');
      }
    });
  }
}


