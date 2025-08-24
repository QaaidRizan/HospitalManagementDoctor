import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSubmitting = false;
  hidePassword = true;

  form = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private notifications: NotificationService, 
    private router: Router,
    private http: HttpClient
  ) {}

  private extractUserId(token: string): string | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const json = atob(padded);
      const payload = JSON.parse(json);

      // Direct simple keys
      if (payload.userId) return payload.userId;
      if (payload.sub) return payload.sub;
      if (payload.nameid) return payload.nameid;

      // .NET style URI claim (your token uses this)
      const nameIdKey = Object.keys(payload).find(k => k.endsWith('/nameidentifier'));
      if (nameIdKey) return payload[nameIdKey];

      return null;
    } catch {
      return null;
    }
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const body = {
      identifier: this.form.value.identifier?.trim(),
      password: this.form.value.password
    };

    if (body.identifier && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.identifier)) {
      body.identifier = body.identifier.toLowerCase();
    }

    this.http.post<{ token: string }>(`${environment.apiBaseUrl}/api/Auth/login`, body)
      .subscribe({
        next: res => {
          sessionStorage.setItem('auth_token', res.token); // changed to sessionStorage
          console.log('Auth token:', res.token);  
          const userId = this.extractUserId(res.token);
            if (userId) {
              sessionStorage.setItem('user_id', userId);
              console.log('User ID:', userId);
            } else {
              console.warn('User ID not found in token claims');
            }
          this.notifications.success('Logged in successfully');
          this.router.navigate(['/appointments-dashboard']);
        },
        error: err => {
          const msg = err.status === 401 ? 'Invalid credentials' : 'Login failed';
          this.notifications.error(msg);
        }
      }).add(() => this.isSubmitting = false);
  }
}


