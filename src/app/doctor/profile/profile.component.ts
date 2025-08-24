import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';

interface Qualification {
  specializationName: string;
}

interface Doctor {
  doctorId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  specialization: string;
  licenseNumber: number;
  department: string;
  title: string;
  description: string;
  profilePicturePath: string;
  qualifications: Qualification[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  userId: string | null = null;
  doctorId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  profileImageUrl: string = 'assets/images/default-avatar.png';
  selectedFile: File | null = null;
  username: string = '';
  imageError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notifications: NotificationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      specialization: ['', Validators.required],
      department: ['', Validators.required],
      profilePicturePath: [''],
      qualifications: [''],
      description: [''] // <-- Add this line
    });
  }

  ngOnInit(): void {
    this.userId = sessionStorage.getItem('user_id');
    if (this.userId) {
      this.loadDoctorData();
    }
  }

  loadDoctorData(): void {
    if (!this.userId) return;

    this.isLoading = true;
    const url = `${environment.apiBaseUrl}/api/Doctor/user/${this.userId}`;
    
    this.http.get<Doctor>(url).subscribe({
      next: (data) => {
        this.doctorId = data.doctorId;
        this.username = `${data.firstName || ''} ${data.lastName || ''}`.trim();

        this.populateForm(data);

        if (data.profilePicturePath) {
          const path = data.profilePicturePath.startsWith('/') ? data.profilePicturePath.substring(1) : data.profilePicturePath;
          this.profileImageUrl = `${environment.apiBaseUrl}/${path}`;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading doctor data:', err);
        this.notifications.error('Failed to load profile data');
        this.isLoading = false;
      }
    });
  }

  populateForm(doctor: Doctor): void {
    this.profileForm.patchValue({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      username: doctor.username,
      phoneNumber: doctor.phoneNumber,
      specialization: doctor.specialization,
      department: doctor.department,
      profilePicturePath: doctor.profilePicturePath,
      qualifications: Array.isArray(doctor.qualifications)
        ? doctor.qualifications
            .map((q: Qualification) => q.specializationName || '')
            .filter(q => !!q)
            .join(', ')
        : '',
      description: doctor.description || '' // <-- Add this line
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (file.size > maxSize) {
      this.imageError = 'Image size must be less than 2MB.';
      return;
    }

    this.imageError = null;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  handleImageError(): void {
    this.profileImageUrl = 'assets/images/default-avatar.webp';
  }

  submit(): void {
    if (this.profileForm.invalid || !this.doctorId) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('firstName', this.profileForm.get('firstName')?.value);
    formData.append('lastName', this.profileForm.get('lastName')?.value);
    formData.append('username', this.profileForm.get('username')?.value);
    formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value);
    formData.append('specialization', this.profileForm.get('specialization')?.value);
    formData.append('department', this.profileForm.get('department')?.value);

    // Profile picture upload (if changed)
    if (this.selectedFile) {
      formData.append('ProfilePicture', this.selectedFile, this.selectedFile.name);
    } else {
      formData.append('profilePicturePath', this.profileForm.get('profilePicturePath')?.value || '');
    }

    // Qualifications: send as JSON array of objects
    const qualifications = (this.profileForm.get('qualifications')?.value || '')
      .split(',')
      .map((q: string) => q.trim())
      .filter((q: string) => q)
      .map((q: string) => ({ SpecializationName: q })); // <-- Use SpecializationName

    formData.append('QualificationsJson', JSON.stringify(qualifications));
    formData.append('description', this.profileForm.get('description')?.value || '');

    this.http.put(`${environment.apiBaseUrl}/api/Doctor/${this.doctorId}`, formData)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.notifications.success('Profile updated successfully!');
          this.loadDoctorData(); // Refresh profile data after update
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notifications.error('Failed to update profile');
          console.error('Profile update error:', err);
        }
      });
  }
}

