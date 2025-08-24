import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthDataService {
  private emailValue: string | null = null;
  private resetTokenValue: string | null = null;

  setEmail(email: string): void {
    this.emailValue = email;
  }

  getEmail(): string | null {
    return this.emailValue;
  }

  clearEmail(): void {
    this.emailValue = null;
  }

  setResetToken(token: string): void {
    this.resetTokenValue = token;
  }

  getResetToken(): string | null {
    return this.resetTokenValue;
  }

  clearResetToken(): void {
    this.resetTokenValue = null;
  }
}


