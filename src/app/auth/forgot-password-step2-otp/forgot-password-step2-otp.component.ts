import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthDataService } from '../../services/auth-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-forgot-password-step2-otp',
  templateUrl: './forgot-password-step2-otp.component.html',
  styleUrls: ['./forgot-password-step2-otp.component.css']
})
export class ForgotPasswordStep2OtpComponent implements OnInit, OnDestroy {
  isSubmitting = false;
  email: string | null = null;
  resendDisabled = false;
  timer = 0;
  private resendInterval: any;

  otp: string[] = ['', '', '', '', '', ''];
  otpDigits = Array(6).fill(0);
  otpError: string | null = null;

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
      this.router.navigateByUrl('/forgot-password');
    }
    this.startResendTimer();
  }

  // Add this method to handle resend OTP
  resendOtp(): void {
    if (!this.email) return;
    this.resendDisabled = true;
    this.timer = 30; // 30 seconds cooldown
    this.auth.forgotPasswordInitiate({ email: this.email }).subscribe({
      next: () => {
        this.notifications.success('OTP resent to your email.');
        this.startResendTimer();
      },
      error: () => {
        this.notifications.error('Failed to resend OTP.');
        this.resendDisabled = false;
      }
    });
  }

  // Timer logic for resend button
  startResendTimer(): void {
    this.resendDisabled = true;
    this.timer = 30;
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
    this.resendInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.resendDisabled = false;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }

  checkOtpValue() {
    const otpControl = this.form.get('otp');
    const otpValue = otpControl?.value;
    console.log('OTP value:', otpValue);
    console.log('OTP length:', otpValue?.toString().length);
    console.log('OTP valid:', otpControl?.valid);
    console.log('OTP errors:', otpControl?.errors);
  }

  isOtpComplete(): boolean {
    return this.otp.every(digit => digit !== '');
  }

  submit(): void {
    if (!this.isOtpComplete()) {
      this.otpError = 'Please enter all 6 digits.';
      return;
    }
    this.otpError = null;
    const otpValue = this.otp.join('');
    if (!this.email) { return; }

    this.isSubmitting = true;
    this.auth.forgotPasswordVerifyOtp({ 
      email: this.email, 
      otp: otpValue
    }).subscribe({
      next: (res: any) => {
        const resetToken = res && res.resetToken ? String(res.resetToken) : '';
        if (resetToken) {
          this.authData.setResetToken(resetToken);
        }
        this.isSubmitting = false;
        this.notifications.success('OTP verified. Set your new password.');
        this.router.navigateByUrl('/forgot-password/complete');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notifications.error('Invalid OTP');
      }
    });
  }

  onOtpInput(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!/^\d?$/.test(value)) {
      input.value = '';
      return;
    }
    this.otp[index] = value;
    if (value && index < 5) {
      const nextInput = input.parentElement?.querySelectorAll('input')[index + 1];
      (nextInput as HTMLInputElement)?.focus();
    }
    if (!value && index > 0 && event.key === 'Backspace') {
      const prevInput = input.parentElement?.querySelectorAll('input')[index - 1];
      (prevInput as HTMLInputElement)?.focus();
    }
  }
}


